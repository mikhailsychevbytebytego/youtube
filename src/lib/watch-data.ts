import { videos } from "@/lib/meowtube-data";

export type Recommendation = {
  id: string;
  title: string;
  channel: string;
  views: string;
  publishedAt: string;
  thumbnail: string;
  /** When set, a labelled divider is rendered before this item. */
  sectionLabel?: string;
  similarity?: number;
};

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  timeAgo: string;
  text: string;
  likes: string;
};

export type WatchVideo = {
  id: string;
  title: string;
  channel: string;
  channelAvatar: string;
  subscribers: string;
  poster: string;
  /** Cloudflare Stream video UID when the video was uploaded. */
  streamId?: string;
  views: string;
  publishedAt: string;
  likes: string;
  description: string;
  /** Visual fill of the scrubber, 0-100. */
  progress: number;
  currentTime: string;
  duration: string;
};

export const featuredVideo: WatchVideo = {
  id: "tiny-kitten-box",
  title: "Tiny Kitten Discovers a Cardboard Box",
  channel: "Whiskers Wonders",
  channelAvatar: "/meowtube/watch/w-channel.png",
  subscribers: "1.3M subscribers",
  poster: "/meowtube/watch/w-player.png",
  views: "1.3M views",
  publishedAt: "2 weeks ago",
  likes: "142K",
  description:
    "This little furball spent hours exploring his first box! We couldn't stop filming his reaction. Check out the whiskers and the jumps... more",
  progress: 38,
  currentTime: "0:14",
  duration: "3:45",
};

export const recommendations: Recommendation[] = [
  {
    id: "grooming-guide",
    title: "Grooming Guide: Keeping your cat fluffy",
    channel: "Kitty Care",
    views: "45K views",
    publishedAt: "1 year ago",
    thumbnail: "/meowtube/watch/rec-1.png",
  },
  {
    id: "cat-mirror",
    title: "Cat Reacts to Mirror for the first time",
    channel: "Funny Felines",
    views: "892K views",
    publishedAt: "3 months ago",
    thumbnail: "/meowtube/watch/rec-2.png",
  },
  {
    id: "cat-reel-compilation",
    title: "Ultimate Cat Reel Compilation 2024",
    channel: "ReelCats",
    views: "2.1M views",
    publishedAt: "2 weeks ago",
    thumbnail: "/meowtube/watch/rec-3.png",
    sectionLabel: "Kittens",
  },
  {
    id: "why-high-places",
    title: "Why Cats Love High Places",
    channel: "Whiskers Wonders",
    views: "120K views",
    publishedAt: "5 days ago",
    thumbnail: "/meowtube/watch/rec-4.png",
  },
  {
    id: "bengal-first-walk",
    title: "Bengal Kitten's First Walk Outside",
    channel: "Wild At Home",
    views: "56K views",
    publishedAt: "8 hours ago",
    thumbnail: "/meowtube/watch/rec-5.png",
    sectionLabel: "Cat Reels",
  },
  {
    id: "sleeping-positions",
    title: "Sleeping positions and what they mean",
    channel: "Purrfect Info",
    views: "1.5M views",
    publishedAt: "2 years ago",
    thumbnail: "/meowtube/watch/rec-6.png",
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    author: "CatLover99",
    avatar: "/meowtube/watch/w-commenter.png",
    timeAgo: "2 days ago",
    text: "The way he just tumbles in is everything! I need ten of these kittens immediately.",
    likes: "82",
  },
];

export const commentCount = "482 Comments";
export const viewerAvatar = "/meowtube/watch/w-me.png";

/**
 * Resolves a watch video by id. Falls back to the featured video, but overrides
 * the hero metadata when the id matches a home-feed video or a recommendation,
 * so navigating from anywhere feels connected.
 */
export function getWatchVideo(id: string): WatchVideo {
  const fromHome = videos.find((v) => v.id === id);
  if (fromHome) {
    return {
      ...featuredVideo,
      id: fromHome.id,
      title: fromHome.title,
      channel: fromHome.channel,
      channelAvatar: fromHome.channelAvatar,
      poster: fromHome.thumbnail,
      views: fromHome.views,
      publishedAt: fromHome.publishedAt,
    };
  }

  const fromRec = recommendations.find((r) => r.id === id);
  if (fromRec) {
    return {
      ...featuredVideo,
      id: fromRec.id,
      title: fromRec.title,
      channel: fromRec.channel,
      poster: fromRec.thumbnail,
      views: fromRec.views,
      publishedAt: fromRec.publishedAt,
    };
  }

  return featuredVideo;
}
