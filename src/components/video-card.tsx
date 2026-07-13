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
          sizes="(min-width: 1280px) 25vw, 50vw"
          className="object-cover"
        />
      </Link>
      <div className="flex items-start gap-3">
        <Link
          href="/channel"
          className="relative size-9 shrink-0 overflow-hidden rounded-full"
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
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">
              {video.title}
            </h3>
          </Link>
          <div className="flex flex-col gap-0.5 text-sm text-muted">
            <Link href="/channel" className="hover:text-foreground">
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
