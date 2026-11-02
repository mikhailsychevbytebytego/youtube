import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  isCloudflareConfigured,
  streamPlaybackUrl,
  streamThumbnailUrl,
  waitForStreamReady,
} from "@/lib/cloudflare";
import { getChannelForUser } from "@/lib/queries";

const UID_RE = /^[a-zA-Z0-9_-]{10,64}$/;

function metaString(
  meta: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = meta?.[key];
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  if (!isCloudflareConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudflare Stream is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN.",
      },
      { status: 503 },
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channel = await getChannelForUser(session.user.id);
  if (!channel) {
    return NextResponse.json(
      { error: "Create a channel before uploading." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    uid?: unknown;
    title?: unknown;
    description?: unknown;
    type?: unknown;
  } | null;

  const uid = typeof body?.uid === "string" ? body.uid : "";
  if (!UID_RE.test(uid)) {
    return NextResponse.json({ error: "Invalid Stream uid." }, { status: 400 });
  }

  const title =
    typeof body?.title === "string" ? body.title.trim().slice(0, 100) : "";
  if (title.length < 2) {
    return NextResponse.json(
      { error: "Give the video a title." },
      { status: 400 },
    );
  }

  const description =
    typeof body?.description === "string"
      ? body.description.trim().slice(0, 2000) || null
      : null;
  const type = body?.type === "short" ? "short" : "video";

  let stream;
  try {
    stream = await waitForStreamReady(uid);
  } catch {
    return NextResponse.json(
      { error: "That upload was not found on Stream." },
      { status: 404 },
    );
  }

  if (metaString(stream.meta, "userId") !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (metaString(stream.meta, "channelId") !== channel.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.query.videos.findFirst({
    where: eq(videos.streamUid, uid),
  });
  if (existing) {
    return NextResponse.json({
      videoId: existing.id,
      ready: Boolean(existing.videoUrl),
    });
  }

  try {
    const [inserted] = await db
      .insert(videos)
      .values({
        channelId: channel.id,
        title,
        description,
        type,
        streamUid: uid,
        videoUrl: streamPlaybackUrl(uid, stream.playback?.hls),
        thumbnailUrl: streamThumbnailUrl(uid, stream.thumbnail),
        durationSeconds:
          typeof stream.duration === "number"
            ? Math.max(0, Math.round(stream.duration))
            : null,
        isPublished: true,
      })
      .returning({ id: videos.id });

    return NextResponse.json({
      videoId: inserted.id,
      ready: Boolean(stream.readyToStream && stream.playback?.hls),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const raced = await db.query.videos.findFirst({
        where: eq(videos.streamUid, uid),
      });
      if (raced) {
        return NextResponse.json({
          videoId: raced.id,
          ready: Boolean(raced.videoUrl),
        });
      }
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { code, cause } = error as { code?: unknown; cause?: unknown };
  return code === "23505" || isUniqueViolation(cause);
}
