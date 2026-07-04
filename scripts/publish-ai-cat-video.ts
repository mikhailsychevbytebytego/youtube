import { fal } from "@fal-ai/client";
import { eq, sql, desc } from "drizzle-orm";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getTextEmbedding, getImageEmbedding } from "../src/lib/clip";
import { channels, db, shorts, users, videos } from "../src/db";
import { streamThumbnailUrl, uploadVideoBuffer } from "../src/lib/cloudflare-stream";
import {
  createSpinner,
  logPublishComplete,
  logStepInfo,
  logStepSuccess,
  promptPublishConfig,
} from "./lib/interactive-publish";
import {
  aspectRatioForFormat,
  DEFAULT_PUBLISH_CONFIG,
  formatLabel,
  imageSizeForFormat,
  isInteractiveFlag,
  parseDurationSeconds,
  type ContentFormat,
  type VideoDuration,
  type VideoResolution,
  type PublishConfig,
} from "./lib/publish-config";

const LLM_MODEL = "fal-ai/any-llm";
const LLM_MODEL_ID = "google/gemini-2.5-flash";
const IMAGE_MODEL = "fal-ai/bytedance/seedream/v5/lite/text-to-image";
const VIDEO_MODEL = "bytedance/seedance-2.0/fast/image-to-video";

type VideoPlan = {
  title: string;
  description: string;
  imagePrompt: string;
  videoPrompt: string;
};

type ChannelPick = {
  userId: string;
  userName: string;
  channelId: string;
  channelName: string;
  channelHandle: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || (name === "FAL_KEY" && value === "your_fal_api_key_here")) {
    throw new Error(`${name} is missing. Add it to your .env file.`);
  }
  return value;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return base || "video";
}

function bufferToFile(buffer: Buffer, filename: string, type: string): File {
  return new File([new Uint8Array(buffer)], filename, { type });
}

function parseJsonOutput(raw: string): VideoPlan {
  const trimmed = raw.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(unfenced);
  } catch {
    throw new Error(`LLM returned invalid JSON: ${raw.slice(0, 200)}`);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as VideoPlan).title !== "string" ||
    typeof (parsed as VideoPlan).description !== "string" ||
    typeof (parsed as VideoPlan).imagePrompt !== "string" ||
    typeof (parsed as VideoPlan).videoPrompt !== "string"
  ) {
    throw new Error("LLM JSON is missing required fields: title, description, imagePrompt, videoPrompt");
  }

  return parsed as VideoPlan;
}

async function getRecentVideoTitles(): Promise<string[]> {
  const recentVideos = await db
    .select({ title: videos.title, publishedAt: videos.publishedAt })
    .from(videos)
    .orderBy(desc(videos.publishedAt))
    .limit(25);

  const recentShorts = await db
    .select({ title: shorts.title, publishedAt: shorts.publishedAt })
    .from(shorts)
    .orderBy(desc(shorts.publishedAt))
    .limit(25);

  const combined = [...recentVideos, ...recentShorts]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 25);

  return combined.map((item) => item.title);
}

async function listChannels(): Promise<ChannelPick[]> {
  return db
    .select({
      userId: users.id,
      userName: users.name,
      channelId: channels.id,
      channelName: channels.name,
      channelHandle: channels.handle,
    })
    .from(channels)
    .innerJoin(users, eq(channels.ownerId, users.id))
    .orderBy(channels.name);
}

async function pickRandomChannel(): Promise<ChannelPick> {
  const [picked] = await db
    .select({
      userId: users.id,
      userName: users.name,
      channelId: channels.id,
      channelName: channels.name,
      channelHandle: channels.handle,
    })
    .from(channels)
    .innerJoin(users, eq(channels.ownerId, users.id))
    .orderBy(sql`random()`)
    .limit(1);

  if (!picked) {
    throw new Error("No channels found. Run npm run db:seed first.");
  }

  return picked;
}

async function resolveChannel(config: PublishConfig): Promise<ChannelPick> {
  const rows = await listChannels();
  const match = rows.find((row) => row.channelId === config.channelId);
  if (!match) {
    throw new Error("Selected channel not found.");
  }
  return match;
}

async function resolvePublishConfig(interactive: boolean): Promise<PublishConfig> {
  if (!interactive) {
    const picked = await pickRandomChannel();
    return { ...DEFAULT_PUBLISH_CONFIG, channelId: picked.channelId };
  }

  const rows = await listChannels();
  if (rows.length === 0) {
    throw new Error("No channels found. Run npm run db:seed first.");
  }

  return promptPublishConfig(rows);
}

