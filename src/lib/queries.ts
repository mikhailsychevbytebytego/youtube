import { desc, eq, ne, sql, cosineDistance } from "drizzle-orm";

import { channels, db, shorts, videos, views } from "@/db";
import { channelSlug, type Channel } from "@/lib/channel-data";
import { getTextEmbedding } from "@/lib/clip";
import { formatCount, formatDuration, formatRelativeTime } from "@/lib/format";
import type { Short, Video } from "@/lib/meowtube-data";
import type { Recommendation, WatchVideo } from "@/lib/watch-data";

const FALLBACK_AVATAR = "/meowtube/profile.png";
const FALLBACK_THUMB = "/meowtube/thumb-1.png";
const FALLBACK_BANNER = "/meowtube/channel/banner.png";
const FALLBACK_POSTER = "/meowtube/watch/w-player.png";

const finishedVideoViews = sql<number>`coalesce((
  select count(*)::bigint from ${views}
  where ${views.videoId} = ${videos.id}
  and ${views.state} = 'finished'
), 0)`.mapWith(Number);

/** Long-form videos for the home feed, newest first. */
export async function getHomeVideos(): Promise<Video[]> {
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
    .orderBy(desc(videos.publishedAt));

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    channel: row.channelName,
    channelAvatar: row.channelAvatar ?? FALLBACK_AVATAR,
    thumbnail: row.thumbnailUrl ?? FALLBACK_THUMB,
    views: formatCount(row.viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
  }));
}

/** Short-form videos for the home feed, newest first. */
export async function getHomeShorts(): Promise<Short[]> {
  const rows = await db
    .select({
      slug: shorts.slug,
      title: shorts.title,
      thumbnailUrl: shorts.thumbnailUrl,
      viewCount: sql<number>`0`.mapWith(Number),
      publishedAt: shorts.publishedAt,
    })
    .from(shorts)
    .orderBy(desc(shorts.publishedAt));

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    views: formatCount(row.viewCount, "views"),
    thumbnail: row.thumbnailUrl ?? FALLBACK_THUMB,
  }));
}

