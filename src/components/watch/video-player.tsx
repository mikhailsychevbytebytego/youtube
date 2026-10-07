import Image from "next/image";
import {
  ArrowRight,
  Captions,
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
  if (!url.hostname.endsWith("cloudflarestream.com")) return null;

  const uid = video.streamUid ?? url.pathname.split("/").filter(Boolean)[0];
  if (!uid) return null;

  const embed = new URL(`/${uid}/iframe`, url.origin);
  // The Stream poster parameter must be an absolute URL.
  if (video.thumbnailUrl?.startsWith("https://")) {
    embed.searchParams.set("poster", video.thumbnailUrl);
  }
  return embed.toString();
}

export function VideoPlayer({ video }: { video: Video }) {
  const streamEmbedUrl = getStreamEmbedUrl(video);
  if (streamEmbedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-none bg-[#0f0f0f] md:rounded-xl">
        <iframe
          src={streamEmbedUrl}
          title={video.title}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
    );
  }

  if (video.videoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-none bg-[#0f0f0f] md:rounded-xl">
        <video
          src={video.videoUrl}
          poster={video.thumbnailUrl ?? undefined}
          controls
          playsInline
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-none bg-[#0f0f0f] md:rounded-xl">
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
              <CirclePlay className="size-[18px] text-white" />
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
    </div>
  );
}
