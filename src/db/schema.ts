import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const viewStateEnum = pgEnum("view_state", ["started", "finished"]);

/**
 * MeowTube account — also the Better Auth user table (email/password, sessions).
 */
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull().default(false),
    image: text(),
    handle: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_key").on(t.email),
    uniqueIndex("users_handle_key").on(t.handle),
  ],
);

/** A channel that publishes videos and shorts. Owned by a user. */
export const channels = pgTable(
  "channels",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    handle: text().notNull(),
    description: text(),
    avatarUrl: text(),
    bannerUrl: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("channels_handle_key").on(t.handle),
    index("channels_owner_id_idx").on(t.ownerId),
  ],
);

/** A long-form video belonging to a channel. */
export const videos = pgTable(
  "videos",
  {
    id: uuid().primaryKey().defaultRandom(),
    channelId: uuid()
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    slug: text().notNull(),
    title: text().notNull(),
    description: text(),
    thumbnailUrl: text(),
    videoUrl: text(),
    durationSeconds: integer(),
    likeCount: bigint({ mode: "number" }).notNull().default(0),
    titleEmbedding: vector("title_embedding", { dimensions: 512 }),
    descriptionEmbedding: vector("description_embedding", { dimensions: 512 }),
    thumbnailEmbedding: vector("thumbnail_embedding", { dimensions: 512 }),
    publishedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("videos_slug_key").on(t.slug),
    index("videos_channel_id_idx").on(t.channelId),
    index("videos_published_at_idx").on(sql`${t.publishedAt} desc`),
    index("videos_title_embedding_idx").using("hnsw", t.titleEmbedding.op("vector_cosine_ops")),
    index("videos_description_embedding_idx").using("hnsw", t.descriptionEmbedding.op("vector_cosine_ops")),
    index("videos_thumbnail_embedding_idx").using("hnsw", t.thumbnailEmbedding.op("vector_cosine_ops")),
  ],
);

/** A short-form vertical video belonging to a channel. */
export const shorts = pgTable(
  "shorts",
  {
    id: uuid().primaryKey().defaultRandom(),
    channelId: uuid()
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    slug: text().notNull(),
    title: text().notNull(),
    thumbnailUrl: text(),
    videoUrl: text(),
    durationSeconds: integer(),
    likeCount: bigint({ mode: "number" }).notNull().default(0),
    titleEmbedding: vector("title_embedding", { dimensions: 512 }),
    thumbnailEmbedding: vector("thumbnail_embedding", { dimensions: 512 }),
    publishedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("shorts_slug_key").on(t.slug),
    index("shorts_channel_id_idx").on(t.channelId),
    index("shorts_published_at_idx").on(sql`${t.publishedAt} desc`),
    index("shorts_title_embedding_idx").using("hnsw", t.titleEmbedding.op("vector_cosine_ops")),
    index("shorts_thumbnail_embedding_idx").using("hnsw", t.thumbnailEmbedding.op("vector_cosine_ops")),
  ],
);

/** A watch session for a long-form video. Only `finished` rows count as views. */
export const views = pgTable(
  "views",
  {
    id: uuid().primaryKey().defaultRandom(),
    videoId: uuid()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    state: viewStateEnum().notNull().default("started"),
    pingCount: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("views_video_id_idx").on(t.videoId),
    index("views_video_id_state_idx").on(t.videoId, t.state),
  ],
);

export const channelsRelations = relations(channels, ({ one, many }) => ({
  owner: one(users, {
    fields: [channels.ownerId],
    references: [users.id],
  }),
  videos: many(videos),
  shorts: many(shorts),
  comments: many(comments),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  channel: one(channels, {
    fields: [videos.channelId],
    references: [channels.id],
  }),
  views: many(views),
  comments: many(comments),
}));

export const viewsRelations = relations(views, ({ one }) => ({
  video: one(videos, {
    fields: [views.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [views.userId],
    references: [users.id],
  }),
}));

export const comments = pgTable(
  "comments",
  {
    id: uuid().primaryKey().defaultRandom(),
    videoId: uuid()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    channelId: uuid()
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    text: text().notNull(),
    likeCount: bigint({ mode: "number" }).notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("comments_video_channel_idx").on(t.videoId, t.channelId),
    index("comments_video_id_idx").on(t.videoId),
    index("comments_channel_id_idx").on(t.channelId),
  ],
);

export const commentsRelations = relations(comments, ({ one }) => ({
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  channel: one(channels, {
    fields: [comments.channelId],
    references: [channels.id],
  }),
}));

export const shortsRelations = relations(shorts, ({ one }) => ({
  channel: one(channels, {
    fields: [shorts.channelId],
    references: [channels.id],
  }),
}));

/** A subscription of a user to a channel. */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("subscriptions_user_channel_idx").on(t.userId, t.channelId),
    index("subscriptions_user_id_idx").on(t.userId),
    index("subscriptions_channel_id_idx").on(t.channelId),
  ],
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [subscriptions.channelId],
    references: [channels.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type Short = typeof shorts.$inferSelect;
export type NewShort = typeof shorts.$inferInsert;
export type View = typeof views.$inferSelect;
export type NewView = typeof views.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
