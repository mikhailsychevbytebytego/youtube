import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { channels, db, users, videos } from "@/db";
import { createDirectUpload, streamThumbnailUrl } from "@/lib/cloudflare-stream";
import { auth } from "@/lib/auth";
import { getTextEmbedding, getImageEmbedding } from "@/lib/clip";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return base || "video";
}

async function requireAuthUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

async function getOrCreateOwnerChannelId(userId: string): Promise<string> {
  const [existing] = await db
    .select({ id: channels.id })
    .from(channels)
    .where(eq(channels.ownerId, userId))
    .limit(1);

  if (existing) return existing.id;

  throw new Error("You must create a channel before uploading videos.");
}

export async function POST(request: Request) {
  let body: { action?: string; title?: string; uid?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action;
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  try {
    const userId = await requireAuthUserId();

    if (action === "init") {
      const upload = await createDirectUpload(title);
      return NextResponse.json(upload);
    }

    if (action === "complete") {
      const uid = body.uid?.trim();
      if (!uid) {
        return NextResponse.json({ error: "Video ID is required." }, { status: 400 });
      }

      const channelId = await getOrCreateOwnerChannelId(userId);
      const slug = `${slugify(title)}-${uid.slice(0, 8)}`;
      const thumbnailUrl = streamThumbnailUrl(uid);

      const titleEmbedding = await getTextEmbedding(title);
      const descriptionEmbedding = await getTextEmbedding("");
      const thumbnailEmbedding = await getImageEmbedding(thumbnailUrl);

      const [video] = await db
        .insert(videos)
        .values({
          channelId,
          slug,
          title,
          videoUrl: uid,
          thumbnailUrl,
          titleEmbedding,
          descriptionEmbedding,
          thumbnailEmbedding,
        })
        .returning({ slug: videos.slug });

      return NextResponse.json({ slug: video.slug });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Sign in to upload videos." }, { status: 401 });
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
