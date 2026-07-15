import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  isCloudflareConfigured,
  uploadImage,
  uploadVideo,
} from "../lib/cloudflare";
import { db } from "./index";
import { channels, users, videos } from "./schema";

const FAL_LLM_ENDPOINT = "https://fal.run/openrouter/router";
const FAL_IMAGE_ENDPOINT =
  "https://fal.run/bytedance/seedream/v5/lite/text-to-image";
// Video generation takes minutes, so it goes through fal's queue API
// instead of the synchronous fal.run host.
const FAL_VIDEO_QUEUE_ENDPOINT =
  "https://queue.fal.run/bytedance/seedance-2.0/fast/image-to-video";
const MODEL = "google/gemini-3.5-flash";
const DEFAULT_USER_COUNT = 5;
const DEFAULT_VIDEO_COUNT = 5;
const VIDEO_DURATION_SECONDS = 6;
const VIDEO_POLL_INTERVAL_MS = 10_000;
const VIDEO_TIMEOUT_MS = 15 * 60_000;
const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");

// Seedream requires total pixels between 2560x1440 and 4096x4096.
const AVATAR_SIZE = { width: 2048, height: 2048 }; // smallest 1:1
const THUMBNAIL_SIZE = { width: 2560, height: 1440 }; // smallest 16:9

const mockVideoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  script: z.string().min(1),
  thumbnailPrompt: z.string().min(1),
  viewCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
});

const handleSchema = z.string().regex(/^@[a-z0-9_.]{3,30}$/);

const mockUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  avatarPrompt: z.string().min(1),
  channel: z.object({
    name: z.string().min(1),
    handle: handleSchema,
    description: z.string().optional(),
    subscriberCount: z.number().int().nonnegative(),
  }),
  videos: z.array(mockVideoSchema).min(1).max(3),
});

const mockUsersSchema = z.array(mockUserSchema);

const channelVideosSchema = z.array(
  z.object({
    handle: handleSchema,
    video: mockVideoSchema,
  }),
);

const imageResultSchema = z.object({
  images: z.array(z.object({ url: z.url() })).min(1),
});

const queueSubmitSchema = z.object({
  status_url: z.url(),
  response_url: z.url(),
});

const queueStatusSchema = z.object({
  status: z.string(),
});

const videoResultSchema = z.object({
  video: z.object({ url: z.url() }),
});

type MockVideo = z.infer<typeof mockVideoSchema>;
type MockUser = z.infer<typeof mockUserSchema>;

const VIDEO_EXAMPLE_JSON = [
  "  {",
  '    "title": "Sir Whiskers Storms the Cardboard Castle",',
  '    "description": "A brave knight faces his greatest foe: a wobbly box fort.",',
  '    "script": "Medieval fantasy, painterly style. A tabby cat in tiny armor charges a cardboard castle, leaps, and the whole fort collapses on top of him. Final close-up on his unimpressed face under a paper flag. 6 seconds.",',
  '    "thumbnailPrompt": "Painterly fantasy illustration, 16:9: a tabby cat in shining knight armor charging a cardboard castle at sunset, dramatic lighting, epic yet silly.",',
  '    "viewCount": 812000,',
  '    "likeCount": 45000',
  "  }",
];

const VIDEO_RULES = [
  "- every video is a funny 6-second cat video",
  "- vary the visual style ACROSS videos: photorealism, cinematic film, cartoon, 3D render, claymation, watercolor, anime, pixel art...",
  "- vary the story genre ACROSS videos: slice of life, cooking fail, sports, noir, sci-fi, horror-comedy, medieval fantasy...",
  '- "script" is the production script for the 6-second video: visual style, scene setting, the cat\'s action, and camera notes',
  '- "description" is one short viewer-facing sentence (no production details)',
  '- "thumbnailPrompt" is a one-to-two sentence text-to-image prompt for a 16:9 thumbnail that restates the video\'s visual style',
  "- viewCount is an integer between 100 and 50000000, likeCount is plausible relative to viewCount",
];

