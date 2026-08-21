export type Channel = {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  hasNew?: boolean;
};

export type Video = {
  id: string;
  title: string;
  channelId: string;
  thumbnail: string;
  meta: string;
  duration?: string;
  isLive?: boolean;
};

export type Short = {
  id: string;
  title: string;
  cover: string;
  views: string;
};

export const channels: Record<string, Channel> = {
  "whisker-wonders": {
    id: "whisker-wonders",
    name: "Whisker Wonders",
    avatar: "/images/avatars/whisker-wonders.jpg",
    verified: true,
    hasNew: true,
  },
  "paws-playtime": {
    id: "paws-playtime",
    name: "Paws & Playtime",
    avatar: "/images/avatars/paws-playtime.jpg",
    verified: true,
    hasNew: true,
  },
  "cat-tree-club": {
    id: "cat-tree-club",
    name: "The Cat Tree Club",
    avatar: "/images/avatars/cat-tree-club.jpg",
    verified: true,
  },
  "tuna-terror": {
    id: "tuna-terror",
    name: "Tuna Terror",
    avatar: "/images/avatars/tuna-terror.jpg",
    verified: true,
  },
  "kitten-academy": {
    id: "kitten-academy",
    name: "Kitten Academy",
    avatar: "/images/avatars/kitten-academy.jpg",
    verified: true,
  },
  "zoomie-central": {
    id: "zoomie-central",
    name: "Zoomie Central",
    avatar: "/images/avatars/zoomie-central.jpg",
    verified: true,
  },
};

export const subscriptions: Channel[] = [
  channels["whisker-wonders"],
  channels["paws-playtime"],
  channels["cat-tree-club"],
  channels["tuna-terror"],
  channels["kitten-academy"],
];

export const filters: string[] = [
  "All",
  "Kittens",
  "Cat naps",
  "Bird watching",
  "Zoomies",
  "Tuna reviews",
];

export const videos: Video[] = [
  {
    id: "cardboard-box",
    title: "Tiny Kitten Discovers a Cardboard Box",
    channelId: "whisker-wonders",
    thumbnail: "/images/thumbnails/cardboard-box.jpg",
    meta: "1.2M views · 3 days ago",
    duration: "3:12",
  },
  {
    id: "window-bird-watch",
    title: "24/7 Window Bird Watch",
    channelId: "cat-tree-club",
    thumbnail: "/images/thumbnails/window-bird-watch.jpg",
    meta: "3.4K watching",
    isLive: true,
  },
  {
    id: "loaf-positions",
    title: "Best Loaf Positions Ranked",
    channelId: "paws-playtime",
    thumbnail: "/images/thumbnails/loaf-positions.jpg",
    meta: "987K views · 1 week ago",
    duration: "6:42",
  },
  {
    id: "orange-cat-chaos",
    title: "Orange Cat Chaos Compilation",
    channelId: "zoomie-central",
    thumbnail: "/images/thumbnails/orange-cat-chaos.jpg",
    meta: "2.7M views · 2 weeks ago",
    duration: "8:15",
  },
  {
    id: "nap-like-a-pro",
    title: "How to Nap Like a Pro",
    channelId: "kitten-academy",
    thumbnail: "/images/thumbnails/nap-like-a-pro.jpg",
    meta: "1.1M views · 5 days ago",
    duration: "5:36",
  },
  {
    id: "tuna-taste-test",
    title: "Tuna Taste Test",
    channelId: "tuna-terror",
    thumbnail: "/images/thumbnails/tuna-taste-test.jpg",
    meta: "654K views · 4 days ago",
    duration: "7:28",
  },
];

export const shorts: Short[] = [
  {
    id: "boop-nose",
    title: "Boop the tiny pink nose 😽",
    cover: "/images/shorts/boop-nose.jpg",
    views: "1.3M views",
  },
  {
    id: "yarn-passion",
    title: "Yarn = My passion 🧶",
    cover: "/images/shorts/yarn-passion.jpg",
    views: "892K views",
  },
  {
    id: "cat-tree-pov",
    title: "POV: You're a cat tree 😸",
    cover: "/images/shorts/cat-tree-pov.jpg",
    views: "1.7M views",
  },
  {
    id: "zoomies-3am",
    title: "When zoomies hit at 3AM ⚡",
    cover: "/images/shorts/zoomies-3am.jpg",
    views: "2.2M views",
  },
  {
    id: "high-five-treats",
    title: "High five for treats 🐾",
    cover: "/images/shorts/high-five-treats.jpg",
    views: "1.1M views",
  },
  {
    id: "box-mine-now",
    title: "Box? Mine now. 📦",
    cover: "/images/shorts/box-mine-now.jpg",
    views: "1.6M views",
  },
  {
    id: "toe-beans",
    title: "Toe beans close-up 😍",
    cover: "/images/shorts/toe-beans.jpg",
    views: "945K views",
  },
  {
    id: "cool-cat",
    title: "Cool cat don't care 😎",
    cover: "/images/shorts/cool-cat.jpg",
    views: "1.2M views",
  },
];
