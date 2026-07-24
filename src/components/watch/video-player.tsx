"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Captions,
  CirclePause,
  CirclePlay,
  Fullscreen,
  PictureInPicture,
  Settings,
  TvMinimalPlay,
  Volume2,
} from "lucide-react";
import type { Video } from "@/db/schema";
import { formatDuration } from "@/lib/format";

/**
 * Builds the Cloudflare Stream iframe embed URL from a stored playback URL
 * (e.g. https://customer-x.cloudflarestream.com/<uid>/manifest/video.m3u8).
 * Returns null for non-Stream URLs.
 */
function getStreamEmbedUrl(video: Video): string | null {
  if (!video.videoUrl) return null;
  let url: URL;
  try {
    url = new URL(video.videoUrl);
  } catch {
    return null; // relative /videos/... path
  }
  if (
    !url.hostname.endsWith("cloudflarestream.com") &&
    !url.hostname.endsWith("videodelivery.net")
  ) {
    return null;
  }

  const uid = video.streamUid ?? url.pathname.split("/").filter(Boolean)[0];
  if (!uid) return null;

  const embed = new URL(`https://iframe.videodelivery.net/${uid}`);
  embed.searchParams.set("autoplay", "true");
  embed.searchParams.set("muted", "true");
  embed.searchParams.set("preload", "true");
  // The Stream poster parameter must be an absolute URL.
  if (video.thumbnailUrl?.startsWith("https://")) {
    embed.searchParams.set("poster", video.thumbnailUrl);
  }
  return embed.toString();
}

export function VideoPlayer({ video }: { video: Video }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [toastState, setToastState] = useState<{
    visible: boolean;
    pingCount: number;
    lastPingAt: string | null;
  }>({
    visible: false,
    pingCount: 0,
    lastPingAt: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamEmbedUrl = getStreamEmbedUrl(video);

  // Watch time tracking: report a ping every 2 seconds while video is playing
  useEffect(() => {
    if (!isPlaying) return;

    const sendPing = async () => {
      try {
        const res = await fetch("/api/watch-time", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId: video.id }),
        });

        if (res.ok) {
          const now = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          setToastState((prev) => ({
            visible: true,
            pingCount: prev.pingCount + 1,
            lastPingAt: now,
          }));

          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            setToastState((prev) => ({ ...prev, visible: false }));
          }, 1600);
        }
      } catch (error) {
        console.error("Failed to send watch time ping:", error);
      }
    };

    const interval = setInterval(sendPing, 2000);

    return () => {
      clearInterval(interval);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, video.id]);

  // Handle postMessages from Cloudflare Stream iframe
  useEffect(() => {
    if (!streamEmbedUrl) return;

    const handleMessage = (event: MessageEvent) => {
      let data: Record<string, unknown> | null = null;
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
      } else if (typeof event.data === "object" && event.data !== null) {
        data = event.data as Record<string, unknown>;
      }

      if (data) {
        if (data.event === "play" || data.action === "play") setIsPlaying(true);
        if (
          data.event === "pause" ||
          data.action === "pause" ||
          data.event === "ended"
        ) {
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [streamEmbedUrl]);

  const renderToastOverlay = () => (
    <div
      className={`pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-md transition-all duration-300 ${
        toastState.visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-2 opacity-0 scale-95"
      }`}
    >
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-medium tracking-tight">
        Watch time pinged (+2s)
      </span>
      {toastState.lastPingAt && (
        <span className="font-mono text-[10px] opacity-70">
          • {toastState.lastPingAt}
        </span>
      )}
    </div>
  );

  if (streamEmbedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0f0f0f]">
        <iframe
          src={streamEmbedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="size-full border-0"
        />
        {renderToastOverlay()}
      </div>
    );
  }

  if (video.videoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0f0f0f]">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl ?? undefined}
          controls
          autoPlay
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="size-full object-cover"
        />
        {renderToastOverlay()}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0f0f0f]">
      <Image
        src={video.thumbnailUrl ?? "/images/avatar-user.png"}
        alt={video.title}
        fill
        sizes="(min-width: 1280px) 60vw, 100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-start p-3">
        <div className="flex flex-col gap-2">
          <div className="flex h-1 w-full bg-white/30">
            <div className="h-full w-[320px] bg-[#ff0000]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="text-white hover:opacity-80"
              >
                {isPlaying ? (
                  <CirclePause className="size-[18px]" />
                ) : (
                  <CirclePlay className="size-[18px]" />
                )}
              </button>
              <ArrowRight className="size-[18px] text-white" />
              <Volume2 className="size-[18px] text-white" />
              <span className="text-[13px] text-white">
                0:05 / {formatDuration(video.durationSeconds ?? 0)}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Captions className="size-[18px] text-white" />
              <Settings className="size-[18px] text-white" />
              <PictureInPicture className="size-[18px] text-white" />
              <TvMinimalPlay className="size-[18px] text-white" />
              <Fullscreen className="size-[18px] text-white" />
            </div>
          </div>
        </div>
      </div>
      {renderToastOverlay()}
    </div>
  );
}
