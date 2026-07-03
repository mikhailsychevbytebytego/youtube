"use server";

import { and, eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, channels, subscriptions, videos, views, shorts } from "@/db";
import { getSession } from "@/lib/auth-server";
import { channelSlug } from "@/lib/channel-data";
import { formatCount, formatRelativeTime } from "@/lib/format";

/** Subscribe to a channel by its name/slug. */
export async function subscribeToChannel(channelName: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to subscribe to channels." };
  }

  const userId = session.user.id;

  // Resolve channel
  const allChannels = await db.select().from(channels);
  const targetChannel = allChannels.find((c) => channelSlug(c.name) === channelSlug(channelName));

  if (!targetChannel) {
    return { success: false, error: "Channel not found." };
  }

  try {
    // Check if already subscribed
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, targetChannel.id)))
      .limit(1);

    if (existing) {
      return { success: true, alreadySubscribed: true };
    }

    // Insert subscription
    await db.insert(subscriptions).values({
      userId,
      channelId: targetChannel.id,
    });

    // Increment subscriberCount
    await db
      .update(channels)
      .set({
        subscriberCount: sql`${channels.subscriberCount} + 1`,
      })
      .where(eq(channels.id, targetChannel.id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Failed to subscribe:", err);
    return { success: false, error: "Failed to subscribe." };
  }
}

/** Unsubscribe from a channel by its name/slug. */
export async function unsubscribeFromChannel(channelName: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to unsubscribe." };
  }

  const userId = session.user.id;

  // Resolve channel
  const allChannels = await db.select().from(channels);
  const targetChannel = allChannels.find((c) => channelSlug(c.name) === channelSlug(channelName));

  if (!targetChannel) {
    return { success: false, error: "Channel not found." };
  }

  try {
    // Check if subscribed
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, targetChannel.id)))
      .limit(1);

    if (!existing) {
      return { success: true, notSubscribed: true };
    }

    // Delete subscription
    await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, targetChannel.id)));

    // Decrement subscriberCount
    await db
      .update(channels)
      .set({
        subscriberCount: sql`CASE WHEN ${channels.subscriberCount} > 0 THEN ${channels.subscriberCount} - 1 ELSE 0 END`,
      })
      .where(eq(channels.id, targetChannel.id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Failed to unsubscribe:", err);
    return { success: false, error: "Failed to unsubscribe." };
  }
}

/** Check if the logged-in user is subscribed to a channel. */
export async function getSubscriptionStatus(channelName: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const userId = session.user.id;

  // Resolve channel
  const allChannels = await db.select().from(channels);
  const targetChannel = allChannels.find((c) => channelSlug(c.name) === channelSlug(channelName));

  if (!targetChannel) return false;

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, targetChannel.id)))
    .limit(1);

  return !!existing;
}

/** Get list of channels the current user is subscribed to. */
export async function getSubscribedChannels() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const rows = await db
    .select({
      id: channels.id,
      name: channels.name,
      handle: channels.handle,
      avatarUrl: channels.avatarUrl,
    })
    .from(subscriptions)
    .innerJoin(channels, eq(subscriptions.channelId, channels.id))
    .where(eq(subscriptions.userId, userId));

  return rows.map(r => ({
    name: r.name,
    avatar: r.avatarUrl ?? "/meowtube/profile.png",
    hasNotification: false,
  }));
}

/** Get subscriptions or fallback default channels for the Sidebar. */
export async function getSidebarSubscriptions() {
  const session = await getSession();
  if (session?.user?.id) {
    return await getSubscribedChannels();
  }
  return [];
}

/** Get long-form videos from subscribed channels. */
export async function getSubscribedFeedVideos() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const finishedVideoViews = sql<number>`coalesce((
    select count(*)::bigint from ${views}
    where ${views.videoId} = ${videos.id}
    and ${views.state} = 'finished'
  ), 0)`.mapWith(Number);

  const rows = await db
    .select({
      slug: videos.slug,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      viewCount: finishedVideoViews,
      publishedAt: videos.publishedAt,
      channelName: channels.name,
      channelAvatar: channels.avatarUrl,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .innerJoin(subscriptions, eq(subscriptions.channelId, channels.id))
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(videos.publishedAt));

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    channel: row.channelName,
    channelAvatar: row.channelAvatar ?? "/meowtube/profile.png",
    thumbnail: row.thumbnailUrl ?? "/meowtube/thumb-1.png",
    views: formatCount(row.viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
  }));
}

/** Get short-form videos from subscribed channels. */
export async function getSubscribedFeedShorts() {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const rows = await db
    .select({
      slug: shorts.slug,
      title: shorts.title,
      thumbnailUrl: shorts.thumbnailUrl,
      publishedAt: shorts.publishedAt,
    })
    .from(shorts)
    .innerJoin(channels, eq(shorts.channelId, channels.id))
    .innerJoin(subscriptions, eq(subscriptions.channelId, channels.id))
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(shorts.publishedAt));

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    views: "125K views", // Mock view count for display
    thumbnail: row.thumbnailUrl ?? "/meowtube/thumb-1.png",
  }));
}

/** Get suggested channels to subscribe to when user has no subscriptions. */
export async function getSuggestedChannels() {
  const session = await getSession();
  
  let rows = [];
  if (session?.user?.id) {
    const userId = session.user.id;
    
    // Find channels the user is not subscribed to
    const subQuery = db
      .select({ channelId: subscriptions.channelId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
      
    // Exclude subscribed channels
    rows = await db
      .select({
        name: channels.name,
        handle: channels.handle,
        avatarUrl: channels.avatarUrl,
        subscriberCount: channels.subscriberCount,
        description: channels.description,
      })
      .from(channels)
      .where(sql`${channels.id} not in (
        select ${subscriptions.channelId} from ${subscriptions} where ${subscriptions.userId} = ${userId}
      )`)
      .limit(6);
  } else {
    // Return first 6 channels
    rows = await db
      .select({
        name: channels.name,
        handle: channels.handle,
        avatarUrl: channels.avatarUrl,
        subscriberCount: channels.subscriberCount,
        description: channels.description,
      })
      .from(channels)
      .limit(6);
  }

  return rows.map(r => ({
    name: r.name,
    handle: r.handle,
    avatar: r.avatarUrl ?? "/meowtube/profile.png",
    subscribers: formatCount(r.subscriberCount, "subscribers"),
    description: r.description ?? "Cat content creator.",
  }));
}
