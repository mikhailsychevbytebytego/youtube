import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

export const videoType = pgEnum("video_type", ["video", "short", "live"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    isAdmin: boolean("is_admin").notNull().default(false),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    pgPolicy("users_select_all", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
  ],
);

export const channels = pgTable(
  "channels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    handle: text("handle").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    subscriberCount: integer("subscriber_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("channels_handle_idx").on(table.handle),
    index("channels_user_id_idx").on(table.userId),
    pgPolicy("channels_select_all", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
  ],
);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    // Production script used to generate the video (mock/AI-generated entries)
    script: text("script"),
    // Local path to the AI-generated video file (mock entries)
    videoUrl: text("video_url"),
    type: videoType("type").notNull().default("video"),
    thumbnailUrl: text("thumbnail_url"),
    // Cloudflare Stream video UID; null until the upload is processed
    streamUid: text("stream_uid"),
    durationSeconds: integer("duration_seconds"),
    // CLIP (clip-vit-base-patch32) embeddings; text and image share the
    // same 512-dim space, so any of these can be compared to any other.
    titleEmbedding: vector("title_embedding", { dimensions: 512 }),
    descriptionEmbedding: vector("description_embedding", { dimensions: 512 }),
    thumbnailEmbedding: vector("thumbnail_embedding", { dimensions: 512 }),
    isPublished: boolean("is_published").notNull().default(true),
    viewCount: bigint("view_count", { mode: "number" }).notNull().default(0),
    likeCount: bigint("like_count", { mode: "number" }).notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("videos_channel_id_idx").on(table.channelId),
    index("videos_published_at_idx").on(table.publishedAt),
    pgPolicy("videos_select_published", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`${table.isPublished} = true`,
    }),
  ],
);

// --- Better Auth tables ---
// RLS is enabled with no policies: the app talks to Postgres as the table
// owner, and nothing should be readable through the Supabase Data API.

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("sessions_token_idx").on(table.token),
    index("sessions_user_id_idx").on(table.userId),
  ],
).enableRLS();

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    password: text("password"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
).enableRLS();

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
).enableRLS();

export const usersRelations = relations(users, ({ many }) => ({
  channels: many(channels),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
  owner: one(users, {
    fields: [channels.userId],
    references: [users.id],
  }),
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  channel: one(channels, {
    fields: [videos.channelId],
    references: [channels.id],
  }),
  watchEvents: many(watchEvents),
}));

export const watchEvents = pgTable(
  "watch_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    seconds: integer("seconds").notNull().default(2),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("watch_events_video_id_idx").on(table.videoId),
    index("watch_events_created_at_idx").on(table.createdAt),
    pgPolicy("watch_events_select_all", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),
  ],
);

export const watchEventsRelations = relations(watchEvents, ({ one }) => ({
  video: one(videos, {
    fields: [watchEvents.videoId],
    references: [videos.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type WatchEvent = typeof watchEvents.$inferSelect;
export type NewWatchEvent = typeof watchEvents.$inferInsert;
