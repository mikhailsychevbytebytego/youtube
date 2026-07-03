"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { channels, users } from "@/db/schema";
import { getSession } from "@/lib/auth-server";
import { channelSlug } from "@/lib/channel-data";

export interface CreateChannelResult {
  success: boolean;
  error?: string;
  channelSlug?: string;
}

export async function checkChannelExists(): Promise<{ hasChannel: boolean; channelSlug?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { hasChannel: false };
  }

  const [existingChannel] = await db
    .select({ name: channels.name })
    .from(channels)
    .where(eq(channels.ownerId, session.user.id))
    .limit(1);

  if (existingChannel) {
    return {
      hasChannel: true,
      channelSlug: channelSlug(existingChannel.name),
    };
  }

  return { hasChannel: false };
}

export async function createChannel(formData: {
  name: string;
  handle: string;
  description?: string;
}): Promise<CreateChannelResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to create a channel." };
  }

  const userId = session.user.id;
  const name = formData.name.trim();
  let handle = formData.handle.trim();

  if (!name) {
    return { success: false, error: "Channel name is required." };
  }

  if (!handle) {
    return { success: false, error: "Channel handle is required." };
  }

  // Format handle to always start with @ and have no spaces or invalid characters
  if (!handle.startsWith("@")) {
    handle = `@${handle}`;
  }
  handle = handle.toLowerCase().replace(/[^a-z0-9_@]/g, "");

  if (handle === "@") {
    return { success: false, error: "Invalid channel handle." };
  }

  try {
    // 1. Check if the user already has a channel
    const [existingUserChannel] = await db
      .select({ name: channels.name })
      .from(channels)
      .where(eq(channels.ownerId, userId))
      .limit(1);

    if (existingUserChannel) {
      return {
        success: false,
        error: "You already have a channel.",
        channelSlug: channelSlug(existingUserChannel.name),
      };
    }

    // 2. Check if handle is already taken by another channel
    const [existingHandleChannel] = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.handle, handle))
      .limit(1);

    if (existingHandleChannel) {
      return { success: false, error: "This handle is already taken by another channel." };
    }

    // 3. Create the channel
    const defaultAvatar = `/meowtube/avatar-${Math.floor(Math.random() * 8) + 1}.png`;
    const defaultBanner = "/meowtube/channel/banner.png";

    const [newChannel] = await db
      .insert(channels)
      .values({
        ownerId: userId,
        name,
        handle,
        description: formData.description?.trim() || "A brand new MeowTube channel!",
        avatarUrl: defaultAvatar,
        bannerUrl: defaultBanner,
      })
      .returning({ name: channels.name });

    // 4. Update the user's handle to match the channel handle
    await db
      .update(users)
      .set({ handle })
      .where(eq(users.id, userId));

    revalidatePath("/");
    revalidatePath(`/channel/${channelSlug(name)}`);

    return {
      success: true,
      channelSlug: channelSlug(newChannel.name),
    };
  } catch (err) {
    console.error("Error creating channel:", err);
    return { success: false, error: "Failed to create channel. Please try again." };
  }
}
