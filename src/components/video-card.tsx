import Image from "next/image";
import { CircleCheck, EllipsisVertical } from "lucide-react";

import { channels, type Video } from "@/lib/data";

const thumbnailSizes =
  "(min-width: 1536px) 16vw, (min-width: 1280px) 22vw, (min-width: 768px) 31vw, 100vw";

export function VideoCard({
  video,
  eager,
}: {
  video: Video;
  eager?: boolean;
}) {
  const channel = channels[video.channelId];

  return (
    <article className="group">
      <a href="#" className="relative block overflow-hidden rounded-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={480}
          height={270}
          sizes={thumbnailSizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {video.isLive ? (
          <span className="absolute bottom-2 left-2 rounded bg-brand px-1.5 py-0.5 text-[12px] font-medium leading-none text-white">
            LIVE
          </span>
        ) : (
          <span className="absolute bottom-2 right-2 rounded bg-scrim px-1.5 py-0.5 text-[12px] font-medium leading-none text-white">
            {video.duration}
          </span>
        )}
      </a>

      <div className="mt-3 flex items-start gap-3">
        <Image
          src={channel.avatar}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-5 text-ink">
            <a href="#">{video.title}</a>
          </h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
            {channel.name}
            {channel.verified && (
              <>
                <CircleCheck
                  aria-hidden
                  className="size-3.5 shrink-0 fill-muted text-background"
                />
                <span className="sr-only">Verified</span>
              </>
            )}
          </p>
          <p className="truncate text-xs text-muted">{video.meta}</p>
        </div>
        <button
          type="button"
          aria-label={`More options for ${video.title}`}
          className="shrink-0 cursor-pointer text-ink-soft opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
        >
          <EllipsisVertical className="size-5" />
        </button>
      </div>
    </article>
  );
}
