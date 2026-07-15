"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { channels, users, videos, videoType } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export type FormState = { error: string | null };

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, name: string): string | null {
  return text(formData, name) || null;
}

function integer(formData: FormData, name: string): number {
  const value = Number.parseInt(text(formData, name), 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function optionalInteger(formData: FormData, name: string): number | null {
  const raw = text(formData, name);
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function dateTime(formData: FormData, name: string): Date | null {
  const raw = text(formData, name);
  if (!raw) return null;
  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? null : value;
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { code, cause } = error as { code?: unknown; cause?: unknown };
  return code === "23505" || isUniqueViolation(cause);
}

function revalidateAdmin(section: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/${section}`);
}

// --- Users ---

function parseUserForm(formData: FormData) {
  return {
    name: text(formData, "name"),
    email: text(formData, "email"),
    avatarUrl: optionalText(formData, "avatarUrl"),
    isAdmin: checkbox(formData, "isAdmin"),
  };
}

export async function createUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = parseUserForm(formData);
  if (!values.name || !values.email) {
    return { error: "Name and email are required." };
  }
  try {
    await db.insert(users).values(values);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "A user with this email already exists." };
    }
    throw error;
  }
  revalidateAdmin("users");
  redirect("/admin/users");
}

export async function updateUser(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = parseUserForm(formData);
  if (!values.name || !values.email) {
    return { error: "Name and email are required." };
  }
  try {
    await db
      .update(users)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(users.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "A user with this email already exists." };
    }
    throw error;
  }
  revalidateAdmin("users");
  redirect("/admin/users");
}

export async function deleteUser(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(users).where(eq(users.id, id));
  revalidateAdmin("users");
  revalidateAdmin("channels");
  revalidateAdmin("videos");
}

// --- Channels ---

function parseChannelForm(formData: FormData) {
  let handle = text(formData, "handle");
  if (handle && !handle.startsWith("@")) handle = `@${handle}`;
  return {
    name: text(formData, "name"),
    handle,
    userId: text(formData, "userId"),
    description: optionalText(formData, "description"),
    avatarUrl: optionalText(formData, "avatarUrl"),
    bannerUrl: optionalText(formData, "bannerUrl"),
    subscriberCount: integer(formData, "subscriberCount"),
  };
}

export async function createChannel(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = parseChannelForm(formData);
  if (!values.name || !values.handle || !values.userId) {
    return { error: "Name, handle, and owner are required." };
  }
  try {
    await db.insert(channels).values(values);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "A channel with this handle already exists." };
    }
    throw error;
  }
  revalidateAdmin("channels");
  redirect("/admin/channels");
}

export async function updateChannel(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = parseChannelForm(formData);
  if (!values.name || !values.handle || !values.userId) {
    return { error: "Name, handle, and owner are required." };
  }
  try {
    await db
      .update(channels)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(channels.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "A channel with this handle already exists." };
    }
    throw error;
  }
  revalidateAdmin("channels");
  redirect("/admin/channels");
}

export async function deleteChannel(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(channels).where(eq(channels.id, id));
  revalidateAdmin("channels");
  revalidateAdmin("videos");
}

// --- Videos ---

function parseVideoForm(formData: FormData) {
  const type = text(formData, "type");
  return {
    title: text(formData, "title"),
    channelId: text(formData, "channelId"),
    type: (videoType.enumValues as readonly string[]).includes(type)
      ? (type as (typeof videoType.enumValues)[number])
      : "video",
    description: optionalText(formData, "description"),
    thumbnailUrl: optionalText(formData, "thumbnailUrl"),
    durationSeconds: optionalInteger(formData, "durationSeconds"),
    viewCount: integer(formData, "viewCount"),
    likeCount: integer(formData, "likeCount"),
    isPublished: checkbox(formData, "isPublished"),
    publishedAt: dateTime(formData, "publishedAt") ?? new Date(),
  };
}

export async function createVideo(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = parseVideoForm(formData);
  if (!values.title || !values.channelId) {
    return { error: "Title and channel are required." };
  }
  await db.insert(videos).values(values);
  revalidateAdmin("videos");
  redirect("/admin/videos");
}

export async function updateVideo(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = parseVideoForm(formData);
  if (!values.title || !values.channelId) {
    return { error: "Title and channel are required." };
  }
  await db
    .update(videos)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(videos.id, id));
  revalidateAdmin("videos");
  redirect("/admin/videos");
}

export async function deleteVideo(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(videos).where(eq(videos.id, id));
  revalidateAdmin("videos");
}
