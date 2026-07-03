import { and, eq } from "drizzle-orm";

import { db, videos, views } from "@/db";

const FINISHED_PING_THRESHOLD = 3;

export type ViewPingResult = {
  viewId: string;
  state: "started" | "finished";
  pingCount: number;
};

export async function resolveVideoIdBySlug(slug: string): Promise<string | null> {
  const [row] = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.slug, slug))
    .limit(1);

  return row?.id ?? null;
}

export async function recordViewPing(
  videoSlug: string,
  viewId: string | undefined,
  userId: string | undefined,
): Promise<ViewPingResult | null> {
  const videoId = await resolveVideoIdBySlug(videoSlug);
  if (!videoId) return null;

  if (!viewId) {
    const [created] = await db
      .insert(views)
      .values({
        videoId,
        userId,
        state: "started",
        pingCount: 1,
      })
      .returning({
        id: views.id,
        state: views.state,
        pingCount: views.pingCount,
      });

    return {
      viewId: created.id,
      state: created.state,
      pingCount: created.pingCount,
    };
  }

  const [existing] = await db
    .select({
      id: views.id,
      videoId: views.videoId,
      state: views.state,
      pingCount: views.pingCount,
    })
    .from(views)
    .where(eq(views.id, viewId))
    .limit(1);

  if (!existing || existing.videoId !== videoId) {
    return null;
  }

  if (existing.state === "finished") {
    return {
      viewId: existing.id,
      state: existing.state,
      pingCount: existing.pingCount,
    };
  }

  const nextPingCount = existing.pingCount + 1;
  const nextState = nextPingCount >= FINISHED_PING_THRESHOLD ? "finished" : "started";

  const [updated] = await db
    .update(views)
    .set({
      pingCount: nextPingCount,
      state: nextState,
      updatedAt: new Date(),
    })
    .where(and(eq(views.id, viewId), eq(views.videoId, videoId)))
    .returning({
      id: views.id,
      state: views.state,
      pingCount: views.pingCount,
    });

  return {
    viewId: updated.id,
    state: updated.state,
    pingCount: updated.pingCount,
  };
}
