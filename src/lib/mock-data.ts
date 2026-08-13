export type Channel = {
  id: string;
  name: string;
  emoji: string;
  verified: boolean;
  /** Shows a red dot beside the channel in the sidebar. */
  streaming?: boolean;
};

export type Video = {
  id: string;
  title: string;
  channelId: string;
  emoji: string;
  /** Present on every video except live streams. */
  duration?: string;
  views?: number;
  publishedAt?: string;
  live?: boolean;
  watching?: number;
  /** Large caption burned into the thumbnail, e.g. a stream's "24/7 LIVE". */
  thumbnailCaption?: string;
};

export type Short = {
  id: string;
  title: string;
  emoji: string;
  views: number;
};

export const channels: Channel[] = [
  {
    id: "whisker-wonders",
    name: "Whisker Wonders",
    emoji: "😺",
    verified: true,
    streaming: true,
  },
  {
    id: "paws-playtime",
    name: "Paws & Playtime",
    emoji: "🐾",
    verified: true,
    streaming: true,
  },
  { id: "cat-tree-club", name: "The Cat Tree Club", emoji: "🌳", verified: false },
  { id: "tuna-terror", name: "Tuna Terror", emoji: "🐟", verified: true },
  { id: "kitten-academy", name: "Kitten Academy", emoji: "🎓", verified: false },
  { id: "zoomie-central", name: "Zoomie Central", emoji: "⚡", verified: true },
];

const channelsById = new Map(channels.map((channel) => [channel.id, channel]));

export function getChannel(id: string): Channel {
  const channel = channelsById.get(id);
  if (!channel) throw new Error(`Unknown channel: ${id}`);
  return channel;
}

/** The five channels listed under the sidebar's Subscriptions heading. */
export const subscribedChannels: Channel[] = [
  "whisker-wonders",
  "paws-playtime",
  "cat-tree-club",
  "tuna-terror",
  "kitten-academy",
].map(getChannel);

export const categories: string[] = [
  "All",
  "Kittens",
  "Cat naps",
  "Bird watching",
  "Zoomies",
  "Tuna reviews",
];

export const videos: Video[] = [
  {
    id: "tiny-kitten-box",
    title: "Tiny Kitten Discovers a Cardboard Box",
    channelId: "whisker-wonders",
    emoji: "📦",
    duration: "3:12",
    views: 1_200_000,
    publishedAt: "3 days ago",
  },
  {
    id: "window-bird-watch",
    title: "24/7 Window Bird Watch",
    channelId: "cat-tree-club",
    emoji: "🐦",
    live: true,
    watching: 3_400,
    thumbnailCaption: "24/7 LIVE 🐱",
  },
  {
    id: "best-loaf-positions",
    title: "Best Loaf Positions Ranked",
    channelId: "paws-playtime",
    emoji: "🍞",
    duration: "6:42",
    views: 987_000,
    publishedAt: "1 week ago",
  },
  {
    id: "orange-cat-chaos",
    title: "Orange Cat Chaos Compilation",
    channelId: "zoomie-central",
    emoji: "😼",
    duration: "8:15",
    views: 2_700_000,
    publishedAt: "2 weeks ago",
  },
  {
    id: "nap-like-a-pro",
    title: "How to Nap Like a Pro",
    channelId: "kitten-academy",
    emoji: "😴",
    duration: "5:36",
    views: 1_100_000,
    publishedAt: "5 days ago",
  },
  {
    id: "tuna-taste-test",
    title: "Tuna Taste Test",
    channelId: "tuna-terror",
    emoji: "🥫",
    duration: "7:28",
    views: 654_000,
    publishedAt: "4 days ago",
  },
];

export const shorts: Short[] = [
  { id: "boop-pink-nose", title: "Boop the tiny pink nose 🐱", emoji: "👃", views: 1_300_000 },
  { id: "yarn-my-passion", title: "Yarn = My passion ❤️", emoji: "🧶", views: 892_000 },
  { id: "pov-cat-tree", title: "POV: You're a cat tree 🐾", emoji: "🌳", views: 1_700_000 },
  { id: "zoomies-3am", title: "When zoomies hit at 3AM ⚡", emoji: "🌙", views: 2_200_000 },
  { id: "high-five-treats", title: "High five for treats 🐾", emoji: "🙌", views: 1_100_000 },
  { id: "box-mine-now", title: "Box? Mine now.", emoji: "📦", views: 1_600_000 },
  { id: "toe-beans", title: "Toe beans close-up 😍", emoji: "🐾", views: 945_000 },
  { id: "cool-cat", title: "Cool cat don't care 😎", emoji: "😎", views: 1_200_000 },
];