function buildUsersPrompt(
  count: number,
  takenEmails: string[],
  takenHandles: string[],
): string {
  return [
    `Generate exactly ${count} fake users for "MewTube", a YouTube-style site dedicated to cat videos.`,
    "Each user owns one channel with a cat-themed name, handle, short description, and a plausible subscriber count, plus 1 to 3 uploaded videos matching the channel's theme.",
    "",
    "Respond with ONLY a JSON array (no prose, no markdown fences) where each element matches:",
    "{",
    '  "name": "Willow Nightpaw",',
    '  "email": "willow@mewtube.test",',
    '  "avatarPrompt": "Portrait of a sleek black cat with glowing amber eyes against a moonlit purple background, playful digital art style, square profile picture.",',
    '  "channel": {',
    '    "name": "Midnight Zoomies",',
    '    "handle": "@midnightzoomies",',
    '    "description": "Chaotic 3am cat energy, daily.",',
    '    "subscriberCount": 48200',
    "  },",
    '  "videos": [',
    ...VIDEO_EXAMPLE_JSON,
    "  ]",
    "}",
    "",
    "Rules:",
    '- email must end in "@mewtube.test" and be unique within the array',
    "- handle must start with @ followed by 3-30 lowercase letters, digits, underscores, or dots",
    "- subscriberCount is an integer between 100 and 10000000",
    "- channel descriptions are one short sentence",
    "- avatarPrompt is a one-to-two sentence text-to-image prompt for the user's cat avatar (style, colors, personality matching the channel theme), suitable for a square profile picture",
    ...VIDEO_RULES,
    takenEmails.length > 0
      ? `- do NOT use any of these emails: ${takenEmails.join(", ")}`
      : "",
    takenHandles.length > 0
      ? `- do NOT use any of these handles: ${takenHandles.join(", ")}`
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function buildVideosPrompt(
  targetChannels: { name: string; handle: string; description: string | null }[],
): string {
  return [
    `Generate exactly one new fake video for each of these ${targetChannels.length} channels on "MewTube", a YouTube-style site dedicated to cat videos.`,
    "",
    "Channels:",
    ...targetChannels.map(
      (c) =>
        `- ${c.handle} ("${c.name}")${c.description ? `: ${c.description}` : ""}`,
    ),
    "",
    "Respond with ONLY a JSON array (no prose, no markdown fences) where each element matches:",
    "{",
    '  "handle": "@midnightzoomies",',
    '  "video":',
    ...VIDEO_EXAMPLE_JSON,
    "}",
    "",
    "Rules:",
    "- use each channel's handle exactly once, copied verbatim from the list above",
    "- the video must fit that channel's name and theme",
    ...VIDEO_RULES,
  ].join("\n");
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return match ? match[1] : trimmed;
}

function getFalKey(): string {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY is not set");
  }
  return falKey;
}

/** Sends a prompt to the LLM and returns its output validated against schema. */
async function callLlm<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(FAL_LLM_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Key ${getFalKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: MODEL,
      temperature: 1,
      // gemini-3.5-flash is a thinking model; the endpoint rejects requests
      // that try to disable reasoning (the default).
      reasoning: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`fal.ai request failed (${response.status}): ${body}`);
  }

  const result = (await response.json()) as {
    output?: string;
    error?: string;
  };
  if (result.error) {
    throw new Error(`fal.ai returned an error: ${result.error}`);
  }
  if (!result.output) {
    throw new Error("fal.ai response is missing the output field");
  }

  const raw = stripCodeFences(result.output);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    console.error("Model output is not valid JSON:\n", result.output);
    throw error;
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error("Model output failed validation:\n", result.output);
    console.error(z.prettifyError(parsed.error));
    throw new Error("Generated JSON did not match the expected schema");
  }

  return parsed.data;
}

/** Generates an image with Seedream; returns the bytes and the fal-hosted URL. */
async function generateImage(
  prompt: string,
  size: { width: number; height: number },
): Promise<{ image: Buffer; remoteUrl: string }> {
  const response = await fetch(FAL_IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Key ${getFalKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: size,
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Seedream request failed (${response.status}): ${body}`);
  }

  const result = imageResultSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error(
      `Seedream response did not match the expected schema: ${z.prettifyError(result.error)}`,
    );
  }

  const imageUrl = result.data.images[0].url;
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to download image (${imageResponse.status}) from ${imageUrl}`,
    );
  }
  return {
    image: Buffer.from(await imageResponse.arrayBuffer()),
    remoteUrl: imageUrl,
  };
}

