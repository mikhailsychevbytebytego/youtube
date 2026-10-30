import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { videoLikes, videos } from "@/db/schema";
import { auth } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readVideoId(request: Request): Promise<string | null> {
  const body = (await request.json().catch(() => null)) as {
    videoId?: unknown;
  } | null;
  const videoId = body?.videoId;
  if (typeof videoId !== "string" || !UUID_RE.test(videoId)) return null;
  return videoId;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoId = await readVideoId(request);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid videoId" }, { status: 400 });
  }

  const video = await db.query.videos.findFirst({
    where: and(eq(videos.id, videoId), eq(videos.isPublished, true)),
  });
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const existing = await db.query.videoLikes.findFirst({
    where: and(
      eq(videoLikes.userId, session.user.id),
      eq(videoLikes.videoId, videoId),
    ),
  });
  if (existing) {
    return NextResponse.json({ liked: true, likeCount: video.likeCount });
  }

  await db.insert(videoLikes).values({
    userId: session.user.id,
    videoId,
  });
  await db
    .update(videos)
    .set({ likeCount: sql`${videos.likeCount} + 1` })
    .where(eq(videos.id, videoId));

  const [updated] = await db
    .select({ likeCount: videos.likeCount })
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);

  return NextResponse.json({
    liked: true,
    likeCount: updated?.likeCount ?? video.likeCount + 1,
  });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoId = await readVideoId(request);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid videoId" }, { status: 400 });
  }

  const existing = await db.query.videoLikes.findFirst({
    where: and(
      eq(videoLikes.userId, session.user.id),
      eq(videoLikes.videoId, videoId),
    ),
  });
  if (!existing) {
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });
    return NextResponse.json({
      liked: false,
      likeCount: video?.likeCount ?? 0,
    });
  }

  await db
    .delete(videoLikes)
    .where(
      and(
        eq(videoLikes.userId, session.user.id),
        eq(videoLikes.videoId, videoId),
      ),
    );
  await db
    .update(videos)
    .set({ likeCount: sql`GREATEST(0, ${videos.likeCount} - 1)` })
    .where(eq(videos.id, videoId));

  const [updated] = await db
    .select({ likeCount: videos.likeCount })
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);

  return NextResponse.json({
    liked: false,
    likeCount: updated?.likeCount ?? 0,
  });
}
