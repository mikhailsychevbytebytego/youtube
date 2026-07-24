import { NextResponse } from "next/server";
import { db } from "@/db";
import { watchEvents } from "@/db/schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const videoId = body?.videoId;

    if (!videoId || typeof videoId !== "string" || !UUID_RE.test(videoId)) {
      return NextResponse.json(
        { error: "Invalid videoId" },
        { status: 400 },
      );
    }

    await db.insert(watchEvents).values({
      videoId,
      seconds: 2,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record watch event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
