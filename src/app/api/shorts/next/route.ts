import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  forClientVideo,
  getTasteEmbedding,
  isVideoLiked,
  pickNextShort,
} from "@/lib/queries";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  if (!from || !UUID_RE.test(from)) {
    return NextResponse.json({ error: "Invalid from id" }, { status: 400 });
  }

  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => UUID_RE.test(id));

  const current = await db.query.videos.findFirst({
    where: and(
      eq(videos.id, from),
      eq(videos.type, "short"),
      eq(videos.isPublished, true),
    ),
  });

  if (!current) {
    return NextResponse.json({ error: "Short not found" }, { status: 404 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const tasteEmbedding = session?.user
    ? await getTasteEmbedding(session.user.id)
    : null;

  const next = await pickNextShort(current, exclude, { tasteEmbedding });
  if (!next) {
    return NextResponse.json({ short: null });
  }

  const liked = session?.user
    ? await isVideoLiked(session.user.id, next.id)
    : false;

  return NextResponse.json({
    short: { ...forClientVideo(next), liked },
  });
}
