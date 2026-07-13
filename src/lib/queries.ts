import { cache } from "react";
import { and, desc, eq, gt, ne } from "drizzle-orm";
import { db } from "@/db";
import { channels, videos, type Channel, type Video } from "@/db/schema";

export type VideoWithChannel = Video & { channel: Channel };

export type SidebarChannel = Channel & { isLive: boolean; hasNew: boolean };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getHomeVideos(limit = 8): Promise<VideoWithChannel[]> {
  return db.query.videos.findMany({
    where: and(eq(videos.type, "video"), eq(videos.isPublished, true)),
    orderBy: desc(videos.publishedAt),
    limit,
    with: { channel: true },
  });
}

export async function getShorts(limit = 6): Promise<VideoWithChannel[]> {
  return db.query.videos.findMany({
    where: and(eq(videos.type, "short"), eq(videos.isPublished, true)),
    orderBy: desc(videos.viewCount),
    limit,
    with: { channel: true },
  });
}

/**
 * Video for the watch page. Without an id, falls back to the most recent
 * regular video (the seeded "Tiny Kitten" video from Whisker Wonders).
 */
export const getWatchVideo = cache(
  async (id?: string): Promise<VideoWithChannel | null> => {
    if (id) {
      if (!UUID_RE.test(id)) return null;
      const video = await db.query.videos.findFirst({
        where: and(eq(videos.id, id), eq(videos.isPublished, true)),
        with: { channel: true },
      });
      return video ?? null;
    }

    const channel = await db.query.channels.findFirst({
      where: eq(channels.handle, "@whiskerwonders"),
    });
    if (!channel) return null;

    const video = await db.query.videos.findFirst({
      where: and(
        eq(videos.channelId, channel.id),
        eq(videos.type, "video"),
        eq(videos.isPublished, true),
      ),
      orderBy: desc(videos.publishedAt),
      with: { channel: true },
    });
    return video ?? null;
  },
);

export async function getUpNextVideos(
  current: Video,
  limit = 4,
): Promise<VideoWithChannel[]> {
  return db.query.videos.findMany({
    where: and(
      ne(videos.id, current.id),
      ne(videos.channelId, current.channelId),
      ne(videos.type, "short"),
      eq(videos.isPublished, true),
    ),
    orderBy: desc(videos.publishedAt),
    limit,
    with: { channel: true },
  });
}

export async function getChannelShorts(
  channelId: string,
  limit = 6,
): Promise<Video[]> {
  return db.query.videos.findMany({
    where: and(
      eq(videos.channelId, channelId),
      eq(videos.type, "short"),
      eq(videos.isPublished, true),
    ),
    orderBy: desc(videos.publishedAt),
    limit,
  });
}

export async function getRecentShorts(
  excludeChannelId: string,
  limit = 3,
): Promise<Video[]> {
  return db.query.videos.findMany({
    where: and(
      ne(videos.channelId, excludeChannelId),
      eq(videos.type, "short"),
      eq(videos.isPublished, true),
    ),
    orderBy: desc(videos.publishedAt),
    limit,
  });
}

export type ChannelContent = {
  channel: Channel;
  featured: Video | null;
  uploads: Video[];
  shorts: Video[];
};

export const getChannelWithContent = cache(
  async (handle: string): Promise<ChannelContent | null> => {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.handle, handle),
      with: { videos: true },
    });
    if (!channel) return null;

    const { videos: channelVideos, ...channelRow } = channel;
    const published = channelVideos.filter((v) => v.isPublished);
    const regular = published.filter((v) => v.type === "video");

    const featured =
      regular.length > 0
        ? regular.reduce((a, b) => (b.viewCount > a.viewCount ? b : a))
        : null;

    const uploads = published
      .filter((v) => v.type !== "short" && v.id !== featured?.id)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 5);

    const shorts = published
      .filter((v) => v.type === "short")
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 6);

    return { channel: channelRow, featured, uploads, shorts };
  },
);

/**
 * Top channels for the subscription rails. `isLive` means the channel has a
 * live video right now; `hasNew` means it published within the last 3 days.
 */
export async function getSidebarChannels(
  limit = 5,
): Promise<SidebarChannel[]> {
  const topChannels = await db.query.channels.findMany({
    orderBy: desc(channels.subscriberCount),
    limit,
  });

  const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000);
  const [liveRows, recentRows] = await Promise.all([
    db
      .selectDistinct({ channelId: videos.channelId })
      .from(videos)
      .where(and(eq(videos.type, "live"), eq(videos.isPublished, true))),
    db
      .selectDistinct({ channelId: videos.channelId })
      .from(videos)
      .where(
        and(
          gt(videos.publishedAt, threeDaysAgo),
          eq(videos.isPublished, true),
        ),
      ),
  ]);

  const liveIds = new Set(liveRows.map((r) => r.channelId));
  const recentIds = new Set(recentRows.map((r) => r.channelId));

  return topChannels.map((channel) => ({
    ...channel,
    isLive: liveIds.has(channel.id),
    hasNew: recentIds.has(channel.id),
  }));
}