async function createVideoPlan(
  channelName: string,
  config: PublishConfig,
  recentTitles: string[],
): Promise<VideoPlan> {
  const durationHint =
    config.duration === "auto"
      ? "appropriate length (model may choose timing)"
      : `~${config.duration} seconds`;

  const formatHint =
    config.format === "short"
      ? "MeowTube Short (9:16 vertical, punchy, scroll-stopping)"
      : "MeowTube long-form video (16:9 landscape)";

  const { data } = await fal.subscribe(LLM_MODEL, {
    input: {
      model: LLM_MODEL_ID,
      priority: "latency",
      system_prompt:
        "You create MeowTube cat video concepts. Respond with ONLY valid JSON, no markdown fences.",
      prompt: `Channel: "${channelName}".
Format: ${formatHint}.
Creative direction: "${config.creativePrompt}".
Recent video titles (DO NOT repeat these ideas):
${recentTitles.length > 0 ? recentTitles.map((t) => `- ${t}`).join("\n") : "None"}

Create a ${durationHint} piece featuring a cat. Match the tone, pacing, and framing for the chosen format.

CRITICAL INSTRUCTION: You MUST radically vary the video genres and visual aesthetics. DO NOT just make standard cat videos. 
Force a unique genre for this video (e.g., sci-fi, lifestyle vlog, detective drama, high-fantasy, cyberpunk, wild west, noir, horror, etc.).
Force a unique visual style (e.g., cinematic, anime, 3d render, watercolor, claymation, retro VHS, etc.).
Force a unique cat breed/type (e.g., calico, siamese, tuxedo, persian, sphynx, maine coon).
Be extremely creative and wildly different from the recent titles.

Return JSON: { "title": string, "description": string, "imagePrompt": string, "videoPrompt": string }`,
    },
  });

  return parseJsonOutput(data.output);
}

async function generateImage(imagePrompt: string, config: PublishConfig): Promise<Buffer> {
  const { data } = await fal.subscribe(IMAGE_MODEL, {
    input: {
      prompt: imagePrompt,
      image_size: imageSizeForFormat(config.format),
      num_images: 1,
    },
  });

  const imageUrl = data.images[0]?.url;
  if (!imageUrl) throw new Error("No image returned from fal.ai");

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);

  return Buffer.from(await res.arrayBuffer());
}

async function generateVideo(
  imageBuffer: Buffer,
  videoPrompt: string,
  config: PublishConfig,
): Promise<Buffer> {
  const imageFile = bufferToFile(imageBuffer, "frame.png", "image/png");
  const imageUrl = await fal.storage.upload(imageFile);

  const { data } = await fal.subscribe(VIDEO_MODEL, {
    input: {
      prompt: videoPrompt,
      image_url: imageUrl,
      resolution: config.resolution,
      duration: config.duration,
      aspect_ratio: aspectRatioForFormat(config.format),
    },
  });

  const videoUrl = data.video?.url;
  if (!videoUrl) throw new Error("No video returned from fal.ai");

  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);

  return Buffer.from(await res.arrayBuffer());
}

async function runStep<T>(
  interactive: boolean,
  label: string,
  task: () => Promise<T>,
): Promise<T> {
  if (!interactive) {
    console.log(`${label}...`);
    return task();
  }

  const spinner = createSpinner();
  spinner.start(label);
  try {
    const result = await task();
    spinner.stop(label);
    return result;
  } catch (error) {
    spinner.stop(`${label} failed`);
    throw error;
  }
}

function getCountArg(argv: string[]): number {
  const index = argv.findIndex((arg) => arg === "--count" || arg === "-c");
  if (index !== -1 && index + 1 < argv.length) {
    const val = parseInt(argv[index + 1], 10);
    if (!isNaN(val) && val > 0) {
      return val;
    }
  }
  return 1;
}

function getFormatArg(argv: string[]): ContentFormat | null {
  const index = argv.findIndex((arg) => arg === "--format" || arg === "-f");
  if (index !== -1 && index + 1 < argv.length) {
    const val = argv[index + 1].toLowerCase();
    if (val === "video" || val === "short") {
      return val;
    }
  }
  return null;
}

function getResolutionArg(argv: string[]): VideoResolution | null {
  const index = argv.findIndex((arg) => arg === "--resolution" || arg === "-r");
  if (index !== -1 && index + 1 < argv.length) {
    const val = argv[index + 1].toLowerCase();
    if (val === "480p" || val === "720p") {
      return val as VideoResolution;
    }
  }
  return null;
}

function getDurationArg(argv: string[]): VideoDuration | null {
  const index = argv.findIndex((arg) => arg === "--duration" || arg === "-d");
  if (index !== -1 && index + 1 < argv.length) {
    const val = argv[index + 1].toLowerCase();
    if (val === "auto" || !isNaN(parseInt(val, 10))) {
      return val as VideoDuration;
    }
  }
  return null;
}