/** A single watch-page video resolved by its slug. */
export async function getWatchVideo(slug: string): Promise<WatchVideo | null> {
  const [row] = await db
    .select({
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      thumbnailUrl: videos.thumbnailUrl,
      videoUrl: videos.videoUrl,
      viewCount: finishedVideoViews,
      likeCount: videos.likeCount,
      durationSeconds: videos.durationSeconds,
      publishedAt: videos.publishedAt,
      channelName: channels.name,
      channelAvatar: channels.avatarUrl,
      subscriberCount: channels.subscriberCount,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(eq(videos.slug, slug))
    .limit(1);

  if (!row) return null;

  return {
    id: row.slug,
    title: row.title,
    channel: row.channelName,
    channelAvatar: row.channelAvatar ?? FALLBACK_AVATAR,
    subscribers: formatCount(row.subscriberCount, "subscribers"),
    poster: row.thumbnailUrl ?? FALLBACK_POSTER,
    streamId: row.videoUrl ?? undefined,
    views: formatCount(row.viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
    likes: formatCount(row.likeCount),
    description: row.description ?? "",
    progress: 38,
    currentTime: "0:14",
    duration: formatDuration(row.durationSeconds ?? 0),
  };
}

/** "Up next" recommendations: other videos, excluding the one being watched. */
export async function getRecommendations(
  excludeSlug: string,
): Promise<Recommendation[]> {
  // 1. Fetch current video's embeddings
  const [currentVideo] = await db
    .select({
      titleEmbedding: videos.titleEmbedding,
      descriptionEmbedding: videos.descriptionEmbedding,
      thumbnailEmbedding: videos.thumbnailEmbedding,
    })
    .from(videos)
    .where(eq(videos.slug, excludeSlug))
    .limit(1);

  let orderByClause: any = desc(videos.publishedAt);
  let selectSimilarity: any = sql<number>`0.0`;

  if (currentVideo) {
    const hasEmbeddings = currentVideo.titleEmbedding || currentVideo.descriptionEmbedding || currentVideo.thumbnailEmbedding;
    if (hasEmbeddings) {
      const conds: any[] = [];
      if (currentVideo.titleEmbedding) {
        conds.push(sql`coalesce(${cosineDistance(videos.titleEmbedding, currentVideo.titleEmbedding)}, 1.0)`);
      }
      if (currentVideo.descriptionEmbedding) {
        conds.push(sql`coalesce(${cosineDistance(videos.descriptionEmbedding, currentVideo.descriptionEmbedding)}, 1.0)`);
      }
      if (currentVideo.thumbnailEmbedding) {
        conds.push(sql`coalesce(${cosineDistance(videos.thumbnailEmbedding, currentVideo.thumbnailEmbedding)}, 1.0)`);
      }

      if (conds.length > 0) {
        const combinedDistance = sql<number>`least(${sql.join(conds, sql`, `)})`;
        selectSimilarity = sql<number>`1 - ${combinedDistance}`;
        orderByClause = desc(selectSimilarity);
      }
    }
  }

  const rows = await db
    .select({
      slug: videos.slug,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      viewCount: finishedVideoViews,
      publishedAt: videos.publishedAt,
      channelName: channels.name,
      similarity: selectSimilarity,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(ne(videos.slug, excludeSlug))
    .orderBy(orderByClause)
    .limit(6);

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    channel: row.channelName,
    views: formatCount(row.viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
    thumbnail: row.thumbnailUrl ?? FALLBACK_THUMB,
    similarity: Number(row.similarity),
  }));
}

/**
 * Resolves a channel by the slug of its display name (matching how
 * {@link channelHref} builds links). Returns null if no channel matches.
 */
export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const allChannels = await db
    .select({
      id: channels.id,
      name: channels.name,
      handle: channels.handle,
      description: channels.description,
      avatarUrl: channels.avatarUrl,
      bannerUrl: channels.bannerUrl,
      subscriberCount: channels.subscriberCount,
    })
    .from(channels);

  const match = allChannels.find((c) => channelSlug(c.name) === slug);
  if (!match) return null;

  const [channelVideos, channelShorts] = await Promise.all([
    db
      .select({
        slug: videos.slug,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        viewCount: finishedVideoViews,
        publishedAt: videos.publishedAt,
      })
      .from(videos)
      .where(eq(videos.channelId, match.id))
      .orderBy(desc(videos.publishedAt)),
    db
      .select({
        slug: shorts.slug,
        title: shorts.title,
        thumbnailUrl: shorts.thumbnailUrl,
        viewCount: sql<number>`0`.mapWith(Number),
        publishedAt: shorts.publishedAt,
      })
      .from(shorts)
      .where(eq(shorts.channelId, match.id))
      .orderBy(desc(shorts.publishedAt)),
  ]);

  return {
    name: match.name,
    handle: match.handle,
    subscribers: formatCount(match.subscriberCount, "subscribers"),
    videoCount: formatCount(channelVideos.length, "videos"),
    description: match.description ?? "",
    banner: match.bannerUrl ?? FALLBACK_BANNER,
    avatar: match.avatarUrl ?? FALLBACK_AVATAR,
    videos: channelVideos.map((v) => ({
      id: v.slug,
      title: v.title,
      views: formatCount(v.viewCount, "views"),
      publishedAt: formatRelativeTime(v.publishedAt),
      thumbnail: v.thumbnailUrl ?? FALLBACK_THUMB,
    })),
    shorts: channelShorts.map((s) => ({
      id: s.slug,
      title: s.title,
      views: formatCount(s.viewCount, "views"),
      thumbnail: s.thumbnailUrl ?? FALLBACK_THUMB,
    })),
  };
}

/** Search long-form videos using semantic search (CLIP embeddings). */
export async function searchHomeVideos(query: string): Promise<(Video & { similarity: number })[]> {
  if (!query || !query.trim()) {
    const fallback = await getHomeVideos();
    return fallback.map(v => ({ ...v, similarity: 1.0 }));
  }

  console.log(`[Semantic Search] Generating embedding for query: "${query}"`);
  const queryVector = await getTextEmbedding(query);

  const titleDist = cosineDistance(videos.titleEmbedding, queryVector);
  const descDist = cosineDistance(videos.descriptionEmbedding, queryVector);
  const thumbDist = cosineDistance(videos.thumbnailEmbedding, queryVector);

  const combinedDistance = sql<number>`least(
    coalesce(${titleDist}, 1.0),
    coalesce(${descDist}, 1.0),
    coalesce(${thumbDist}, 1.0)
  )`;

  const similarity = sql<number>`1 - ${combinedDistance}`;

  console.log(`[Semantic Search] Querying database for closest videos...`);
  const rows = await db
    .select({
      slug: videos.slug,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      viewCount: finishedVideoViews,
      publishedAt: videos.publishedAt,
      channelName: channels.name,
      channelAvatar: channels.avatarUrl,
      similarity,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .orderBy(desc(similarity))
    .limit(20);

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    channel: row.channelName,
    channelAvatar: row.channelAvatar ?? FALLBACK_AVATAR,
    thumbnail: row.thumbnailUrl ?? FALLBACK_THUMB,
    views: formatCount(row.viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
    similarity: Number(row.similarity),
  }));
}

/** Search short-form vertical videos using semantic search (CLIP embeddings). */
export async function searchHomeShorts(query: string): Promise<(Short & { similarity: number })[]> {
  if (!query || !query.trim()) {
    const fallback = await getHomeShorts();
    return fallback.map(s => ({ ...s, similarity: 1.0 }));
  }

  const queryVector = await getTextEmbedding(query);

  const titleDist = cosineDistance(shorts.titleEmbedding, queryVector);
  const thumbDist = cosineDistance(shorts.thumbnailEmbedding, queryVector);

  const combinedDistance = sql<number>`least(
    coalesce(${titleDist}, 1.0),
    coalesce(${thumbDist}, 1.0)
  )`;

  const similarity = sql<number>`1 - ${combinedDistance}`;

  const rows = await db
    .select({
      slug: shorts.slug,
      title: shorts.title,
      thumbnailUrl: shorts.thumbnailUrl,
      viewCount: sql<number>`0`.mapWith(Number),
      publishedAt: shorts.publishedAt,
      similarity,
    })
    .from(shorts)
    .orderBy(desc(similarity))
    .limit(12);

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    views: formatCount(row.viewCount, "views"),
    thumbnail: row.thumbnailUrl ?? FALLBACK_THUMB,
    similarity: Number(row.similarity),
  }));
}

