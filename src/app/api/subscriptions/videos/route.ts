import { NextResponse } from "next/server";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { channels, subscriptions, videos } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ videos: [] });
    }

    const dbSubs = await db
      .select({ channelId: subscriptions.channelId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id));

    const channelIds = dbSubs.map((s) => s.channelId);

    if (channelIds.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    const videoRows = await db
      .select({ video: videos, channel: channels })
      .from(videos)
      .innerJoin(channels, eq(videos.channelId, channels.id))
      .where(
        and(
          inArray(videos.channelId, channelIds),
          eq(videos.isPublished, true),
          isNotNull(videos.videoUrl)
        )
      )
      .orderBy(desc(videos.publishedAt))
      .limit(30);

    const result = videoRows.map(({ video, channel }) => ({
      ...video,
      channel,
    }));

    return NextResponse.json({ videos: result });
  } catch (error) {
    console.error("Failed to fetch subscription videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
