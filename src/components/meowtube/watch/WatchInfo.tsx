import { Image } from "@/components/Image";
import Link from "next/link";
import {
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { channelHref } from "@/lib/channel-data";
import type { WatchVideo } from "@/lib/watch-data";
import { SubscribeButton } from "@/components/meowtube/SubscribeButton";

import { SubscriberCount } from "@/components/meowtube/SubscriberCount";

function PillButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover"
    >
      {children}
    </button>
  );
}

export function WatchInfo({ video }: { video: WatchVideo }) {
  return (
    <div className="flex w-full flex-col gap-3 pt-4">
      <h1 className="text-xl font-bold text-foreground">{video.title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={channelHref(video.channel)} className="flex items-center gap-3 group">
            <Image
              src={video.channelAvatar}
              alt={video.channel}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground group-hover:text-foreground">
                {video.channel}
              </span>
              <SubscriberCount channelName={video.channel} initialCount={video.rawSubscriberCount} />
            </div>
          </Link>
          <SubscribeButton channelName={video.channel} className="ml-2 px-4 py-2" />
          <div className="ml-4 flex h-9 items-center rounded-full bg-muted">
            <button
              type="button"
              aria-label="Like"
              className="flex items-center gap-2 border-r border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-hover rounded-l-full"
            >
              <ThumbsUp className="size-5" />
              {video.likes}
            </button>
            <button
              type="button"
              aria-label="Dislike"
              className="px-3 py-2 text-foreground transition-colors hover:bg-hover rounded-r-full"
            >
              <ThumbsDown className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PillButton label="More">
            <MoreHorizontal className="size-5" />
          </PillButton>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl bg-muted p-3 text-sm text-foreground">
        <p className="font-semibold">
          {video.views} · {video.publishedAt}
        </p>
        <p className="leading-[1.4] whitespace-pre-wrap">{video.description}</p>
      </div>
    </div>
  );
}
