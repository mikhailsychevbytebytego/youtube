/**
 * Serializable admin metadata shared by the server pages and the client table.
 * Intentionally free of Drizzle/server imports so it can be used in Client
 * Components. The mapping from entity key -> Drizzle table lives in actions.ts.
 */

export type FieldType = "text" | "number" | "textarea" | "datetime" | "select";

export type AdminField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** For `select` fields: which related table the options come from. */
  optionsFrom?: EntityKey;
  /** When true, render the value as an image thumbnail in the table. */
  preview?: boolean;
  /**
   * For a `preview` field: a link target where `:field` tokens are replaced
   * with the row's values, e.g. "/watch/:slug".
   */
  linkPattern?: string;
  /** When true, the field is editable in the form but hidden from the table. */
  hideInTable?: boolean;
};

export type EntityKey = "users" | "channels" | "videos" | "shorts";

export type EntityConfig = {
  key: EntityKey;
  label: string;
  singular: string;
  fields: AdminField[];
};

export const entityConfigs: Record<EntityKey, EntityConfig> = {
  users: {
    key: "users",
    label: "Users",
    singular: "User",
    fields: [
      { name: "email", label: "Email", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "handle", label: "Handle", type: "text" },
      { name: "image", label: "Avatar URL", type: "text" },
    ],
  },
  channels: {
    key: "channels",
    label: "Channels",
    singular: "Channel",
    fields: [
      { name: "ownerId", label: "Owner", type: "select", optionsFrom: "users", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "handle", label: "Handle", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "avatarUrl", label: "Avatar URL", type: "text" },
      { name: "bannerUrl", label: "Banner URL", type: "text" },
      { name: "subscriberCount", label: "Subscribers", type: "number" },
    ],
  },
  videos: {
    key: "videos",
    label: "Videos",
    singular: "Video",
    fields: [
      { name: "thumbnailUrl", label: "Thumbnail", type: "text", preview: true, linkPattern: "/watch/:slug" },
      { name: "videoUrl", label: "Video URL", type: "text", hideInTable: true },
      { name: "channelId", label: "Channel", type: "select", optionsFrom: "channels", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "durationSeconds", label: "Duration (s)", type: "number" },
      { name: "likeCount", label: "Likes", type: "number" },
      { name: "publishedAt", label: "Published at", type: "datetime" },
    ],
  },
  shorts: {
    key: "shorts",
    label: "Shorts",
    singular: "Short",
    fields: [
      { name: "thumbnailUrl", label: "Thumbnail", type: "text", preview: true, linkPattern: "/watch/:slug" },
      { name: "videoUrl", label: "Short URL", type: "text", hideInTable: true },
      { name: "channelId", label: "Channel", type: "select", optionsFrom: "channels", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "durationSeconds", label: "Duration (s)", type: "number" },
      { name: "likeCount", label: "Likes", type: "number" },
      { name: "publishedAt", label: "Published at", type: "datetime" },
    ],
  },
};

export const entityKeys = Object.keys(entityConfigs) as EntityKey[];

export function isEntityKey(value: string): value is EntityKey {
  return value in entityConfigs;
}

export type SelectOption = { value: string; label: string };

/** Form action result, compatible with React's useActionState. */
export type ActionState = { success: boolean; error?: string };
