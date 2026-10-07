import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import type { Video } from "@/db/schema";
import {
  formatDuration,
  formatViews,
  formatWatching,
  timeAgo,
} from "@/lib/format";

export function FeaturedVideo({ video }: { video: Video }) {
  return (
    <div className="flex w-full flex-col items-start gap-4 md:flex-row md:gap-6">
      <Link
        href={`/watch?v=${video.id}`}
        className="relative aspect-video w-full overflow-hidden rounded-xl md:h-[238px] md:w-[424px] md:shrink-0 md:aspect-auto"
      >
        <Image
          src={video.thumbnailUrl ?? "/images/avatar-user.png"}
          alt={video.title}
          fill
          sizes="(min-width: 768px) 424px, 100vw"
          className="object-cover"
        />
        <span className="absolute right-2 bottom-2 rounded-sm bg-black/80 px-1 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.durationSeconds ?? 0)}
        </span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link href={`/watch?v=${video.id}`}>
          <h2 className="text-xl font-bold text-foreground">{video.title}</h2>
        </Link>
        <p className="text-sm text-muted">
          {formatViews(video.viewCount)} · {timeAgo(video.publishedAt)}
        </p>
        <div className="text-sm leading-normal text-muted">
          <p>{video.description}</p>
          <p>...more</p>
        </div>
      </div>
    </div>
  );
}

export function ChannelUploads({
  uploads,
  channelName,
}: {
  uploads: Video[];
  channelName: string;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">Uploads</h2>
        <button className="flex items-center gap-2">
          <Play className="size-5 fill-foreground text-foreground" />
          <span className="text-xs font-semibold text-foreground">Play all</span>
        </button>
      </div>
      <div className="relative flex w-full items-start gap-4 overflow-x-auto">
        {uploads.map((video) => (
          <Link
            key={video.id}
            href={`/watch?v=${video.id}`}
            className="flex w-40 min-w-40 flex-col gap-3 md:min-w-0 md:w-auto md:flex-1"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={video.thumbnailUrl ?? "/images/avatar-user.png"}
                alt={video.title}
                fill
                sizes="(min-width: 1280px) 16vw, 33vw"
                className="object-cover"
              />
              <span className="absolute right-2 bottom-2 rounded-sm bg-black/80 px-1 py-0.5 text-xs font-semibold text-white">
                {video.type === "live"
                  ? "LIVE"
                  : formatDuration(video.durationSeconds ?? 0)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="line-clamp-2 text-base leading-[1.4] font-semibold text-foreground">
                {video.title}
              </h3>
              <div className="flex flex-col text-sm text-muted">
                <p>{channelName}</p>
                <p>
                  {video.type === "live"
                    ? `${formatWatching(video.viewCount)} · LIVE`
                    : `${formatViews(video.viewCount)} · ${timeAgo(video.publishedAt)}`}
                </p>
              </div>
            </div>
          </Link>
        ))}
        <button
          aria-label="Scroll uploads"
          className="absolute top-[calc(50%-40px)] -right-5 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background drop-shadow-[0px_4px_4px_rgba(0,0,0,0.1)] md:flex"
        >
          <ChevronRight className="size-5 text-foreground" />
        </button>
      </div>
    </div>
  );
}