/**
 * Generates a video with Seedance 2.0 Fast from the script and a source image
 * via fal's queue API, and returns the mp4 bytes.
 */
async function generateVideo(
  script: string,
  imageUrl: string,
): Promise<Buffer> {
  const headers = {
    Authorization: `Key ${getFalKey()}`,
    "Content-Type": "application/json",
  };

  const submitResponse = await fetch(FAL_VIDEO_QUEUE_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: script,
      image_url: imageUrl,
      duration: String(VIDEO_DURATION_SECONDS),
      resolution: "720p",
      aspect_ratio: "16:9",
    }),
  });
  if (!submitResponse.ok) {
    const body = await submitResponse.text();
    throw new Error(
      `Seedance submit failed (${submitResponse.status}): ${body}`,
    );
  }

  const submitted = queueSubmitSchema.safeParse(await submitResponse.json());
  if (!submitted.success) {
    throw new Error(
      `Seedance queue response did not match the expected schema: ${z.prettifyError(submitted.error)}`,
    );
  }

  const deadline = Date.now() + VIDEO_TIMEOUT_MS;
  for (;;) {
    await new Promise((resolve) =>
      setTimeout(resolve, VIDEO_POLL_INTERVAL_MS),
    );
    if (Date.now() > deadline) {
      throw new Error("Seedance generation timed out");
    }

    const statusResponse = await fetch(submitted.data.status_url, { headers });
    if (!statusResponse.ok) {
      const body = await statusResponse.text();
      throw new Error(
        `Seedance status check failed (${statusResponse.status}): ${body}`,
      );
    }
    const status = queueStatusSchema.safeParse(await statusResponse.json());
    if (!status.success) {
      throw new Error(
        `Seedance status response did not match the expected schema: ${z.prettifyError(status.error)}`,
      );
    }
    if (status.data.status === "COMPLETED") {
      break;
    }
    console.log(`  ...video status: ${status.data.status}`);
  }

  const resultResponse = await fetch(submitted.data.response_url, { headers });
  if (!resultResponse.ok) {
    const body = await resultResponse.text();
    throw new Error(
      `Seedance result fetch failed (${resultResponse.status}): ${body}`,
    );
  }
  const result = videoResultSchema.safeParse(await resultResponse.json());
  if (!result.success) {
    throw new Error(
      `Seedance result did not match the expected schema: ${z.prettifyError(result.error)}`,
    );
  }

  const videoResponse = await fetch(result.data.video.url);
  if (!videoResponse.ok) {
    throw new Error(
      `Failed to download video (${videoResponse.status}) from ${result.data.video.url}`,
    );
  }
  return Buffer.from(await videoResponse.arrayBuffer());
}

/** Saves image bytes under public/images and returns the public path. */
async function saveImage(fileName: string, image: Buffer): Promise<string> {
  await writeFile(path.join(IMAGES_DIR, fileName), image);
  return `/images/${fileName}`;
}

/** Saves video bytes under public/videos and returns the public path. */
async function saveVideo(fileName: string, video: Buffer): Promise<string> {
  await mkdir(VIDEOS_DIR, { recursive: true });
  await writeFile(path.join(VIDEOS_DIR, fileName), video);
  return `/videos/${fileName}`;
}

/**
 * Uploads the image to Cloudflare Images when configured, otherwise saves
 * it under public/images. Returns the URL to store in the database.
 */
async function storeImage(fileName: string, image: Buffer): Promise<string> {
  if (isCloudflareConfigured()) {
    return uploadImage(image, fileName);
  }
  return saveImage(fileName, image);
}

/**
 * Uploads the video to Cloudflare Stream when configured, otherwise saves
 * it under public/videos. Returns the playback URL and Stream UID (null
 * for local files).
 */
