import { Image } from "@/components/Image";
import Link from "next/link";
import type { ChannelVideo } from "@/lib/channel-data";

export function ChannelVideoCard({
  video,
  channelName,
}: {
  video: ChannelVideo;
  channelName: string;
}) {
  return (
    <Link href={`/watch/${video.id}`} className="group flex w-full flex-col gap-3">
      <div className="relative aspect-[7/4] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-200 scale-[1.02] group-hover:scale-[1.05]"
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        <p className="line-clamp-2 text-base font-semibold leading-[22px] text-foreground">
          {video.title}
        </p>
        <p className="text-sm text-muted-foreground">{channelName}</p>
        <p className="text-sm text-muted-foreground">
          {video.views} • {video.publishedAt}
        </p>
      </div>
    </Link>
  );
}
