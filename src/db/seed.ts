import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { db } from "./index";
import { accounts, channels, users, videos, watchEvents, type NewVideo } from "./schema";

function ago({
  minutes = 0,
  hours = 0,
  days = 0,
  weeks = 0,
  months = 0,
  years = 0,
}: {
  minutes?: number;
  hours?: number;
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}): Date {
  const ms =
    minutes * 60_000 +
    hours * 3_600_000 +
    (days + weeks * 7 + months * 30 + years * 365) * 86_400_000;
  return new Date(Date.now() - ms);
}

/** Parses "M:SS" or "H:MM:SS" into seconds. */
function dur(text: string): number {
  return text
    .split(":")
    .reduce((total, part) => total * 60 + Number.parseInt(part, 10), 0);
}

type SeedVideo = Omit<NewVideo, "channelId">;

type SeedChannel = {
  name: string;
  handle: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscriberCount: number;
  videos: SeedVideo[];
};

const seedChannels: SeedChannel[] = [
  {
    name: "Box King",
    handle: "@boxking",
    avatarUrl: "/images/avatar-box-king.png",
    subscriberCount: 3_200_000,
    videos: [
      {
        title: "If I Fits, I Sits: The Box Challenge",
        thumbnailUrl: "/images/thumb-box-challenge.png",
        viewCount: 1_200_000,
        likeCount: 38_000,
        durationSeconds: dur("8:24"),
        publishedAt: ago({ days: 2 }),
      },
      {
        title: "If I Fits, I Sits: The Box Challenge",
        thumbnailUrl: "/images/thumb-box-challenge-2.png",
        viewCount: 1_200_000,
        likeCount: 35_000,
        durationSeconds: dur("8:24"),
        publishedAt: ago({ days: 2, hours: 1 }),
      },
      {
        title: "Drift cat",
        type: "short",
        thumbnailUrl: "/images/short-drift-cat.png",
        viewCount: 8_200_000,
        likeCount: 410_000,
        durationSeconds: dur("0:22"),
        publishedAt: ago({ days: 5 }),
      },
    ],
  },
  {
    name: "Cat Shows Live",
    handle: "@catshowslive",
    avatarUrl: "/images/avatar-cat-shows-live.png",
    subscriberCount: 1_900_000,
    videos: [
      {
        title: "Grand Meow Championship 2024 - Finals",
        thumbnailUrl: "/images/thumb-meow-championship.png",
        viewCount: 542_000,
        likeCount: 21_000,
        durationSeconds: dur("2:15:36"),
        publishedAt: ago({ hours: 5 }),
      },
      {
        title: "Grand Meow Championship 2024 - Finals",
        thumbnailUrl: "/images/thumb-meow-championship-2.png",
        viewCount: 542_000,
        likeCount: 19_000,
        durationSeconds: dur("2:15:36"),
        publishedAt: ago({ hours: 6 }),
      },
    ],
  },
  {
    name: "Grumpy Cat TV",
    handle: "@grumpycattv",
    avatarUrl: "/images/avatar-grumpy-cat-tv.png",
    subscriberCount: 8_100_000,
    videos: [
      {
        title: "The Ultimate Guide to Grumpy Meows",
        thumbnailUrl: "/images/thumb-grumpy-meows.png",
        viewCount: 8_900_000,
        likeCount: 520_000,
        durationSeconds: dur("12:08"),
        publishedAt: ago({ years: 1 }),
      },
      {
        title: "I don't need humans",
        type: "short",
        thumbnailUrl: "/images/short-no-humans.png",
        viewCount: 2_100_000,
        likeCount: 130_000,
        durationSeconds: dur("0:17"),
        publishedAt: ago({ weeks: 1 }),
      },
    ],
  },
  {
    name: "Calm Cats",
    handle: "@calmcats",
    avatarUrl: "/images/avatar-calm-cats.png",
    subscriberCount: 950_000,
    videos: [
      {
        title: "24 Hours of Cat Watching - Relaxing",
        thumbnailUrl: "/images/thumb-cat-watching.png",
        viewCount: 2_100_000,
        likeCount: 88_000,
        durationSeconds: dur("10:00:00"),
        publishedAt: ago({ weeks: 3 }),
      },
    ],
  },
  {
    name: "Meow Expert",
    handle: "@meowexpert",
    avatarUrl: "/images/avatar-meow-expert.png",
    subscriberCount: 780_000,
    videos: [
      {
        title: "Space Cats: The Final Meowfrontier",
        thumbnailUrl: "/images/thumb-space-cats.png",
        viewCount: 150_000,
        likeCount: 9_400,
        durationSeconds: dur("15:42"),
        publishedAt: ago({ days: 1 }),
      },
      {
        title: "Target locked",
        type: "short",
        thumbnailUrl: "/images/short-target-locked.png",
        viewCount: 3_400_000,
        likeCount: 220_000,
        durationSeconds: dur("0:14"),
        publishedAt: ago({ days: 4 }),
      },
    ],
  },
  {
    name: "Creamy Paws",
    handle: "@creamypaws",
    avatarUrl: "/images/avatar-creamy-paws.png",
    subscriberCount: 1_400_000,
    videos: [
      {
        title: "Yarn Wars: The Fluff Awakens",
        thumbnailUrl: "/images/thumb-yarn-wars.png",
        viewCount: 3_400_000,
        likeCount: 160_000,
        durationSeconds: dur("9:31"),
        publishedAt: ago({ months: 6 }),
      },
      {
        title: "Bless you! ❤️",
        type: "short",
        thumbnailUrl: "/images/short-bless-you.png",
        viewCount: 45_000_000,
        likeCount: 2_800_000,
        durationSeconds: dur("0:11"),
        publishedAt: ago({ weeks: 2 }),
      },
    ],
  },
  {
    name: "Grumpy Cat",
    handle: "@grumpycat",
    avatarUrl: "/images/avatar-grumpy-cat.png",
    subscriberCount: 5_600_000,
    videos: [
      {
        title: "Wait for it... 😂",
        type: "short",
        thumbnailUrl: "/images/short-wait-for-it.png",
        viewCount: 12_000_000,
        likeCount: 940_000,
        durationSeconds: dur("0:19"),
        publishedAt: ago({ days: 3 }),
      },
    ],
  },
  {
    name: "Cattitude Daily",
    handle: "@cattitudedaily",
    avatarUrl: "/images/avatar-cattitude-daily.png",
    subscriberCount: 1_100_000,
    videos: [
      {
        title: "Mood right now",
        type: "short",
        thumbnailUrl: "/images/short-mood-right-now.png",
        viewCount: 15_000_000,
        likeCount: 1_100_000,
        durationSeconds: dur("0:16"),
        publishedAt: ago({ days: 6 }),
      },
    ],
  },
  {
    name: "The Daily Purr",
    handle: "@thedailypurr",
    description: "Purring our way through life, one whisker at a time. 🐾",
    avatarUrl: "/images/avatar-daily-purr.png",
    bannerUrl: "/images/channel-banner.png",
    subscriberCount: 2_400_000,
    videos: [
      {
        title: "Tiny Kitten Discovers a Cardboard Box",
        description:
          "Sometimes the simplest things bring the greatest joy. Watch this tiny kitten make the most amazing discovery!",
        thumbnailUrl: "/images/featured-kitten-box.png",
        viewCount: 1_800_000,
        likeCount: 46_000,
        durationSeconds: dur("0:24"),
        publishedAt: ago({ days: 3 }),
      },
      {
        title: "Laser Pointer Chase Championship",
        thumbnailUrl: "/images/upload-laser-pointer.png",
        viewCount: 912_000,
        likeCount: 41_000,
        durationSeconds: dur("4:12"),
        publishedAt: ago({ weeks: 1 }),
      },
      {
        title: "Cat Nap Lo-fi Mix",
        thumbnailUrl: "/images/upload-cat-nap-lofi.png",
        viewCount: 1_200_000,
        likeCount: 67_000,
        durationSeconds: dur("1:02:15"),
        publishedAt: ago({ weeks: 2 }),
      },
      {
        title: "Tuna Taste Test",
        thumbnailUrl: "/images/upload-tuna-taste.png",
        viewCount: 680_000,
        likeCount: 29_000,
        durationSeconds: dur("6:33"),
        publishedAt: ago({ days: 3, hours: 2 }),
      },
      {
        title: "Window Birdwatching Live",
        type: "live",
        thumbnailUrl: "/images/upload-birdwatching.png",
        viewCount: 3_700,
        likeCount: 420,
        publishedAt: ago({ minutes: 30 }),
      },
      {
        title: "How to Train Your Human",
        thumbnailUrl: "/images/upload-train-human.png",
        viewCount: 1_100_000,
        likeCount: 52_000,
        durationSeconds: dur("7:48"),
        publishedAt: ago({ weeks: 2, days: 1 }),
      },
      {
        title: "Playful Paws",
        type: "short",
        thumbnailUrl: "/images/chshort-playful-paws.png",
        viewCount: 2_000_000,
        likeCount: 140_000,
        durationSeconds: dur("0:19"),
        publishedAt: ago({ weeks: 1, days: 2 }),
      },
      {
        title: "Box Logic",
        type: "short",
        thumbnailUrl: "/images/chshort-box-logic.png",
        viewCount: 5_400_000,
        likeCount: 380_000,
        durationSeconds: dur("0:27"),
        publishedAt: ago({ weeks: 2, days: 3 }),
      },
      {
        title: "Staring Contest",
        type: "short",
        thumbnailUrl: "/images/chshort-staring-contest.png",
        viewCount: 890_000,
        likeCount: 61_000,
        durationSeconds: dur("0:34"),
        publishedAt: ago({ weeks: 3 }),
      },
      {
        title: "Midnight Screams",
        type: "short",
        thumbnailUrl: "/images/chshort-midnight-screams.png",
        viewCount: 1_200_000,
        likeCount: 84_000,
        durationSeconds: dur("0:16"),
        publishedAt: ago({ months: 1 }),
      },
      {
        title: "Coolest Cat",
        type: "short",
        thumbnailUrl: "/images/chshort-coolest-cat.png",
        viewCount: 3_000_000,
        likeCount: 210_000,
        durationSeconds: dur("0:21"),
        publishedAt: ago({ weeks: 5 }),
      },
      {
        title: "What was that?",
        type: "short",
        thumbnailUrl: "/images/chshort-what-was-that.png",
        viewCount: 7_100_000,
        likeCount: 495_000,
        durationSeconds: dur("0:12"),
        publishedAt: ago({ months: 2 }),
      },
    ],
  },
  {
    name: "Whisker Wonders",
    handle: "@whiskerwonders",
    avatarUrl: "/images/avatar-whisker-wonders.png",
    subscriberCount: 2_350_000,
    videos: [
      {
        title: "Tiny Kitten Discovers a Cardboard Box",
        description:
          "Sometimes the simplest things bring the greatest joy. Watch this tiny kitten make the most amazing discovery!\n#kittens #cute #cardboardbox",
        thumbnailUrl: "/images/player-kitten-box.png",
        viewCount: 1_800_000,
        likeCount: 46_000,
        durationSeconds: dur("0:24"),
        publishedAt: ago({ days: 3, hours: 1 }),
      },
      {
        title: "Sleepy Kitten Yawns",
        type: "short",
        thumbnailUrl: "/images/kitten-short-1.png",
        viewCount: 640_000,
        likeCount: 43_000,
        durationSeconds: dur("0:15"),
        publishedAt: ago({ days: 2 }),
      },
      {
        title: "Kitten Zoomies",
        type: "short",
        thumbnailUrl: "/images/kitten-short-2.png",
        viewCount: 1_100_000,
        likeCount: 76_000,
        durationSeconds: dur("0:18"),
        publishedAt: ago({ days: 5 }),
      },
      {
        title: "First Wobbly Steps",
        type: "short",
        thumbnailUrl: "/images/kitten-short-3.png",
        viewCount: 2_300_000,
        likeCount: 150_000,
        durationSeconds: dur("0:21"),
        publishedAt: ago({ weeks: 1 }),
      },
    ],
  },
  {
    name: "Purrfect Moments",
    handle: "@purrfectmoments",
    avatarUrl: "/images/avatar-purrfect-moments.png",
    subscriberCount: 860_000,
    videos: [
      {
        title: "Sneaky Paws",
        type: "short",
        thumbnailUrl: "/images/cat-short-1.png",
        viewCount: 980_000,
        likeCount: 67_000,
        durationSeconds: dur("0:28"),
        publishedAt: ago({ days: 4 }),
      },
    ],
  },
  {
    name: "Meowgical",
    handle: "@meowgical",
    avatarUrl: "/images/avatar-meowgical.png",
    subscriberCount: 640_000,
    videos: [
      {
        title: "Window Watcher",
        type: "short",
        thumbnailUrl: "/images/cat-short-2.png",
        viewCount: 1_500_000,
        likeCount: 98_000,
        durationSeconds: dur("0:24"),
        publishedAt: ago({ days: 6 }),
      },
    ],
  },
  {
    name: "Kitten Academy",
    handle: "@kittenacademy",
    avatarUrl: "/images/avatar-kitten-academy.png",
    subscriberCount: 530_000,
    videos: [
      {
        title: "Big Stretch",
        type: "short",
        thumbnailUrl: "/images/cat-short-3.png",
        viewCount: 720_000,
        likeCount: 51_000,
        durationSeconds: dur("0:31"),
        publishedAt: ago({ weeks: 1 }),
      },
    ],
  },
  {
    name: "LoFi Paws",
    handle: "@lofipaws",
    subscriberCount: 420_000,
    videos: [],
  },
];

