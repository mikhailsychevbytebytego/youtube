import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/meowtube-data";

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video.id}`} className="group flex w-full flex-col gap-2">
      <div className="relative aspect-[7/4] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-200 scale-[1.02] group-hover:scale-[1.05]"
        />
        {video.similarity !== undefined && video.similarity > 0 && (
          <div className="absolute left-2 top-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-green-400">
            {(video.similarity * 100).toFixed(0)}% match
          </div>
        )}
      </div>
      <div className="flex w-full gap-2">
        <Image
          src={video.channelAvatar}
          alt={video.channel}
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="line-clamp-2 text-sm font-semibold leading-[1.4] text-foreground">
            {video.title}
          </p>
          <div className="flex flex-col text-[13px] text-muted-foreground">
            <span>{video.channel}</span>
            <span>
              {video.views} • {video.publishedAt}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
