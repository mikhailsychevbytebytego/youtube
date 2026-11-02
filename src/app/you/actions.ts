"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  normalizeAvatarUrl,
  normalizeChannelName,
  normalizeDescription,
  normalizeHandle,
} from "@/lib/channel";
import { getChannelForUser } from "@/lib/queries";

export type CreateChannelState = {
  error: string | null;
  field?: "name" | "handle";
};

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { code, cause } = error as { code?: unknown; cause?: unknown };
  return code === "23505" || isUniqueViolation(cause);
}

export async function createOwnedChannel(
  _prev: CreateChannelState,
  formData: FormData,
): Promise<CreateChannelState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/signin?next=/you/create");
  }

  const existing = await getChannelForUser(session.user.id);
  if (existing) {
    redirect("/you");
  }

  const name = normalizeChannelName(String(formData.get("name") ?? ""));
  if (!name) {
    return {
      error: "Pick a channel name between 2 and 50 characters.",
      field: "name",
    };
  }

  const handle = normalizeHandle(String(formData.get("handle") ?? ""));
  if (!handle) {
    return {
      error: "Handle must be 3–30 letters, numbers, or underscores.",
      field: "handle",
    };
  }

  const description = normalizeDescription(
    String(formData.get("description") ?? ""),
  );
  if (description === null && String(formData.get("description") ?? "").trim()) {
    return { error: "Keep the description under 500 characters." };
  }

  const avatarUrl = normalizeAvatarUrl(String(formData.get("avatarUrl") ?? ""));

  try {
    await db.insert(channels).values({
      userId: session.user.id,
      name,
      handle,
      description,
      avatarUrl,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: "That handle is taken, or you already have a channel.",
        field: "handle",
      };
    }
    throw error;
  }

  revalidatePath("/you");
  revalidatePath("/channel");
  redirect("/you");
}
