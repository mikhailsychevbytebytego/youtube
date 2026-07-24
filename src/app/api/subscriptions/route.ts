import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { channels, subscriptions } from "@/db/schema";
import { auth } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ channelIds: [], channels: [] });
    }

    const dbSubs = await db
      .select({ channelId: subscriptions.channelId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id));

    const channelIds = dbSubs.map((s) => s.channelId);

    if (channelIds.length === 0) {
      return NextResponse.json({ channelIds: [], channels: [] });
    }

    const subscribedChannels = await db
      .select()
      .from(channels)
      .where(inArray(channels.id, channelIds));

    return NextResponse.json({
      channelIds: subscribedChannels.map((c) => c.id),
      channels: subscribedChannels,
    });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to subscribe." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const channelId = body?.channelId;

    if (!channelId || typeof channelId !== "string" || !UUID_RE.test(channelId)) {
      return NextResponse.json({ error: "Invalid channelId" }, { status: 400 });
    }

    // Verify channel exists
    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Check existing subscription
    const existing = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.channelId, channelId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(subscriptions).values({
        userId: session.user.id,
        channelId,
      });
      await db
        .update(channels)
        .set({ subscriberCount: sql`${channels.subscriberCount} + 1` })
        .where(eq(channels.id, channelId));
    }

    const [updatedChannel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    return NextResponse.json({
      success: true,
      isSubscribed: true,
      subscriberCount: updatedChannel?.subscriberCount ?? channel.subscriberCount + 1,
    });
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const channelId = body?.channelId;

    if (!channelId || typeof channelId !== "string" || !UUID_RE.test(channelId)) {
      return NextResponse.json({ error: "Invalid channelId" }, { status: 400 });
    }

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.channelId, channelId)
        )
      );

    await db
      .update(channels)
      .set({
        subscriberCount: sql`GREATEST(0, ${channels.subscriberCount} - 1)`,
      })
      .where(eq(channels.id, channelId));

    const [updatedChannel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);

    return NextResponse.json({
      success: true,
      isSubscribed: false,
      subscriberCount: updatedChannel?.subscriberCount ?? Math.max(0, channel.subscriberCount - 1),
    });
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
