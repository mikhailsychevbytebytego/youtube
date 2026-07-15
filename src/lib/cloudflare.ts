import { z } from "zod";

const API_BASE = "https://api.cloudflare.com/client/v4/accounts";
const STREAM_POLL_INTERVAL_MS = 5_000;
const STREAM_READY_TIMEOUT_MS = 5 * 60_000;

const imageUploadSchema = z.object({
  success: z.literal(true),
  result: z.object({
    id: z.string(),
    variants: z.array(z.url()).min(1),
  }),
});

const streamVideoSchema = z.object({
  success: z.literal(true),
  result: z.object({
    uid: z.string(),
    readyToStream: z.boolean(),
    playback: z
      .object({
        hls: z.string().nullish(),
        dash: z.string().nullish(),
      })
      .nullish(),
  }),
});

export function isCloudflareConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_STREAM_API_TOKEN,
  );
}

function getCredentials(): { accountId: string; token: string } {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !token) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN must be set",
    );
  }
  return { accountId, token };
}

/**
 * Uploads image bytes to Cloudflare Images and returns the public delivery
 * URL (imagedelivery.net). The API token needs "Cloudflare Images: Edit".
 */
export async function uploadImage(
  image: Buffer,
  fileName: string,
): Promise<string> {
  const { accountId, token } = getCredentials();

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(image)]), fileName);

  const response = await fetch(`${API_BASE}/${accountId}/images/v1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Cloudflare Images upload failed (${response.status}): ${body}`,
    );
  }

  const result = imageUploadSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error(
      `Cloudflare Images response did not match the expected schema: ${z.prettifyError(result.error)}`,
    );
  }

  const { variants } = result.data.result;
  return variants.find((v) => v.endsWith("/public")) ?? variants[0];
}

/**
 * Uploads video bytes to Cloudflare Stream (basic upload, <=200 MB) and
 * waits until the video is ready to stream. Returns the Stream UID and the
 * HLS playback URL. The API token needs "Stream: Edit".
 */
export async function uploadVideo(
  video: Buffer,
  name: string,
): Promise<{ uid: string; playbackUrl: string }> {
  const { accountId, token } = getCredentials();
  const headers = { Authorization: `Bearer ${token}` };

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(video)]), name);

  const response = await fetch(`${API_BASE}/${accountId}/stream`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Cloudflare Stream upload failed (${response.status}): ${body}`,
    );
  }

  let parsed = streamVideoSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(
      `Cloudflare Stream response did not match the expected schema: ${z.prettifyError(parsed.error)}`,
    );
  }
  const uid = parsed.data.result.uid;

  // Playback URLs only appear once Stream has processed the upload.
  const deadline = Date.now() + STREAM_READY_TIMEOUT_MS;
  for (;;) {
    const { readyToStream, playback } = parsed.data.result;
    if (readyToStream && playback?.hls) {
      return { uid, playbackUrl: playback.hls };
    }
    if (Date.now() > deadline) {
      throw new Error(`Cloudflare Stream processing timed out for ${uid}`);
    }

    await new Promise((resolve) =>
      setTimeout(resolve, STREAM_POLL_INTERVAL_MS),
    );
    const statusResponse = await fetch(
      `${API_BASE}/${accountId}/stream/${uid}`,
      { headers },
    );
    if (!statusResponse.ok) {
      const body = await statusResponse.text();
      throw new Error(
        `Cloudflare Stream status check failed (${statusResponse.status}): ${body}`,
      );
    }
    parsed = streamVideoSchema.safeParse(await statusResponse.json());
    if (!parsed.success) {
      throw new Error(
        `Cloudflare Stream status response did not match the expected schema: ${z.prettifyError(parsed.error)}`,
      );
    }
  }
}
