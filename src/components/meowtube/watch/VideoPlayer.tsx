"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Stream } from "@cloudflare/stream-react";
import {
  Captions,
  Maximize,
  PictureInPicture2,
  Play,
  Settings,
  SkipForward,
  Volume2,
} from "lucide-react";
import type { WatchVideo } from "@/lib/watch-data";
import { useViewTracking } from "@/components/meowtube/watch/useViewTracking";

const FALLBACK_STREAM_VIDEO_ID = "10c9b5c3d3a398d053592a419d9c88a1";

/**
 * Cloudflare Stream needs a fully-qualified poster URL (the iframe lives on
 * cloudflarestream.com, so a relative path would resolve against the wrong
 * origin). The Stream component handles encodeURIComponent itself.
 */
function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function VideoPlayer({ video }: { video: WatchVideo }) {
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useViewTracking(video.id, isPlaying);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const posterUrl = toAbsoluteUrl(video.poster);
  const streamId = video.streamId ?? FALLBACK_STREAM_VIDEO_ID;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {/* Cloudflare Stream player — fades in once revealed. */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <Stream
          src={streamId}
          poster={posterUrl}
          controls
          autoplay
          muted
          responsive={false}
          height="100%"
          width="100%"
          className="h-full w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Preview thumbnail + faux controls — fades out after 1s. */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          revealed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={revealed}
      >
        <Image
          src={video.poster}
          alt={video.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-full rounded-full bg-red-600" style={{ width: `${video.progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-5">
              <button type="button" aria-label="Play" className="transition-opacity hover:opacity-80">
                <Play className="size-6 fill-white" />
              </button>
              <button type="button" aria-label="Next" className="transition-opacity hover:opacity-80">
                <SkipForward className="size-6 fill-white" />
              </button>
              <button type="button" aria-label="Mute" className="transition-opacity hover:opacity-80">
                <Volume2 className="size-6" />
              </button>
              <span className="text-[13px]">
                {video.currentTime} / {video.duration}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <button type="button" aria-label="Subtitles" className="transition-opacity hover:opacity-80">
                <Captions className="size-6" />
              </button>
              <button type="button" aria-label="Settings" className="transition-opacity hover:opacity-80">
                <Settings className="size-6" />
              </button>
              <button type="button" aria-label="Picture in picture" className="transition-opacity hover:opacity-80">
                <PictureInPicture2 className="size-6" />
              </button>
              <button type="button" aria-label="Fullscreen" className="transition-opacity hover:opacity-80">
                <Maximize className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
