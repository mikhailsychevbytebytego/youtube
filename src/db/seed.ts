import { eq, sql } from "drizzle-orm";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getTextEmbedding, getImageEmbedding } from "../lib/clip";

import { channels, db, shorts, users, videos, views } from "./index";

/**
 * Idempotent seed for the MeowTube catalog. Mirrors the mock data that used to
 * live in `src/lib/*-data.ts`. Run with `npm run db:seed`.
 *
 * The dataset is inlined (rather than imported from the lib files) so this
 * script stays decoupled from the React/Next runtime and is safe to run in a
 * plain Node process.
 */

type SeedVideo = {
  slug: string;
  title: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  duration?: string;
  likes?: string;
  description?: string;
};

type SeedShort = {
  slug: string;
  title: string;
  views: string;
  thumbnail: string;
};

type SeedChannel = {
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  description: string;
  subscribers: string;
  videos: SeedVideo[];
  shorts: SeedShort[];
};

const FALLBACK_AVATAR = "/meowtube/profile.png";
const FALLBACK_BANNER = "/meowtube/channel/banner.png";

const channelData: SeedChannel[] = [
  {
    name: "The Daily Purr",
    handle: "@TheDailyPurr",
    avatar: "/meowtube/channel/avatar.png",
    banner: "/meowtube/channel/banner.png",
    description:
      "Daily dose of paws, purrs, and whiskers. Join our community of cat lovers for the fluffiest content on MeowTube.",
    subscribers: "4.2M",
    videos: [
      { slug: "vacuum-cleaner", title: "Kitten's first time seeing a vacuum cleaner", views: "1.2M", publishedAt: "2 days ago", thumbnail: "/meowtube/channel/ch-thumb-1.png" },
      { slug: "gourmet-meal", title: "Gourmet meal prep for a very fancy cat", views: "850K", publishedAt: "1 week ago", thumbnail: "/meowtube/channel/ch-thumb-2.png" },
      { slug: "hiding-spots", title: "Top 10 hiding spots in this cardboard box", views: "2.4M", publishedAt: "3 days ago", thumbnail: "/meowtube/channel/ch-thumb-3.png" },
      { slug: "sunbeam-naps", title: "Sunday morning sunbeam naps", views: "500K", publishedAt: "12 hours ago", thumbnail: "/meowtube/channel/ch-thumb-4.png" },
      { slug: "laser-dot", title: "The mystery of the red laser dot", views: "3.1M", publishedAt: "1 month ago", thumbnail: "/meowtube/channel/ch-thumb-5.png" },
      { slug: "cat-tree", title: "Cat tree construction gone wrong", views: "120K", publishedAt: "5 hours ago", thumbnail: "/meowtube/channel/ch-thumb-6.png" },
      { slug: "bird-watching", title: "Bird watching through the window 4K", views: "4.5M", publishedAt: "2 weeks ago", thumbnail: "/meowtube/channel/ch-thumb-7.png" },
      { slug: "cat-thinks-dog", title: "Why my cat thinks he's a dog", views: "900K", publishedAt: "4 days ago", thumbnail: "/meowtube/channel/ch-thumb-8.png" },
    ],
    shorts: [
      { slug: "zoomies", title: "Zoomies at 3am", views: "12M", thumbnail: "/meowtube/channel/ch-short-1.png" },
      { slug: "big-yawn", title: "Big yawn!", views: "5.4M", thumbnail: "/meowtube/channel/ch-short-2.png" },
      { slug: "target-acquired", title: "Target acquired", views: "8.1M", thumbnail: "/meowtube/channel/ch-short-3.png" },
      { slug: "stealing-snacks", title: "Stealing snacks", views: "2.2M", thumbnail: "/meowtube/channel/ch-short-4.png" },
      { slug: "snow-day", title: "Snow day", views: "1.8M", thumbnail: "/meowtube/channel/ch-short-5.png" },
      { slug: "short-1", title: "Wait for it... 😂", views: "12M", thumbnail: "/meowtube/short-1.png" },
      { slug: "short-2", title: "Bless you! ❤️", views: "45M", thumbnail: "/meowtube/short-2.png" },
      { slug: "short-3", title: "Drift cat", views: "8.2M", thumbnail: "/meowtube/short-3.png" },
      { slug: "short-4", title: "I don't need humans", views: "2.1M", thumbnail: "/meowtube/short-4.png" },
      { slug: "short-5", title: "Mood right now", views: "15M", thumbnail: "/meowtube/short-5.png" },
      { slug: "short-6", title: "Target locked", views: "3.4M", thumbnail: "/meowtube/short-6.png" },
    ],
  },
  {
    name: "Box King",
    handle: "@BoxKing",
    avatar: "/meowtube/avatar-1.png",
    description: "If it fits, we sit. The premier destination for cardboard box reviews.",
    subscribers: "2.1M",
    videos: [
      { slug: "box-challenge-1", title: "If I Fits, I Sits: The Box Challenge", views: "1.2M", publishedAt: "2 days ago", thumbnail: "/meowtube/thumb-1.png" },
      { slug: "box-challenge-2", title: "If I Fits, I Sits: The Box Challenge", views: "1.2M", publishedAt: "2 days ago", thumbnail: "/meowtube/thumb-7.png" },
    ],
    shorts: [],
  },
  {
    name: "Cat Shows Live",
    handle: "@CatShowsLive",
    avatar: "/meowtube/avatar-2.png",
    description: "Live coverage of the world's most prestigious cat competitions.",
    subscribers: "900K",
    videos: [
      { slug: "grand-meow-1", title: "Grand Meow Championship 2024 - Finals", views: "542K", publishedAt: "5 hours ago", thumbnail: "/meowtube/thumb-2.png" },
      { slug: "grand-meow-2", title: "Grand Meow Championship 2024 - Finals", views: "542K", publishedAt: "5 hours ago", thumbnail: "/meowtube/thumb-8.png" },
    ],
    shorts: [],
  },
  {
    name: "Grumpy Cat TV",
    handle: "@GrumpyCatTV",
    avatar: "/meowtube/avatar-3.png",
    description: "No. Just no. Your daily source of disapproving stares.",
    subscribers: "8.9M",
    videos: [
      { slug: "grumpy-guide", title: "The Ultimate Guide to Grumpy Meows", views: "8.9M", publishedAt: "1 year ago", thumbnail: "/meowtube/thumb-3.png" },
    ],
    shorts: [],
  },
  {
    name: "Calm Cats",
    handle: "@CalmCats",
    avatar: "/meowtube/avatar-4.png",
    description: "Relaxing, slow-TV style cat content to soothe your soul.",
    subscribers: "2.1M",
    videos: [
      { slug: "cat-watching-24h", title: "24 Hours of Cat Watching - Relaxing", views: "2.1M", publishedAt: "3 weeks ago", thumbnail: "/meowtube/thumb-4.png" },
    ],
    shorts: [],
  },
  {
    name: "Meow Expert",
    handle: "@MeowExpert",
    avatar: "/meowtube/avatar-5.png",
    description: "Deep dives into feline science and the occasional space mission.",
    subscribers: "150K",
    videos: [
      { slug: "space-cats", title: "Space Cats: The Final Meowfrontier", views: "150K", publishedAt: "1 day ago", thumbnail: "/meowtube/thumb-5.png" },
    ],
    shorts: [],
  },
  {
    name: "Creamy Paws",
    handle: "@CreamyPaws",
    avatar: "/meowtube/avatar-6.png",
    description: "Epic yarn adventures and toe-bean appreciation.",
    subscribers: "3.4M",
    videos: [
      { slug: "yarn-wars", title: "Yarn Wars: The Fluff Awakens", views: "3.4M", publishedAt: "6 months ago", thumbnail: "/meowtube/thumb-6.png" },
    ],
    shorts: [],
  },
  {
    name: "Whiskers Wonders",
    handle: "@WhiskersWonders",
    avatar: "/meowtube/watch/w-channel.png",
    description: "Heart-warming kitten discoveries and curious whisker moments.",
    subscribers: "1.3M",
    videos: [
      {
        slug: "tiny-kitten-box",
        title: "Tiny Kitten Discovers a Cardboard Box",
        views: "1.3M",
        publishedAt: "2 weeks ago",
        thumbnail: "/meowtube/watch/w-player.png",
        duration: "3:45",
        likes: "142K",
        description:
          "This little furball spent hours exploring his first box! We couldn't stop filming his reaction. Check out the whiskers and the jumps.",
      },
      { slug: "why-high-places", title: "Why Cats Love High Places", views: "120K", publishedAt: "5 days ago", thumbnail: "/meowtube/watch/rec-4.png" },
    ],
    shorts: [],
  },
  {
    name: "Kitty Care",
    handle: "@KittyCare",
    avatar: FALLBACK_AVATAR,
    description: "Grooming, nutrition, and everything to keep your cat fluffy.",
    subscribers: "500K",
    videos: [
      { slug: "grooming-guide", title: "Grooming Guide: Keeping your cat fluffy", views: "45K", publishedAt: "1 year ago", thumbnail: "/meowtube/watch/rec-1.png" },
    ],
    shorts: [],
  },
  {
    name: "Funny Felines",
    handle: "@FunnyFelines",
    avatar: FALLBACK_AVATAR,
    description: "The funniest cat reactions on the internet.",
    subscribers: "800K",
    videos: [
      { slug: "cat-mirror", title: "Cat Reacts to Mirror for the first time", views: "892K", publishedAt: "3 months ago", thumbnail: "/meowtube/watch/rec-2.png" },
    ],
    shorts: [],
  },
  {
    name: "ReelCats",
    handle: "@ReelCats",
    avatar: FALLBACK_AVATAR,
    description: "Ultimate cat reel compilations, updated weekly.",
    subscribers: "2.1M",
    videos: [
      { slug: "cat-reel-compilation", title: "Ultimate Cat Reel Compilation 2024", views: "2.1M", publishedAt: "2 weeks ago", thumbnail: "/meowtube/watch/rec-3.png" },
    ],
    shorts: [],
  },
  {
    name: "Wild At Home",
    handle: "@WildAtHome",
    avatar: FALLBACK_AVATAR,
    description: "Bengals, Savannahs, and the wild side of house cats.",
    subscribers: "56K",
    videos: [
      { slug: "bengal-first-walk", title: "Bengal Kitten's First Walk Outside", views: "56K", publishedAt: "8 hours ago", thumbnail: "/meowtube/watch/rec-5.png" },
    ],
    shorts: [],
  },
  {
    name: "Purrfect Info",
    handle: "@PurrfectInfo",
    avatar: FALLBACK_AVATAR,
    description: "Explaining cat behavior, one nap at a time.",
    subscribers: "1.5M",
    videos: [
      { slug: "sleeping-positions", title: "Sleeping positions and what they mean", views: "1.5M", publishedAt: "2 years ago", thumbnail: "/meowtube/watch/rec-6.png" },
    ],
    shorts: [],
  },
];

