import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { featuredVideo, uploads } from "@/lib/channel-data";

export function FeaturedVideo() {
  return (
    <div className="flex w-full items-start gap-6">
      <Link
        href="/watch"
        className="relative h-[238px] w-[424px] shrink-0 overflow-hidden rounded-xl"
      >
        <Image
          src={featuredVideo.thumbnail}
          alt={featuredVideo.title}
          fill
          sizes="424px"
          className="object-cover"
        />
        <span className="absolute right-2 bottom-2 rounded-sm bg-black/80 px-1 py-0.5 text-xs font-semibold text-white">
          {featuredVideo.duration}
        </span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link href="/watch">
          <h2 className="text-xl font-bold text-foreground">
            {featuredVideo.title}
          </h2>
        </Link>
        <p className="text-sm text-muted">{featuredVideo.meta}</p>
        <div className="text-sm leading-normal text-muted">
          <p>{featuredVideo.description}</p>
          <p>...more</p>
        </div>
      </div>
    </div>
  );
}

export function ChannelUploads() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">Uploads</h2>
        <button className="flex items-center gap-2">
          <Play className="size-5 fill-black text-foreground" />
          <span className="text-xs font-semibold text-foreground">Play all</span>
        </button>
      </div>
      <div className="relative flex w-full items-start gap-4">
        {uploads.map((video) => (
          <Link
            key={video.id}
            href="/watch"
            className="flex min-w-0 flex-1 flex-col gap-3"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(min-width: 1280px) 16vw, 33vw"
                className="object-cover"
              />
              <span className="absolute right-2 bottom-2 rounded-sm bg-black/80 px-1 py-0.5 text-xs font-semibold text-white">
                {video.isLive ? "LIVE" : video.duration}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="line-clamp-2 text-base leading-[1.4] font-semibold text-foreground">
                {video.title}
              </h3>
              <div className="flex flex-col text-sm text-muted">
                <p>The Daily Purr</p>
                <p>{video.meta}</p>
              </div>
            </div>
          </Link>
        ))}
        <button
          aria-label="Scroll uploads"
          className="absolute top-[calc(50%-40px)] -right-5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background drop-shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
        >
          <ChevronRight className="size-5 text-foreground" />
        </button>
      </div>
    </div>
  );
}
