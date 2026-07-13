export type UpNextVideo = {
  id: string;
  title: string;
  channel: string;
  meta: string;
  thumbnail: string;
  duration?: string;
  isLive?: boolean;
};

export type MiniShort = {
  id: string;
  thumbnail: string;
  duration?: string;
};

export type WatchSubscription = {
  id: string;
  name: string;
  avatar: string;
  hasNew: boolean;
};

export const watchVideo = {
  title: "Tiny Kitten Discovers a Cardboard Box",
  channel: "Whisker Wonders",
  channelAvatar: "/images/avatar-whisker-wonders-lg.png",
  subscribers: "2.35M purrscribers",
  likes: "46K",
  views: "1.8M views",
  age: "3 days ago",
  hashtags: "#kittens #cute #cardboardbox",
  description:
    "Sometimes the simplest things bring the greatest joy. Watch this tiny kitten make the most amazing discovery!",
  poster: "/images/player-kitten-box.png",
  currentTime: "0:05",
  totalTime: "0:24",
};

export const watchComment = {
  author: "PurrfectLife",
  age: "3 days ago",
  avatar: "/images/avatar-purrfectlife.png",
  text: "Box: 1, Kitten: 0 😹",
  likes: "2.1K",
};

export const watchSubscriptions: WatchSubscription[] = [
  {
    id: "whisker-wonders",
    name: "Whisker Wonders",
    avatar: "/images/avatar-whisker-wonders.png",
    hasNew: true,
  },
  {
    id: "cattitude-daily",
    name: "Cattitude Daily",
    avatar: "/images/avatar-cattitude-daily.png",
    hasNew: false,
  },
  {
    id: "purrfect-moments",
    name: "Purrfect Moments",
    avatar: "/images/avatar-purrfect-moments.png",
    hasNew: true,
  },
  {
    id: "meowgical",
    name: "Meowgical",
    avatar: "/images/avatar-meowgical.png",
    hasNew: false,
  },
];

export const upNextVideos: UpNextVideo[] = [
  {
    id: "laser-pointer",
    title: "Laser Pointer Chase Championship",
    channel: "Cattitude Daily",
    meta: "912K views • 1 week ago",
    thumbnail: "/images/upnext-laser-pointer.png",
    duration: "4:12",
  },
  {
    id: "cat-nap-lofi",
    title: "Cat Nap Lo-fi Mix",
    channel: "LoFi Paws",
    meta: "1.2M views • 2 weeks ago",
    thumbnail: "/images/upnext-cat-nap-lofi.png",
    duration: "1:02:15",
  },
  {
    id: "tuna-taste",
    title: "Tuna Taste Test",
    channel: "Purrfect Moments",
    meta: "680K views • 5 days ago",
    thumbnail: "/images/upnext-tuna-taste.png",
    duration: "6:33",
  },
  {
    id: "birdwatching",
    title: "Window Birdwatching Live",
    channel: "Meowgical",
    meta: "3.7K watching",
    thumbnail: "/images/upnext-birdwatching.png",
    isLive: true,
  },
];

export const kittenShorts: MiniShort[] = [
  { id: "kitten-1", thumbnail: "/images/kitten-short-1.png", duration: "0:15" },
  { id: "kitten-2", thumbnail: "/images/kitten-short-2.png", duration: "0:18" },
  { id: "kitten-3", thumbnail: "/images/kitten-short-3.png", duration: "0:21" },
];

export const catShorts: MiniShort[] = [
  { id: "cat-1", thumbnail: "/images/cat-short-1.png" },
  { id: "cat-2", thumbnail: "/images/cat-short-2.png" },
  { id: "cat-3", thumbnail: "/images/cat-short-3.png" },
];
