export type ChannelVideo = {
  id: string;
  title: string;
  views: string;
  publishedAt: string;
  thumbnail: string;
};

export type ChannelShort = {
  id: string;
  title: string;
  views: string;
  thumbnail: string;
};

export type Channel = {
  id: string;
  name: string;
  handle: string;
  subscribers: string;
  rawSubscriberCount: number;
  description: string;
  banner: string;
  avatar: string;
  videos: ChannelVideo[];
  shorts: ChannelShort[];
};

export const channelTabs = ["Videos", "Shorts", "About"];
export const channelFilters = ["Latest", "Popular", "Oldest"];

/** Turns a channel display name into a URL slug, e.g. "The Daily Purr" -> "the-daily-purr". */
export function channelSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Convenience for building a channel link from a display name. */
export function channelHref(name: string): string {
  return `/channel/${channelSlug(name)}`;
}