async function storeVideo(
  fileName: string,
  video: Buffer,
): Promise<{ videoUrl: string; streamUid: string | null }> {
  if (isCloudflareConfigured()) {
    const { uid, playbackUrl } = await uploadVideo(video, fileName);
    return { videoUrl: playbackUrl, streamUid: uid };
  }
  return { videoUrl: await saveVideo(fileName, video), streamUid: null };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function randomPublishedAt(): Date {
  const daysAgo = Math.random() * 90;
  return new Date(Date.now() - daysAgo * 86_400_000);
}

/**
 * Generates the thumbnail and video and inserts the video row for a channel.
 * Returns which assets were generated (the row is always inserted).
 */
async function insertVideo(
  channelId: string,
  video: MockVideo,
): Promise<{ thumbnail: boolean; videoFile: boolean }> {
  const slug = slugify(video.title);

  let thumbnailUrl: string | null = null;
  let thumbnailRemoteUrl: string | null = null;
  try {
    console.log(`Generating thumbnail for "${video.title}"...`);
    const { image, remoteUrl } = await generateImage(
      video.thumbnailPrompt,
      THUMBNAIL_SIZE,
    );
    thumbnailUrl = await storeImage(`mock-thumb-${slug}.png`, image);
    thumbnailRemoteUrl = remoteUrl;
    console.log(`Stored thumbnail at ${thumbnailUrl}`);
  } catch (error) {
    console.warn(
      `Thumbnail generation failed for "${video.title}", continuing without one:`,
      error,
    );
  }

  // The video animates the thumbnail, so it needs the fal-hosted source image.
  let videoUrl: string | null = null;
  let streamUid: string | null = null;
  if (thumbnailRemoteUrl) {
    try {
      console.log(`Generating video for "${video.title}" (takes minutes)...`);
      const videoBytes = await generateVideo(video.script, thumbnailRemoteUrl);
      const stored = await storeVideo(`mock-video-${slug}.mp4`, videoBytes);
      videoUrl = stored.videoUrl;
      streamUid = stored.streamUid;
      console.log(`Stored video at ${videoUrl}`);
    } catch (error) {
      console.warn(
        `Video generation failed for "${video.title}", continuing without one:`,
        error,
      );
    }
  } else {
    console.warn(
      `Skipping video generation for "${video.title}" (no source thumbnail)`,
    );
  }

  await db.insert(videos).values({
    channelId,
    title: video.title,
    description: video.description,
    script: video.script,
    thumbnailUrl,
    videoUrl,
    streamUid,
    durationSeconds: VIDEO_DURATION_SECONDS,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    publishedAt: randomPublishedAt(),
  });
  console.log(
    `Inserted video "${video.title}" (${video.viewCount.toLocaleString()} views)`,
  );

  return { thumbnail: thumbnailUrl !== null, videoFile: videoUrl !== null };
}

async function generateMockUsers(count: number): Promise<MockUser[]> {
  const [existingUsers, existingChannels] = await Promise.all([
    db.select({ email: users.email }).from(users),
    db.select({ handle: channels.handle }).from(channels),
  ]);

  const prompt = buildUsersPrompt(
    count,
    existingUsers.map((u) => u.email),
    existingChannels.map((c) => c.handle),
  );

  console.log(`Asking ${MODEL} for ${count} mock users...`);
  return callLlm(prompt, mockUsersSchema);
}

async function insertMockUsers(mockUsers: MockUser[]): Promise<void> {
  const totalVideos = mockUsers.reduce((sum, u) => sum + u.videos.length, 0);
  let insertedUsers = 0;
  let insertedChannels = 0;
  let generatedAvatars = 0;
  let insertedVideos = 0;
  let generatedThumbnails = 0;
  let generatedVideoFiles = 0;

  for (const mockUser of mockUsers) {
    const [user] = await db
      .insert(users)
      .values({ name: mockUser.name, email: mockUser.email })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      console.log(`Skipped ${mockUser.email} (email already exists)`);
      continue;
    }
    insertedUsers++;

    // Generate the avatar only after the user row landed, so duplicates
    // don't cost an image generation.
    let avatarUrl: string | null = null;
    try {
      console.log(`Generating avatar for ${mockUser.channel.handle}...`);
      const { image } = await generateImage(mockUser.avatarPrompt, AVATAR_SIZE);
      avatarUrl = await storeImage(
        `mock-avatar-${mockUser.channel.handle.replace(/^@/, "")}.png`,
        image,
      );
      await db.update(users).set({ avatarUrl }).where(eq(users.id, user.id));
      generatedAvatars++;
      console.log(`Stored avatar at ${avatarUrl}`);
    } catch (error) {
      console.warn(
        `Avatar generation failed for ${mockUser.channel.handle}, continuing without one:`,
        error,
      );
    }

    const [channel] = await db
      .insert(channels)
      .values({
        userId: user.id,
        name: mockUser.channel.name,
        handle: mockUser.channel.handle,
        description: mockUser.channel.description,
        avatarUrl,
        subscriberCount: mockUser.channel.subscriberCount,
      })
      .onConflictDoNothing()
      .returning();

    if (!channel) {
      console.log(
        `Inserted ${mockUser.name}, but skipped channel ${mockUser.channel.handle} (handle already exists, videos skipped too)`,
      );
      continue;
    }
    insertedChannels++;

    console.log(
      `Inserted ${mockUser.name} <${mockUser.email}> with channel ${mockUser.channel.handle} (${mockUser.channel.subscriberCount.toLocaleString()} subs)`,
    );

    for (const video of mockUser.videos) {
      const { thumbnail, videoFile } = await insertVideo(channel.id, video);
      insertedVideos++;
      if (thumbnail) generatedThumbnails++;
      if (videoFile) generatedVideoFiles++;
    }
  }

  console.log(
    `Done: ${insertedUsers}/${mockUsers.length} users, ${insertedChannels}/${mockUsers.length} channels, ${generatedAvatars}/${mockUsers.length} avatars, ${insertedVideos}/${totalVideos} videos, ${generatedThumbnails}/${totalVideos} thumbnails, ${generatedVideoFiles}/${totalVideos} video files.`,
  );
}

