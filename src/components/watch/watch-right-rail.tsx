import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CircleX, PawPrint } from "lucide-react";
import {
  catShorts,
  kittenShorts,
  upNextVideos,
  type MiniShort,
} from "@/lib/watch-data";

function UpNextList() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Up next</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">Autoplay</span>
          <span className="relative flex h-5 w-9 items-center rounded-full bg-[#ff0000]">
            <span className="absolute right-0.5 size-4 rounded-full bg-white" />
          </span>
        </div>
      </div>
      {upNextVideos.map((video) => (
        <Link
          key={video.id}
          href="/watch"
          className="flex w-full items-start gap-2"
        >
          <div className="relative h-[94px] w-[168px] shrink-0 overflow-hidden rounded-lg">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              sizes="168px"
              className="object-cover"
            />
            {video.isLive ? (
              <span className="absolute right-1 bottom-1 rounded-xs bg-[#ff0000] px-1 py-0.5 text-xs font-bold text-white">
                LIVE
              </span>
            ) : (
              <span className="absolute right-1 bottom-1 rounded-sm bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
                {video.duration}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">
              {video.title}
            </h3>
            <div className="flex flex-col gap-0.5 text-xs text-muted">
              <p>{video.channel}</p>
              <p>{video.meta}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ShortsShelf({
  title,
  icon,
  shorts,
  height,
  showScrollButton,
}: {
  title: string;
  icon: React.ReactNode;
  shorts: MiniShort[];
  height: number;
  showScrollButton?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-foreground">{title}</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-[#ff0000]">
          View all
        </a>
      </div>
      <div className="relative flex w-full gap-3">
        {shorts.map((short) => (
          <Link
            key={short.id}
            href="/watch"
            className="relative w-[120px] shrink-0 overflow-hidden rounded-lg"
            style={{ height }}
          >
            <Image
              src={short.thumbnail}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
            />
            {short.duration && (
              <span className="absolute right-1 bottom-1 rounded-sm bg-black/80 px-1 py-0.5 text-[10px] text-white">
                {short.duration}
              </span>
            )}
          </Link>
        ))}
        {showScrollButton && (
          <button
            aria-label="Scroll right"
            className="absolute top-1/2 -right-4 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)]"
          >
            <ChevronRight className="size-4 text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

export function WatchRightRail() {
  return (
    <aside className="flex w-[402px] shrink-0 flex-col gap-6 pt-6 pr-6">
      <UpNextList />
      <ShortsShelf
        title="Kittens"
        icon={<PawPrint className="size-4 text-foreground" />}
        shorts={kittenShorts}
        height={160}
        showScrollButton
      />
      <ShortsShelf
        title="Cat Shorts"
        icon={<CircleX className="size-4 text-[#ff0000]" />}
        shorts={catShorts}
        height={200}
      />
    </aside>
  );
}