export async function seedWatchEvents() {
  console.log("Seeding fake watch events for the last 7 days...");
  const allVideos = await db.select({ id: videos.id }).from(videos);
  if (allVideos.length === 0) return;

  const now = new Date();
  const eventsToInsert: { videoId: string; seconds: number; createdAt: Date }[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
    const dayStartMs = dayDate.getTime();

    for (const video of allVideos) {
      const eventCount = Math.floor(Math.random() * 31) + 10;
      for (let i = 0; i < eventCount; i++) {
        const randomTimeMs = dayStartMs + Math.random() * 86_400_000;
        if (randomTimeMs > now.getTime()) continue;

        eventsToInsert.push({
          videoId: video.id,
          seconds: 2,
          createdAt: new Date(randomTimeMs),
        });
      }
    }
  }

  await db.delete(watchEvents);

  if (eventsToInsert.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < eventsToInsert.length; i += batchSize) {
      const batch = eventsToInsert.slice(i, i + batchSize);
      await db.insert(watchEvents).values(batch);
    }
  }

  console.log(`Seeded ${eventsToInsert.length} watch events across last 7 days.`);
}

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(watchEvents);
  await db.delete(videos);
  await db.delete(channels);
  await db.delete(users);

  for (let channelIndex = 0; channelIndex < seedChannels.length; channelIndex++) {
    const seedChannel = seedChannels[channelIndex];
    const [owner] = await db
      .insert(users)
      .values({
        name: seedChannel.name,
        email: `${seedChannel.handle.slice(1)}@mewtube.test`,
        avatarUrl: seedChannel.avatarUrl,
      })
      .returning();

    const [channel] = await db
      .insert(channels)
      .values({
        userId: owner.id,
        name: seedChannel.name,
        handle: seedChannel.handle,
        description: seedChannel.description,
        avatarUrl: seedChannel.avatarUrl,
        bannerUrl: seedChannel.bannerUrl,
        subscriberCount: seedChannel.subscriberCount,
      })
      .returning();

    if (seedChannel.videos.length > 0) {
      await db.insert(videos).values(
        seedChannel.videos.map((video) => ({
          ...video,
          channelId: channel.id,
        })),
      );
    }

    console.log(
      `Seeded ${seedChannel.name} (${seedChannel.videos.length} videos)`,
    );
  }

  const totalVideos = seedChannels.reduce(
    (sum, c) => sum + c.videos.length,
    0,
  );
  console.log(
    `Done: ${seedChannels.length} users, ${seedChannels.length} channels, ${totalVideos} videos.`,
  );

  console.log("Seeding admin user...");
  const args = process.argv.slice(2);
  const adminEmail = args[0] || process.env.ADMIN_EMAIL || "mikhail.sychev.bytebytego@gmail.com";
  const adminPassword = args[1] || process.env.ADMIN_PASSWORD || "mew-admin";
  const adminName = args[2] || process.env.ADMIN_NAME || "Mikhail Sychev";

  const hashedPassword = await hashPassword(adminPassword);
  const [adminUser] = await db
    .insert(users)
    .values({
      name: adminName,
      email: adminEmail,
      isAdmin: true,
      emailVerified: true,
    })
    .returning();

  await db.insert(accounts).values({
    userId: adminUser.id,
    accountId: adminUser.id,
    providerId: "credential",
    password: hashedPassword,
  });
  console.log("Seeded admin user:", adminEmail);

  await seedWatchEvents();
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