/** Picks random existing channels and generates one new video for each. */
async function generateVideosForExistingChannels(count: number): Promise<void> {
  const allChannels = await db
    .select({
      id: channels.id,
      name: channels.name,
      handle: channels.handle,
      description: channels.description,
    })
    .from(channels);

  if (allChannels.length === 0) {
    throw new Error("No channels in the database; run the user mode first.");
  }

  const targets = [...allChannels]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, allChannels.length));

  console.log(
    `Asking ${MODEL} for ${targets.length} videos (channels: ${targets.map((c) => c.handle).join(", ")})...`,
  );
  const generated = await callLlm(
    buildVideosPrompt(targets),
    channelVideosSchema,
  );
  console.log(`Model returned ${generated.length} videos.`);

  const byHandle = new Map(targets.map((c) => [c.handle, c]));
  let insertedVideos = 0;
  let generatedThumbnails = 0;
  let generatedVideoFiles = 0;

  for (const entry of generated) {
    const channel = byHandle.get(entry.handle);
    if (!channel) {
      console.warn(
        `Skipped video "${entry.video.title}" (unknown handle ${entry.handle})`,
      );
      continue;
    }
    console.log(`Adding video to ${channel.handle}...`);
    const { thumbnail, videoFile } = await insertVideo(channel.id, entry.video);
    insertedVideos++;
    if (thumbnail) generatedThumbnails++;
    if (videoFile) generatedVideoFiles++;
  }

  console.log(
    `Done: ${insertedVideos}/${generated.length} videos, ${generatedThumbnails}/${generated.length} thumbnails, ${generatedVideoFiles}/${generated.length} video files.`,
  );
}

function parseCount(
  value: string | undefined,
  fallback: number,
  label: string,
): number {
  const count = value ? Number.parseInt(value, 10) : fallback;
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error(
      `${label} must be an integer between 1 and 50, got "${value}"`,
    );
  }
  return count;
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--videos") {
    const count = parseCount(args[1], DEFAULT_VIDEO_COUNT, "Video count");
    await generateVideosForExistingChannels(count);
    return;
  }

  const count = parseCount(args[0], DEFAULT_USER_COUNT, "User count");
  const mockUsers = await generateMockUsers(count);
  console.log(`Model returned ${mockUsers.length} users.`);
  await insertMockUsers(mockUsers);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
