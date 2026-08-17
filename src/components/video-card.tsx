import Image from "next/image";
import { EllipsisVertical } from "lucide-react";

import { channels, type Video } from "@/lib/data";

const thumbnailSizes =
  "(min-width: 1536px) 16vw, (min-width: 1280px) 22vw, (min-width: 768px) 31vw, 100vw";

export function VideoCard({ video }: { video: Video }) {
  const channel = channels[video.channelId];

  return (
    <article className="group">
      <a href="#" className="relative block overflow-hidden rounded-[11px]">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={630}
          height={678}
          sizes={thumbnailSizes}
          className="aspect-[210/226] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {video.isLive ? (
          <span className="absolute left-2.5 top-2.5 rounded bg-brand px-1.5 py-[3px] text-[13px] font-bold leading-none text-white">
            LIVE
          </span>
        ) : (
          <span className="absolute bottom-[7px] right-[7px] rounded bg-scrim px-1.5 py-1 text-[13px] font-bold leading-none text-white">
            {video.duration}
          </span>
        )}
      </a>

      <div className="mt-3.5 flex items-start gap-2.5">
        <Image
          src={channel.avatar}
          alt=""
          width={76}
          height={76}
          className="size-[38px] shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[38px] text-[15px] font-bold leading-[1.25] text-ink">
            <a href="#">{video.title}</a>
          </h3>
          <p className="mt-3.5 truncate text-[13px] text-muted">
            {channel.name}
            {channel.verified && (
              <>
                {" "}
                <span aria-hidden>✓</span>
                <span className="sr-only">Verified</span>
              </>
            )}
          </p>
          <p className="mt-1 truncate text-[13px] text-muted">{video.meta}</p>
        </div>
        <button
          type="button"
          aria-label={`More options for ${video.title}`}
          className="shrink-0 cursor-pointer text-ink-soft transition-colors hover:text-ink"
        >
          <EllipsisVertical className="size-[17px]" />
        </button>
      </div>
    </article>
  );
}
