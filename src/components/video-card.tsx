import Image from "next/image";
import Link from "next/link";
import type { VideoWithChannel } from "@/lib/queries";
import { formatViews, timeAgo } from "@/lib/format";

export function VideoCard({ video }: { video: VideoWithChannel }) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/watch?v=${video.id}`}
        className="relative aspect-video w-full overflow-hidden rounded-xl"
      >
        <Image
          src={video.thumbnailUrl ?? "/images/avatar-user.png"}
          alt={video.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>
      <div className="flex items-start gap-3">
        <Link
          href={`/channel?id=${video.channel.id}`}
          className="relative size-9 shrink-0 overflow-hidden rounded-full hover:opacity-80 transition-opacity"
        >
          <Image
            src={video.channel.avatarUrl ?? "/images/avatar-user.png"}
            alt={video.channel.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={`/watch?v=${video.id}`}>
            <h3 className="line-clamp-2 text-base font-semibold text-foreground hover:text-foreground/80">
              {video.title}
            </h3>
          </Link>
          <div className="flex flex-col gap-0.5 text-sm text-muted">
            <Link
              href={`/channel?id=${video.channel.id}`}
              className="hover:text-foreground transition-colors truncate"
            >
              {video.channel.name}
            </Link>
            <p>
              {formatViews(video.viewCount)} • {timeAgo(video.publishedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
