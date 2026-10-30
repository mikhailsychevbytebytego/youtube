import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import { embedImage, embedText } from "../lib/embeddings";
import { db } from "./index";
import { videos } from "./schema";

async function loadThumbnailBytes(
  thumbnailUrl: string | null,
): Promise<Buffer | null> {
  if (!thumbnailUrl) return null;

  if (thumbnailUrl.startsWith("/")) {
    try {
      return await readFile(path.join(process.cwd(), "public", thumbnailUrl));
    } catch {
      console.warn(`Could not read local thumbnail ${thumbnailUrl}`);
      return null;
    }
  }

  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    try {
      const response = await fetch(thumbnailUrl);
      if (!response.ok) {
        console.warn(
          `Could not fetch thumbnail ${thumbnailUrl} (${response.status})`,
        );
        return null;
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.warn(`Could not fetch thumbnail ${thumbnailUrl}:`, error);
      return null;
    }
  }

  return null;
}

async function embedCatalog() {
  const missing = await db
    .select()
    .from(videos)
    .where(and(eq(videos.isPublished, true), isNull(videos.titleEmbedding)));

  if (missing.length === 0) {
    console.log("Every published row already has a title embedding.");
    return;
  }

  console.log(`Embedding ${missing.length} video(s) missing CLIP vectors...`);

  for (const video of missing) {
    try {
      console.log(`Computing CLIP embeddings for "${video.title}"...`);
      const titleEmbedding = await embedText(video.title);
      const descriptionEmbedding = video.description
        ? await embedText(video.description)
        : null;
      const thumbnailBytes = await loadThumbnailBytes(video.thumbnailUrl);
      const thumbnailEmbedding = thumbnailBytes
        ? await embedImage(thumbnailBytes)
        : null;

      await db
        .update(videos)
        .set({ titleEmbedding, descriptionEmbedding, thumbnailEmbedding })
        .where(eq(videos.id, video.id));
    } catch (error) {
      console.warn(
        `Embedding computation failed for "${video.title}", continuing:`,
        error,
      );
    }
  }

  console.log("Done.");
}

embedCatalog()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
