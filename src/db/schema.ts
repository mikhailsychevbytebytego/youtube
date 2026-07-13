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
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

export const videoType = pgEnum("video_type", ["video", "short", "live"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
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
    type: videoType("type").notNull().default("video"),
    thumbnailUrl: text("thumbnail_url"),
    // Cloudflare Stream video UID; null until the upload is processed
    streamUid: text("stream_uid"),
    durationSeconds: integer("duration_seconds"),
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

export const videosRelations = relations(videos, ({ one }) => ({
  channel: one(channels, {
    fields: [videos.channelId],
    references: [channels.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