const extraViewers = [
  { name: "CatLover99", handle: "@CatLover99", email: "catlover99@meowtube.cat", image: "/meowtube/watch/w-commenter.png" },
  { name: "Whisker Fan", handle: "@WhiskerFan", email: "whiskerfan@meowtube.cat", image: "/meowtube/avatar-8.png" },
];

function seedFinishedViewCount(viewsLabel: string): number {
  return Math.min(parseCount(viewsLabel), 100);
}

function parseCount(value: string): number {
  const match = value.match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] ?? "").toUpperCase();
  const multiplier =
    suffix === "B" ? 1_000_000_000 : suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  return Math.round(num * multiplier);
}

function parseRelative(value: string): Date {
  const match = value.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/i);
  const now = Date.now();
  if (!match) return new Date(now);
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const seconds: Record<string, number> = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86_400,
    week: 604_800,
    month: 2_592_000,
    year: 31_536_000,
  };
  return new Date(now - amount * (seconds[unit] ?? 0) * 1000);
}

function parseDuration(value?: string): number {
  if (!value) return 0;
  const parts = value.split(":").map((p) => parseInt(p, 10));
  return parts.reduce((acc, part) => acc * 60 + (Number.isNaN(part) ? 0 : part), 0);
}

/** Deterministic-ish duration for videos that don't specify one. */
function fallbackDuration(slug: string): number {
  return 90 + (slug.length * 37) % 540;
}

