export type Video = {
  id: string;
  title: string;
  channel: string;
  channelAvatar: string;
  thumbnail: string;
  views: string;
  age: string;
};

export type Short = {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
};

export type Subscription = {
  id: string;
  name: string;
  avatar: string;
  isLive: boolean;
};

export const filterChips = [
  "All",
  "Cat Shows",
  "Shorts",
  "Live",
  "Cat Watching",
  "Saved",
  "New to you",
];

export const videos: Video[] = [
  {
    id: "box-challenge",
    title: "If I Fits, I Sits: The Box Challenge",
    channel: "Box King",
    channelAvatar: "/images/avatar-box-king-2.png",
    thumbnail: "/images/thumb-box-challenge.png",
    views: "1.2M views",
    age: "2 days ago",
  },
  {
    id: "meow-championship",
    title: "Grand Meow Championship 2024 - Finals",
    channel: "Cat Shows Live",
    channelAvatar: "/images/avatar-cat-shows-live.png",
    thumbnail: "/images/thumb-meow-championship.png",
    views: "542K views",
    age: "5 hours ago",
  },
  {
    id: "grumpy-meows",
    title: "The Ultimate Guide to Grumpy Meows",
    channel: "Grumpy Cat TV",
    channelAvatar: "/images/avatar-grumpy-cat-tv.png",
    thumbnail: "/images/thumb-grumpy-meows.png",
    views: "8.9M views",
    age: "1 year ago",
  },
  {
    id: "cat-watching",
    title: "24 Hours of Cat Watching - Relaxing",
    channel: "Calm Cats",
    channelAvatar: "/images/avatar-calm-cats.png",
    thumbnail: "/images/thumb-cat-watching.png",
    views: "2.1M views",
    age: "3 weeks ago",
  },
  {
    id: "space-cats",
    title: "Space Cats: The Final Meowfrontier",
    channel: "Meow Expert",
    channelAvatar: "/images/avatar-meow-expert-2.png",
    thumbnail: "/images/thumb-space-cats.png",
    views: "150K views",
    age: "1 day ago",
  },
  {
    id: "yarn-wars",
    title: "Yarn Wars: The Fluff Awakens",
    channel: "Creamy Paws",
    channelAvatar: "/images/avatar-creamy-paws-2.png",
    thumbnail: "/images/thumb-yarn-wars.png",
    views: "3.4M views",
    age: "6 months ago",
  },
  {
    id: "box-challenge-2",
    title: "If I Fits, I Sits: The Box Challenge",
    channel: "Box King",
    channelAvatar: "/images/avatar-box-king-3.png",
    thumbnail: "/images/thumb-box-challenge-2.png",
    views: "1.2M views",
    age: "2 days ago",
  },
  {
    id: "meow-championship-2",
    title: "Grand Meow Championship 2024 - Finals",
    channel: "Cat Shows Live",
    channelAvatar: "/images/avatar-cat-shows-live-2.png",
    thumbnail: "/images/thumb-meow-championship-2.png",
    views: "542K views",
    age: "5 hours ago",
  },
];

export const shorts: Short[] = [
  {
    id: "wait-for-it",
    title: "Wait for it... 😂",
    thumbnail: "/images/short-wait-for-it.png",
    views: "12M views",
  },
  {
    id: "bless-you",
    title: "Bless you! ❤️",
    thumbnail: "/images/short-bless-you.png",
    views: "45M views",
  },
  {
    id: "drift-cat",
    title: "Drift cat",
    thumbnail: "/images/short-drift-cat.png",
    views: "8.2M views",
  },
  {
    id: "no-humans",
    title: "I don't need humans",
    thumbnail: "/images/short-no-humans.png",
    views: "2.1M views",
  },
  {
    id: "mood-right-now",
    title: "Mood right now",
    thumbnail: "/images/short-mood-right-now.png",
    views: "15M views",
  },
  {
    id: "target-locked",
    title: "Target locked",
    thumbnail: "/images/short-target-locked.png",
    views: "3.4M views",
  },
];

export const subscriptions: Subscription[] = [
  {
    id: "grumpy-cat",
    name: "Grumpy Cat",
    avatar: "/images/avatar-grumpy-cat.png",
    isLive: true,
  },
  {
    id: "creamy-paws",
    name: "Creamy Paws",
    avatar: "/images/avatar-creamy-paws.png",
    isLive: true,
  },
  {
    id: "box-king",
    name: "Box King",
    avatar: "/images/avatar-box-king.png",
    isLive: true,
  },
  {
    id: "meow-expert",
    name: "Meow Expert",
    avatar: "/images/avatar-meow-expert.png",
    isLive: true,
  },
];
