"use client";

import Image from "next/image";
import { useState } from "react";
import { Stream } from "@cloudflare/stream-react";
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
  const [isPlaying, setIsPlaying] = useState(false);

  useViewTracking(video.id, isPlaying);

  const posterUrl = toAbsoluteUrl(video.poster);
  const streamId = video.streamId ?? FALLBACK_STREAM_VIDEO_ID;

  return (
    <div className="relative aspect-[7/4] w-full overflow-hidden rounded-xl bg-black">
      {/* Cloudflare Stream player */}
      <div className={`absolute inset-0 opacity-100`}>
        {/* Wrap stream in a 16:9 container that matches height, so width overflows and crops the side black bars */}
        <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 scale-[1.02]" style={{ aspectRatio: '16/9' }}>
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
      </div>
    </div>
  );
}
