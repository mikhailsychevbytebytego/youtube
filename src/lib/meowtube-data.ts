import {
  Cat,
  ClockArrowUp,
  ClockFading,
  Compass,
  Film,
  House,
  Library,
  SquarePlay,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export type Subscription = {
  name: string;
  avatar: string;
  hasNotification?: boolean;
};

export type Video = {
  id: string;
  title: string;
  channel: string;
  channelAvatar: string;
  thumbnail: string;
  views: string;
  publishedAt: string;
  similarity?: number;
};

export type Short = {
  id: string;
  title: string;
  views: string;
  thumbnail: string;
  similarity?: number;
};

export const filters: string[] = [
  "All",
  "Cat Shows",
  "Shorts",
  "Live",
  "Cat Watching",
  "Saved",
  "New to you",
];

export const mainNav: NavItem[] = [
  { label: "Home", icon: House, active: true },
  { label: "Shorts", icon: Film },
  { label: "Explore", icon: Compass },
  { label: "Cat Shows", icon: Cat },
  { label: "Subscriptions", icon: SquarePlay },
];

export const libraryNav: NavItem[] = [
  { label: "Library", icon: Library },
  { label: "History", icon: ClockArrowUp },
  { label: "Watch Later", icon: ClockFading },
  { label: "Liked Videos", icon: ThumbsUp },
];

export const subscriptions: Subscription[] = [
  { name: "Grumpy Cat", avatar: "/meowtube/sub-1.png", hasNotification: true },
  { name: "Creamy Paws", avatar: "/meowtube/sub-2.png", hasNotification: true },
  { name: "Box King", avatar: "/meowtube/sub-3.png", hasNotification: true },
  { name: "Meow Expert", avatar: "/meowtube/sub-4.png", hasNotification: true },
];

export const videos: Video[] = [
  {
    id: "box-challenge-1",
    title: "If I Fits, I Sits: The Box Challenge",
    channel: "Box King",
    channelAvatar: "/meowtube/avatar-1.png",
    thumbnail: "/meowtube/thumb-1.png",
    views: "1.2M views",
    publishedAt: "2 days ago",
  },
  {
    id: "grand-meow-1",
    title: "Grand Meow Championship 2024 - Finals",
    channel: "Cat Shows Live",
    channelAvatar: "/meowtube/avatar-2.png",
    thumbnail: "/meowtube/thumb-2.png",
    views: "542K views",
    publishedAt: "5 hours ago",
  },
  {
    id: "grumpy-guide",
    title: "The Ultimate Guide to Grumpy Meows",
    channel: "Grumpy Cat TV",
    channelAvatar: "/meowtube/avatar-3.png",
    thumbnail: "/meowtube/thumb-3.png",
    views: "8.9M views",
    publishedAt: "1 year ago",
  },
  {
    id: "cat-watching-24h",
    title: "24 Hours of Cat Watching - Relaxing",
    channel: "Calm Cats",
    channelAvatar: "/meowtube/avatar-4.png",
    thumbnail: "/meowtube/thumb-4.png",
    views: "2.1M views",
    publishedAt: "3 weeks ago",
  },
  {
    id: "space-cats",
    title: "Space Cats: The Final Meowfrontier",
    channel: "Meow Expert",
    channelAvatar: "/meowtube/avatar-5.png",
    thumbnail: "/meowtube/thumb-5.png",
    views: "150K views",
    publishedAt: "1 day ago",
  },
  {
    id: "yarn-wars",
    title: "Yarn Wars: The Fluff Awakens",
    channel: "Creamy Paws",
    channelAvatar: "/meowtube/avatar-6.png",
    thumbnail: "/meowtube/thumb-6.png",
    views: "3.4M views",
    publishedAt: "6 months ago",
  },
  {
    id: "box-challenge-2",
    title: "If I Fits, I Sits: The Box Challenge",
    channel: "Box King",
    channelAvatar: "/meowtube/avatar-7.png",
    thumbnail: "/meowtube/thumb-7.png",
    views: "1.2M views",
    publishedAt: "2 days ago",
  },
  {
    id: "grand-meow-2",
    title: "Grand Meow Championship 2024 - Finals",
    channel: "Cat Shows Live",
    channelAvatar: "/meowtube/avatar-8.png",
    thumbnail: "/meowtube/thumb-8.png",
    views: "542K views",
    publishedAt: "5 hours ago",
  },
];

export const shorts: Short[] = [
  { id: "short-1", title: "Wait for it... 😂", views: "12M views", thumbnail: "/meowtube/short-1.png" },
  { id: "short-2", title: "Bless you! ❤️", views: "45M views", thumbnail: "/meowtube/short-2.png" },
  { id: "short-3", title: "Drift cat", views: "8.2M views", thumbnail: "/meowtube/short-3.png" },
  { id: "short-4", title: "I don't need humans", views: "2.1M views", thumbnail: "/meowtube/short-4.png" },
  { id: "short-5", title: "Mood right now", views: "15M views", thumbnail: "/meowtube/short-5.png" },
  { id: "short-6", title: "Target locked", views: "3.4M views", thumbnail: "/meowtube/short-6.png" },
];

export const profileAvatar = "/meowtube/profile.png";
