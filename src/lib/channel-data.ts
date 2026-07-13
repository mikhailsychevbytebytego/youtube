export type ChannelVideo = {
  id: string;
  title: string;
  meta: string;
  thumbnail: string;
  duration?: string;
  isLive?: boolean;
};

export type ChannelShort = {
  id: string;
  title: string;
  views: string;
  thumbnail: string;
};

export const channel = {
  name: "The Daily Purr",
  handle: "@thedailypurr · 2.4M subscribers",
  description: "Purring our way through life, one whisker at a time. 🐾",
  avatar: "/images/avatar-daily-purr.png",
  banner: "/images/channel-banner.png",
};

export const channelTabs = [
  "Home",
  "Videos",
  "Shorts",
  "Live",
  "Playlists",
  "Community",
];

export const featuredVideo = {
  title: "Tiny Kitten Discovers a Cardboard Box",
  meta: "1.8M views · 3 days ago",
  description:
    "Sometimes the simplest things bring the greatest joy. Watch this tiny kitten make the most amazing discovery!",
  thumbnail: "/images/featured-kitten-box.png",
  duration: "0:24",
};

export const uploads: ChannelVideo[] = [
  {
    id: "laser-pointer",
    title: "Laser Pointer Chase Championship",
    meta: "912K views · 1 week ago",
    thumbnail: "/images/upload-laser-pointer.png",
    duration: "4:12",
  },
  {
    id: "cat-nap-lofi",
    title: "Cat Nap Lo-fi Mix",
    meta: "1.2M views · 2 weeks ago",
    thumbnail: "/images/upload-cat-nap-lofi.png",
    duration: "1:02:15",
  },
  {
    id: "tuna-taste",
    title: "Tuna Taste Test",
    meta: "680K views · 3 days ago",
    thumbnail: "/images/upload-tuna-taste.png",
    duration: "6:33",
  },
  {
    id: "birdwatching",
    title: "Window Birdwatching Live",
    meta: "3.7K watching · LIVE",
    thumbnail: "/images/upload-birdwatching.png",
    isLive: true,
  },
  {
    id: "train-human",
    title: "How to Train Your Human",
    meta: "1.1M views · 2 weeks ago",
    thumbnail: "/images/upload-train-human.png",
    duration: "7:48",
  },
];

export const channelShorts: ChannelShort[] = [
  {
    id: "playful-paws",
    title: "Playful Paws",
    views: "2M views",
    thumbnail: "/images/chshort-playful-paws.png",
  },
  {
    id: "box-logic",
    title: "Box Logic",
    views: "5.4M views",
    thumbnail: "/images/chshort-box-logic.png",
  },
  {
    id: "staring-contest",
    title: "Staring Contest",
    views: "890K views",
    thumbnail: "/images/chshort-staring-contest.png",
  },
  {
    id: "midnight-screams",
    title: "Midnight Screams",
    views: "1.2M views",
    thumbnail: "/images/chshort-midnight-screams.png",
  },
  {
    id: "coolest-cat",
    title: "Coolest Cat",
    views: "3M views",
    thumbnail: "/images/chshort-coolest-cat.png",
  },
  {
    id: "what-was-that",
    title: "What was that?",
    views: "7.1M views",
    thumbnail: "/images/chshort-what-was-that.png",
  },
];

export const channelSubscriptions = [
  {
    id: "whisker-wonders",
    name: "Whisker Wonders",
    avatar: "/images/avatar-whisker-wonders-2.png",
    hasNew: true,
  },
  {
    id: "cattitude-daily",
    name: "Cattitude Daily",
    avatar: "/images/avatar-cattitude-daily-2.png",
    hasNew: false,
  },
  {
    id: "purrfect-moments",
    name: "Purrfect Moments",
    avatar: "/images/avatar-purrfect-moments-2.png",
    hasNew: true,
  },
  {
    id: "meowgical",
    name: "Meowgical",
    avatar: "/images/avatar-meowgical-2.png",
    hasNew: false,
  },
  {
    id: "kitten-academy",
    name: "Kitten Academy",
    avatar: "/images/avatar-kitten-academy.png",
    hasNew: false,
  },
];