async function seed() {
  console.log("Truncating existing data...");
  await db.execute(
    sql`TRUNCATE TABLE views, users, channels, videos, shorts, session, account, verification RESTART IDENTITY CASCADE;`,
  );

  let videoCount = 0;
  let shortCount = 0;

  for (const def of channelData) {
    const handleNoAt = def.handle.replace(/^@/, "");
    const subscriberCount = parseCount(def.subscribers);

    const [owner] = await db
      .insert(users)
      .values({
        email: `${handleNoAt.toLowerCase()}@meowtube.cat`,
        name: `${def.name} HQ`,
        handle: `@${handleNoAt}_owner`,
        image: def.avatar,
      })
      .returning({ id: users.id });

    const [channel] = await db
      .insert(channels)
      .values({
        ownerId: owner.id,
        name: def.name,
        handle: def.handle,
        description: def.description,
        avatarUrl: def.avatar,
        bannerUrl: def.banner ?? FALLBACK_BANNER,
        subscriberCount,
      })
      .returning({ id: channels.id });
  }

  if (extraViewers.length > 0) {
    await db.insert(users).values(extraViewers);
  }

  // Restore cached AI videos if any exist
  let cachedVideoCount = 0;
  let cachedShortCount = 0;
  const cacheDir = path.join(process.cwd(), "ai-cache");

  if (existsSync(cacheDir)) {
    console.log("Found ai-cache folder, starting restoration of AI videos...");
    const subdirs = await readdir(cacheDir, { withFileTypes: true });

    for (const entry of subdirs) {
      if (!entry.isDirectory()) continue;

      const slugDir = path.join(cacheDir, entry.name);
      const metadataPath = path.join(slugDir, "metadata.json");

      if (!existsSync(metadataPath)) continue;

      try {
        const metadataRaw = await readFile(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataRaw);

        // Find the newly seeded channel matching channelHandle
        const [channel] = await db
          .select({ id: channels.id })
          .from(channels)
          .where(eq(channels.handle, metadata.channelHandle))
          .limit(1);

        if (!channel) {
          console.warn(`[Cache Restore] Skip ${metadata.slug}: channel ${metadata.channelHandle} not found.`);
          continue;
        }

        if (metadata.format === "short") {
          await db.insert(shorts).values({
            channelId: channel.id,
            slug: metadata.slug,
            title: metadata.title,
            videoUrl: metadata.videoUrl,
            thumbnailUrl: metadata.thumbnailUrl,
            durationSeconds: metadata.durationSeconds,
            likeCount: metadata.likeCount ?? 0,
            titleEmbedding: metadata.embeddings?.titleEmbedding,
            thumbnailEmbedding: metadata.embeddings?.thumbnailEmbedding,
            publishedAt: new Date(metadata.publishedAt),
          });
          cachedShortCount++;
        } else {
          await db.insert(videos).values({
            channelId: channel.id,
            slug: metadata.slug,
            title: metadata.title,
            description: metadata.description,
            videoUrl: metadata.videoUrl,
            thumbnailUrl: metadata.thumbnailUrl,
            durationSeconds: metadata.durationSeconds,
            likeCount: metadata.likeCount ?? 0,
            titleEmbedding: metadata.embeddings?.titleEmbedding,
            descriptionEmbedding: metadata.embeddings?.descriptionEmbedding,
            thumbnailEmbedding: metadata.embeddings?.thumbnailEmbedding,
            publishedAt: new Date(metadata.publishedAt),
          });
          cachedVideoCount++;
        }
      } catch (err) {
        console.error(`Failed to restore cached video in ${entry.name}:`, err);
      }
    }
  }

  console.log(
    `Seeded ${channelData.length} channels and ${channelData.length + extraViewers.length} users.`
  );
  if (cachedVideoCount > 0 || cachedShortCount > 0) {
    console.log(
      `Restored from cache: ${cachedVideoCount} videos, ${cachedShortCount} shorts.`
    );
  } else {
    console.log("Restored 0 videos (no cache found or cache is empty).");
  }
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