async function main() {
  const argv = process.argv.slice(2);
  const interactive = isInteractiveFlag(argv);
  const count = getCountArg(argv);

  requireEnv("FAL_KEY");
  requireEnv("DATABASE_URL");
  requireEnv("CLOUDFLARE_ACCOUNT_ID");
  requireEnv("CLOUDFLARE_STREAM_API_TOKEN");

  let config = await resolvePublishConfig(interactive);

  // Override config properties if command line args are passed
  const formatOverride = getFormatArg(argv);
  if (formatOverride) {
    config.format = formatOverride;
  }

  const resolutionOverride = getResolutionArg(argv);
  if (resolutionOverride) {
    config.resolution = resolutionOverride;
  }

  const durationOverride = getDurationArg(argv);
  if (durationOverride) {
    config.duration = durationOverride;
  }

  const recentTitles = await getRecentVideoTitles();

  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n========================================`);
      console.log(`Processing video ${i + 1} of ${count}`);
      console.log(`========================================\n`);
    }

    let currentConfig = { ...config };
    if (!interactive && count > 1 && i > 0) {
      // Pick a random channel for subsequent videos if running automatically,
      // so we populate a diverse set of channels.
      try {
        const picked = await pickRandomChannel();
        currentConfig.channelId = picked.channelId;
      } catch (err) {
        console.warn("Failed to pick a random channel, using previous config channel:", err);
      }
    }

    const channel = await resolveChannel(currentConfig);

    if (!interactive) {
      console.log(`Format: ${formatLabel(currentConfig.format)}`);
      console.log(`Picked channel: ${channel.channelName} (owner: ${channel.userName})`);
    } else {
      logStepInfo(`${formatLabel(currentConfig.format)} · ${channel.channelName}`);
    }

    const plan = await runStep(interactive, "Generating video plan with LLM", () =>
      createVideoPlan(channel.channelName, currentConfig, recentTitles),
    );

    recentTitles.unshift(plan.title);
    if (recentTitles.length > 25) {
      recentTitles.pop();
    }

    if (interactive) {
      logStepSuccess(`Plan: "${plan.title}"`);
    } else {
      console.log(`Plan: "${plan.title}"`);
    }

    const imageBuffer = await runStep(interactive, "Generating image", () =>
      generateImage(plan.imagePrompt, currentConfig),
    );

    const videoBuffer = await runStep(interactive, "Generating video", () =>
      generateVideo(imageBuffer, plan.videoPrompt, currentConfig),
    );

    const uid = await runStep(interactive, "Uploading to Cloudflare Stream", () =>
      uploadVideoBuffer(videoBuffer, plan.title),
    );

    const slug = `${slugify(plan.title)}-${uid.slice(0, 8)}`;
    const durationSeconds = parseDurationSeconds(currentConfig.duration);
    const thumbnailUrl = streamThumbnailUrl(uid);

    const embeddings = await runStep(interactive, "Generating CLIP embeddings", async () => {
      const titleEmbedding = await getTextEmbedding(plan.title);
      const thumbnailEmbedding = await getImageEmbedding(imageBuffer);
      const descriptionEmbedding = currentConfig.format === "video"
        ? await getTextEmbedding(plan.description)
        : null;
      return { titleEmbedding, thumbnailEmbedding, descriptionEmbedding };
    });

    if (currentConfig.format === "short") {
      await db.insert(shorts).values({
        channelId: channel.channelId,
        slug,
        title: plan.title,
        videoUrl: uid,
        thumbnailUrl,
        durationSeconds,
        titleEmbedding: embeddings.titleEmbedding,
        thumbnailEmbedding: embeddings.thumbnailEmbedding,
      });
    } else {
      await db.insert(videos).values({
        channelId: channel.channelId,
        slug,
        title: plan.title,
        description: plan.description,
        videoUrl: uid,
        thumbnailUrl,
        durationSeconds,
        titleEmbedding: embeddings.titleEmbedding,
        descriptionEmbedding: embeddings.descriptionEmbedding,
        thumbnailEmbedding: embeddings.thumbnailEmbedding,
      });
    }

    // Save to local cache
    await runStep(interactive, "Saving to local cache", async () => {
      const cacheDir = path.join(process.cwd(), "ai-cache", slug);
      await mkdir(cacheDir, { recursive: true });

      await writeFile(path.join(cacheDir, "thumbnail.png"), imageBuffer);
      await writeFile(path.join(cacheDir, "video.mp4"), videoBuffer);

      const metadata = {
        format: currentConfig.format,
        slug,
        title: plan.title,
        description: currentConfig.format === "video" ? plan.description : null,
        videoUrl: uid,
        thumbnailUrl,
        durationSeconds,
        likeCount: 0,
        channelHandle: channel.channelHandle,
        publishedAt: new Date().toISOString(),
        embeddings: {
          titleEmbedding: embeddings.titleEmbedding,
          descriptionEmbedding: embeddings.descriptionEmbedding,
          thumbnailEmbedding: embeddings.thumbnailEmbedding,
        },
      };

      await writeFile(
        path.join(cacheDir, "metadata.json"),
        JSON.stringify(metadata, null, 2),
        "utf-8"
      );
    });

    const watchUrl = `http://localhost:3000/watch/${slug}`;

    if (interactive) {
      logPublishComplete(plan.title, slug, watchUrl, currentConfig.format);
    } else {
      console.log(`Published ${formatLabel(currentConfig.format)}: ${plan.title}`);
      console.log(`Slug: ${slug}`);
      console.log(`Stream UID: ${uid}`);
      console.log(`Watch: ${watchUrl}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Publish failed:", err);
    process.exit(1);
  });
