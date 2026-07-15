import { cache } from "react";
import {
  and,
  cosineDistance,
  desc,
  eq,
  gt,
  isNotNull,
  ne,
  sql,
} from "drizzle-orm";
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

/**
 * Videos related to the current one, ranked by CLIP similarity: the smallest
 * same-modality cosine distance (title-title, description-description,
 * thumbnail-thumbnail) wins. LEAST ignores nulls, so partially embedded
 * videos still rank. Falls back to recency when the current video has no
 * embeddings.
 */
export async function getRelatedVideos(
  current: Video,
  limit = 4,
): Promise<VideoWithChannel[]> {
  if (!current.titleEmbedding) {
    return getUpNextVideos(current, limit);
  }

  const minDistance = sql<number>`least(
    ${cosineDistance(videos.titleEmbedding, current.titleEmbedding)},
    ${
      current.descriptionEmbedding
        ? cosineDistance(videos.descriptionEmbedding, current.descriptionEmbedding)
        : sql`null`
    },
    ${
      current.thumbnailEmbedding
        ? cosineDistance(videos.thumbnailEmbedding, current.thumbnailEmbedding)
        : sql`null`
    }
  )`;

  const rows = await db
    .select({ video: videos, channel: channels })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(
      and(
        ne(videos.id, current.id),
        ne(videos.type, "short"),
        eq(videos.isPublished, true),
        isNotNull(videos.titleEmbedding),
      ),
    )
    .orderBy(minDistance)
    .limit(limit);

  return rows.map(({ video, channel }) => ({ ...video, channel }));
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

/** Small-catalog RRF constant; web-scale defaults (~60) would flatten top ranks. */
const SEARCH_RRF_K = 5;

/**
 * Assigns 1-based ranks (closest first) for one modality. Null / non-finite
 * distances are left unranked so they don't contribute to RRF.
 */
function ranksForDistances(distances: (number | null)[]): (number | null)[] {
  const ordered = distances
    .map((distance, index) => ({ distance, index }))
    .filter(
      (row): row is { distance: number; index: number } =>
        row.distance != null && Number.isFinite(row.distance),
    )
    .sort((a, b) => a.distance - b.distance);

  const ranks = distances.map(() => null as number | null);
  ordered.forEach((row, rankIndex) => {
    ranks[row.index] = rankIndex + 1;
  });
  return ranks;
}

function toDistance(value: unknown): number | null {
  if (value == null) return null;
  const distance = Number(value);
  return Number.isFinite(distance) ? distance : null;
}

function minRank(a: number | null, b: number | null): number | null {
  if (a == null) return b;
  if (b == null) return a;
  return Math.min(a, b);
}

/**
 * Semantic search: CLIP text-text distances (~0.2) and text-image distances
 * (~0.8) live on different scales, so LEAST of the raw cosine distances
 * always ignores thumbnails. Rank text (best of title/description) and
 * thumbnail separately, then fuse with reciprocal rank fusion so a visual
 * hit can outrank a weakly related title. Null embeddings are skipped.
 */
export async function searchVideos(
  queryEmbedding: number[],
  limit = 12,
): Promise<VideoWithChannel[]> {
  const rows = await db
    .select({
      video: videos,
      channel: channels,
      dTitle: cosineDistance(videos.titleEmbedding, queryEmbedding),
      dDesc: cosineDistance(videos.descriptionEmbedding, queryEmbedding),
      dThumb: cosineDistance(videos.thumbnailEmbedding, queryEmbedding),
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    // The title is always embedded first, so it doubles as the "has any
    // embeddings" marker.
    .where(and(eq(videos.isPublished, true), isNotNull(videos.titleEmbedding)));

  const titleRanks = ranksForDistances(rows.map((row) => toDistance(row.dTitle)));
  const descRanks = ranksForDistances(rows.map((row) => toDistance(row.dDesc)));
  const thumbRanks = ranksForDistances(rows.map((row) => toDistance(row.dThumb)));

  // Title and description are the same CLIP text space; taking both as
  // separate RRF lists double-counts text and drowns thumbnails. Fold them
  // into one text rank (best of the two), then fuse with the image rank.
  const scored = rows.map((row, index) => {
    const textRank = minRank(titleRanks[index], descRanks[index]);
    let score = 0;
    for (const rank of [textRank, thumbRanks[index]]) {
      if (rank != null) score += 1 / (SEARCH_RRF_K + rank);
    }
    return { row, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, limit)
    .map(({ row }) => ({ ...row.video, channel: row.channel }));
}

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
