import Image from "next/image";
import type { Video } from "@/lib/data";

export function VideoCard({ video }: { video: Video }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(min-width: 1280px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex items-start gap-3">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
          <Image
            src={video.channelAvatar}
            alt={video.channel}
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 text-base font-semibold text-[#0f0f0f]">
            {video.title}
          </h3>
          <div className="flex flex-col gap-0.5 text-sm text-[#606060]">
            <p>{video.channel}</p>
            <p>
              {video.views} • {video.age}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
