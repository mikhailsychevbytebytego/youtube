"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stream } from "@cloudflare/stream-react";
import { SubscribeButton } from "@/components/meowtube/SubscribeButton";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Send,
  X,
  Play,
  Pause,
} from "lucide-react";

interface ShortData {
  id: string;
  slug: string;
  title: string;
  channel: string;
  channelAvatar: string;
  subscribers: string;
  poster: string;
  streamId?: string;
  views: string;
  publishedAt: string;
  likes: string;
}

interface ShortsPlayerProps {
  currentShort: ShortData;
  allShorts: { slug: string; title: string; thumbnailUrl: string }[];
}

interface LocalComment {
  id: string;
  author: string;
  avatar: string;
  timeAgo: string;
  text: string;
  likes: number;
}

const DEFAULT_STREAM_VIDEO_ID = "10c9b5c3d3a398d053592a419d9c88a1";

function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function ShortsPlayer({ currentShort, allShorts }: ShortsPlayerProps) {
  const router = useRouter();

  // Local interaction states
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [revealed, setRevealed] = useState(false);

  // Like calculation
  const baseLikes = parseInt(currentShort.likes.replace(/[^0-9.]/g, "")) || 1200;
  const isK = currentShort.likes.includes("K");
  const isM = currentShort.likes.includes("M");
  const multiplier = isM ? 1000000 : isK ? 1000 : 1;
  const rawLikesCount = Math.round(baseLikes * multiplier);

  const displayLikes = (rawLikesCount + (liked ? 1 : 0)).toLocaleString(undefined, {
    notation: "compact",
    compactDisplay: "short",
  });

  // Comments state
  const [commentsList, setCommentsList] = useState<LocalComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Seed comments deterministically based on short slug
  useEffect(() => {
    const seedComments: LocalComment[] = [
      {
        id: "sc-1",
        author: "WhiskersLover",
        avatar: "/meowtube/avatar-1.png",
        timeAgo: "2 hours ago",
        text: "The way this cat just looks at the camera is pure comedy! 😭🐱",
        likes: 42,
      },
      {
        id: "sc-2",
        author: "GamerCat",
        avatar: "/meowtube/avatar-2.png",
        timeAgo: "5 hours ago",
        text: "Calculated jump, but the math was slightly off! 😂",
        likes: 18,
      },
      {
        id: "sc-3",
        author: "MeowMixer",
        avatar: "/meowtube/avatar-3.png",
        timeAgo: "1 day ago",
        text: "Cats are liquid, and this short proves it.",
        likes: 125,
      },
    ];
    setCommentsList(seedComments);
    // Reset interactions on short change
    setLiked(false);
    setDisliked(false);
    setShowComments(false);
    setRevealed(false);
    setIsPlaying(true);

    const timer = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(timer);
  }, [currentShort.slug]);

  // Find next/prev short indexes
  const currentIndex = allShorts.findIndex((s) => s.slug === currentShort.slug);
  const prevShort = currentIndex > 0 ? allShorts[currentIndex - 1] : null;
  const nextShort = currentIndex < allShorts.length - 1 ? allShorts[currentIndex + 1] : null;

  const navigateTo = (slug: string) => {
    router.push(`/shorts/${slug}`);
  };

  // Keyboard navigation and key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (nextShort) navigateTo(nextShort.slug);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (prevShort) navigateTo(prevShort.slug);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevShort, nextShort]);

  const handleShare = () => {
    const absoluteUrl = window.location.href;
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const comment: LocalComment = {
      id: `sc-user-${Date.now()}`,
      author: "You",
      avatar: "/meowtube/watch/w-me.png",
      timeAgo: "Just now",
      text: newCommentText.trim(),
      likes: 0,
    };

    setCommentsList([comment, ...commentsList]);
    setNewCommentText("");
  };

  const posterUrl = toAbsoluteUrl(currentShort.poster);
  const streamId = currentShort.streamId ?? DEFAULT_STREAM_VIDEO_ID;

  return (
    <div className="flex flex-1 justify-center items-center py-4 bg-zinc-950 text-white select-none">
      <div className="flex flex-col md:flex-row items-center gap-6 h-[calc(100vh-100px)] max-h-[850px] w-full max-w-4xl px-4 relative justify-center">
        
        {/* Next/Prev Navigation Buttons (Desktop left-side vertical) */}
        <div className="hidden md:flex flex-col gap-3 absolute left-4 z-10">
          <button
            onClick={() => prevShort && navigateTo(prevShort.slug)}
            disabled={!prevShort}
            aria-label="Previous Short"
            className={`flex items-center justify-center size-12 rounded-full border border-zinc-700 bg-zinc-900/60 text-white hover:bg-zinc-800 transition-all ${
              !prevShort ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer"
            }`}
          >
            <ChevronUp className="size-6" />
          </button>
          <button
            onClick={() => nextShort && navigateTo(nextShort.slug)}
            disabled={!nextShort}
            aria-label="Next Short"
            className={`flex items-center justify-center size-12 rounded-full border border-zinc-700 bg-zinc-900/60 text-white hover:bg-zinc-800 transition-all ${
              !nextShort ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer"
            }`}
          >
            <ChevronDown className="size-6" />
          </button>
        </div>

        {/* Short Player Screen Area (9:16 Aspect ratio container) */}
        <div className="relative h-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-zinc-800">
          
          {/* Cloudflare Stream element */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              revealed ? "opacity-100" : "opacity-0"
            }`}
          >
            <Stream
              src={streamId}
              poster={posterUrl}
              controls={false}
              autoplay
              muted={isMuted}
              loop
              responsive={false}
              height="100%"
              width="100%"
              className="h-full w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>

          {/* Fallback/Intro Poster Thumbnail */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
              revealed ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src={currentShort.poster}
              alt={currentShort.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Interactive Screen Controls Overlay (Play/Pause, Mute toggles) */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none">
            <div className="flex justify-between items-center w-full pointer-events-auto">
              {/* Play/Pause indicator */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 fill-white" />}
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            </div>

            {/* Bottom Overlay containing Short Info */}
            <div className="flex flex-col gap-3 w-full pointer-events-auto text-left">
              {/* Creator Info */}
              <div className="flex items-center gap-2.5">
                <div className="relative size-9 rounded-full overflow-hidden border border-zinc-700">
                  <Image
                    src={currentShort.channelAvatar}
                    alt={currentShort.channel}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wide drop-shadow-md">
                    @{currentShort.channel.replace(/\s+/g, "")}
                  </span>
                </div>
                <SubscribeButton channelName={currentShort.channel} variant="shorts" className="ml-2" />
              </div>

              {/* Title Description */}
              <p className="text-[13px] leading-relaxed drop-shadow-md font-medium text-zinc-100 line-clamp-2">
                {currentShort.title}
              </p>
              
              {/* Extra stats indicator */}
              <span className="text-[11px] text-zinc-400 drop-shadow-sm font-normal">
                {currentShort.views} • {currentShort.publishedAt}
              </span>
            </div>
          </div>
        </div>

        {/* Action Sidebar Controls (Floating Action Buttons on the Right) */}
        <div className="flex md:flex-col gap-6 items-center justify-center md:justify-end md:h-full pb-2 md:pb-6 z-10 flex-shrink-0">
          
          {/* Like */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                setLiked(!liked);
                if (disliked) setDisliked(false);
              }}
              className={`flex items-center justify-center size-12 rounded-full transition-colors ${
                liked
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
              aria-label="Like this short"
            >
              <ThumbsUp className={`size-5 ${liked ? "fill-white" : ""}`} />
            </button>
            <span className="text-[11px] font-medium text-zinc-300">{displayLikes}</span>
          </div>

          {/* Dislike */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                setDisliked(!disliked);
                if (liked) setLiked(false);
              }}
              className={`flex items-center justify-center size-12 rounded-full transition-colors ${
                disliked
                  ? "bg-zinc-600 text-red-500"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
              aria-label="Dislike this short"
            >
              <ThumbsDown className="size-5" />
            </button>
            <span className="text-[11px] font-medium text-zinc-300">Dislike</span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center justify-center size-12 rounded-full transition-colors ${
                showComments
                  ? "bg-white text-zinc-950"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
              aria-label="Toggle comments"
            >
              <MessageSquare className="size-5" />
            </button>
            <span className="text-[11px] font-medium text-zinc-300">{commentsList.length}</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <button
              onClick={handleShare}
              className="flex items-center justify-center size-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              aria-label="Share short link"
            >
              <Share2 className="size-5" />
            </button>
            <span className="text-[11px] font-medium text-zinc-300">Share</span>
            
            {copied && (
              <div className="absolute bottom-14 bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1 rounded shadow-lg whitespace-nowrap animate-bounce text-green-400 font-semibold">
                Link Copied!
              </div>
            )}
          </div>

          {/* Next/Prev Mobile Navigation Overlay */}
          <div className="flex md:hidden gap-3 ml-2">
            <button
              onClick={() => prevShort && navigateTo(prevShort.slug)}
              disabled={!prevShort}
              className={`flex items-center justify-center size-10 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ChevronUp className="size-5" />
            </button>
            <button
              onClick={() => nextShort && navigateTo(nextShort.slug)}
              disabled={!nextShort}
              className={`flex items-center justify-center size-10 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
        </div>

        {/* Slide-out / Slide-in Comments Drawer Panel (Desktop & Mobile) */}
        {showComments && (
          <div className="absolute md:relative z-20 top-0 bottom-0 right-0 w-full max-w-sm md:w-[320px] bg-zinc-900 border border-zinc-800 md:border-l-0 rounded-2xl md:rounded-r-2xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-zinc-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="font-bold text-sm tracking-wide">Comments ({commentsList.length})</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                aria-label="Close comments"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-left">
              {commentsList.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="relative size-7 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={c.avatar} alt={c.author} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-300">{c.author}</span>
                      <span className="text-[10px] text-zinc-500">{c.timeAgo}</span>
                    </div>
                    <p className="text-xs text-zinc-100 leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <ThumbsUp className="size-3" />
                        {c.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form input */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-zinc-800 bg-zinc-900/90 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-zinc-800 text-xs border border-zinc-700 rounded-full px-3 py-2 outline-none placeholder-zinc-500 focus:border-zinc-500"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                aria-label="Send comment"
              >
                <Send className="size-3.5 fill-white" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}