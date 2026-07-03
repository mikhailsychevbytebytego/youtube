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
  name: string;
  handle: string;
  subscribers: string;
  videoCount: string;
  description: string;
  banner: string;
  avatar: string;
  videos: ChannelVideo[];
  shorts: ChannelShort[];
};

export const channelTabs = ["Videos", "Shorts", "Live", "Playlists", "Community", "About"];
export const channelFilters = ["Latest", "Popular", "Oldest"];

export const featuredChannel: Channel = {
  name: "The Daily Purr",
  handle: "@TheDailyPurr",
  subscribers: "4.2M subscribers",
  videoCount: "842 videos",
  description: "Daily dose of paws, purrs, and whiskers. Join our community of cat lovers...",
  banner: "/meowtube/channel/banner.png",
  avatar: "/meowtube/channel/avatar.png",
  videos: [
    {
      id: "vacuum-cleaner",
      title: "Kitten's first time seeing a vacuum cleaner",
      views: "1.2M views",
      publishedAt: "2 days ago",
      thumbnail: "/meowtube/channel/ch-thumb-1.png",
    },
    {
      id: "gourmet-meal",
      title: "Gourmet meal prep for a very fancy cat",
      views: "850K views",
      publishedAt: "1 week ago",
      thumbnail: "/meowtube/channel/ch-thumb-2.png",
    },
    {
      id: "hiding-spots",
      title: "Top 10 hiding spots in this cardboard box",
      views: "2.4M views",
      publishedAt: "3 days ago",
      thumbnail: "/meowtube/channel/ch-thumb-3.png",
    },
    {
      id: "sunbeam-naps",
      title: "Sunday morning sunbeam naps",
      views: "500K views",
      publishedAt: "12 hours ago",
      thumbnail: "/meowtube/channel/ch-thumb-4.png",
    },
    {
      id: "laser-dot",
      title: "The mystery of the red laser dot",
      views: "3.1M views",
      publishedAt: "1 month ago",
      thumbnail: "/meowtube/channel/ch-thumb-5.png",
    },
    {
      id: "cat-tree",
      title: "Cat tree construction gone wrong",
      views: "120K views",
      publishedAt: "5 hours ago",
      thumbnail: "/meowtube/channel/ch-thumb-6.png",
    },
    {
      id: "bird-watching",
      title: "Bird watching through the window 4K",
      views: "4.5M views",
      publishedAt: "2 weeks ago",
      thumbnail: "/meowtube/channel/ch-thumb-7.png",
    },
    {
      id: "cat-thinks-dog",
      title: "Why my cat thinks he's a dog",
      views: "900K views",
      publishedAt: "4 days ago",
      thumbnail: "/meowtube/channel/ch-thumb-8.png",
    },
  ],
  shorts: [
    { id: "zoomies", title: "Zoomies at 3am", views: "12M views", thumbnail: "/meowtube/channel/ch-short-1.png" },
    { id: "big-yawn", title: "Big yawn!", views: "5.4M views", thumbnail: "/meowtube/channel/ch-short-2.png" },
    { id: "target-acquired", title: "Target acquired", views: "8.1M views", thumbnail: "/meowtube/channel/ch-short-3.png" },
    { id: "stealing-snacks", title: "Stealing snacks", views: "2.2M views", thumbnail: "/meowtube/channel/ch-short-4.png" },
    { id: "snow-day", title: "Snow day", views: "1.8M views", thumbnail: "/meowtube/channel/ch-short-5.png" },
  ],
};

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

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Resolves a channel by slug. Reuses the featured channel's banner/videos/shorts
 * but tailors the name and handle so navigating to any channel feels real.
 */
export function getChannel(handle: string): Channel {
  const name = titleCaseFromSlug(handle) || featuredChannel.name;
  const isFeatured = channelSlug(name) === channelSlug(featuredChannel.name);

  if (isFeatured) return featuredChannel;

  return {
    ...featuredChannel,
    name,
    handle: `@${name.replace(/\s+/g, "")}`,
  };
}
