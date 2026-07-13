import { count, desc, eq, sum } from "drizzle-orm";
import { db } from "@/db";
import {
  channels,
  users,
  videos,
  type Channel,
  type User,
  type Video,
} from "@/db/schema";

export const PAGE_SIZE = 10;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type Paginated<T> = {
  rows: T[];
  total: number;
  page: number;
  pageCount: number;
};

function toPaginated<T>(rows: T[], total: number, page: number): Paginated<T> {
  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getDashboardStats() {
  const [[userCount], [channelCount], [videoCount], [viewTotal], recentVideos] =
    await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(channels),
      db.select({ value: count() }).from(videos),
      db.select({ value: sum(videos.viewCount) }).from(videos),
      db.query.videos.findMany({
        orderBy: desc(videos.createdAt),
        limit: 5,
        with: { channel: true },
      }),
    ]);

  return {
    users: userCount.value,
    channels: channelCount.value,
    videos: videoCount.value,
    totalViews: Number(viewTotal.value ?? 0),
    recentVideos,
  };
}

export async function listUsers(page: number): Promise<Paginated<User>> {
  const [rows, [total]] = await Promise.all([
    db.query.users.findMany({
      orderBy: desc(users.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db.select({ value: count() }).from(users),
  ]);
  return toPaginated(rows, total.value, page);
}

export async function listChannels(
  page: number,
): Promise<Paginated<Channel & { owner: User }>> {
  const [rows, [total]] = await Promise.all([
    db.query.channels.findMany({
      orderBy: desc(channels.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { owner: true },
    }),
    db.select({ value: count() }).from(channels),
  ]);
  return toPaginated(rows, total.value, page);
}

export async function listVideos(
  page: number,
): Promise<Paginated<Video & { channel: Channel }>> {
  const [rows, [total]] = await Promise.all([
    db.query.videos.findMany({
      orderBy: desc(videos.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { channel: true },
    }),
    db.select({ value: count() }).from(videos),
  ]);
  return toPaginated(rows, total.value, page);
}

export async function getUser(id: string): Promise<User | null> {
  if (!isUuid(id)) return null;
  const row = await db.query.users.findFirst({ where: eq(users.id, id) });
  return row ?? null;
}

export async function getChannel(id: string): Promise<Channel | null> {
  if (!isUuid(id)) return null;
  const row = await db.query.channels.findFirst({ where: eq(channels.id, id) });
  return row ?? null;
}

export async function getVideo(id: string): Promise<Video | null> {
  if (!isUuid(id)) return null;
  const row = await db.query.videos.findFirst({ where: eq(videos.id, id) });
  return row ?? null;
}

/** All users for the channel form's owner select. */
export async function getAllUsers(): Promise<User[]> {
  return db.query.users.findMany({ orderBy: users.name });
}

/** All channels for the video form's channel select. */
export async function getAllChannels(): Promise<Channel[]> {
  return db.query.channels.findMany({ orderBy: channels.name });
}