/** Fetch a single Short by its slug for watching. */
export async function getWatchShort(slug: string) {
  const [row] = await db
    .select({
      id: shorts.id,
      slug: shorts.slug,
      title: shorts.title,
      thumbnailUrl: shorts.thumbnailUrl,
      videoUrl: shorts.videoUrl,
      likeCount: shorts.likeCount,
      publishedAt: shorts.publishedAt,
      channelId: channels.id,
      channelName: channels.name,
      channelAvatar: channels.avatarUrl,
      subscriberCount: channels.subscriberCount,
    })
    .from(shorts)
    .innerJoin(channels, eq(shorts.channelId, channels.id))
    .where(eq(shorts.slug, slug))
    .limit(1);

  if (!row) return null;

  // Generate a deterministic-looking view count based on likes
  const pseudoLikes = Number(row.likeCount) || 1200;
  const viewCount = pseudoLikes * 18 + 12000;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    channel: row.channelName,
    channelAvatar: row.channelAvatar ?? FALLBACK_AVATAR,
    subscribers: formatCount(row.subscriberCount, "subscribers"),
    poster: row.thumbnailUrl ?? FALLBACK_POSTER,
    streamId: row.videoUrl ?? undefined,
    views: formatCount(viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
    likes: formatCount(pseudoLikes),
  };
}

/** Fetch all shorts for vertical feed navigation. */
export async function getAllShorts() {
  const rows = await db
    .select({
      slug: shorts.slug,
      title: shorts.title,
      thumbnailUrl: shorts.thumbnailUrl,
    })
    .from(shorts)
    .orderBy(desc(shorts.publishedAt));

  return rows;
}

/** Fetch the user's watch history from the views table. */
export async function getUserWatchHistory(userId: string): Promise<Video[]> {
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
      watchedAt: views.updatedAt,
    })
    .from(views)
    .innerJoin(videos, eq(views.videoId, videos.id))
    .innerJoin(channels, eq(videos.channelId, channels.id))
    .where(eq(views.userId, userId))
    .orderBy(desc(views.updatedAt));

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    channel: row.channelName,
    channelAvatar: row.channelAvatar ?? FALLBACK_AVATAR,
    thumbnail: row.thumbnailUrl ?? FALLBACK_THUMB,
    views: formatCount(row.viewCount, "views"),
    publishedAt: formatRelativeTime(row.publishedAt),
  }));
}
