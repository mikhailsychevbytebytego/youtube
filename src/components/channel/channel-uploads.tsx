import Image from "next/image";
import { ChevronRight, Play } from "lucide-react";
import { featuredVideo, uploads } from "@/lib/channel-data";

export function FeaturedVideo() {
  return (
    <div className="flex w-full items-start gap-6">
      <div className="relative h-[238px] w-[424px] shrink-0 overflow-hidden rounded-xl">
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
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="text-xl font-bold text-[#0f0f0f]">
          {featuredVideo.title}
        </h2>
        <p className="text-sm text-[#606060]">{featuredVideo.meta}</p>
        <div className="text-sm leading-normal text-[#606060]">
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
        <h2 className="text-xl font-bold text-black">Uploads</h2>
        <button className="flex items-center gap-2">
          <Play className="size-5 fill-black text-black" />
          <span className="text-xs font-semibold text-black">Play all</span>
        </button>
      </div>
      <div className="relative flex w-full items-start gap-4">
        {uploads.map((video) => (
          <div key={video.id} className="flex min-w-0 flex-1 flex-col gap-3">
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
              <h3 className="line-clamp-2 text-base leading-[1.4] font-semibold text-[#0f0f0f]">
                {video.title}
              </h3>
              <div className="flex flex-col text-sm text-[#606060]">
                <p>The Daily Purr</p>
                <p>{video.meta}</p>
              </div>
            </div>
          </div>
        ))}
        <button
          aria-label="Scroll uploads"
          className="absolute top-[calc(50%-40px)] -right-5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white drop-shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
        >
          <ChevronRight className="size-5 text-black" />
        </button>
      </div>
    </div>
  );
}
