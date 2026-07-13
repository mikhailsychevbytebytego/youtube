import Image from "next/image";
import {
  EllipsisVertical,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { VideoWithChannel } from "@/lib/queries";
import { formatCount, formatViews } from "@/lib/format";

function ActionButton({
  label,
  count,
  children,
}: {
  label: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        aria-label={label}
        className="flex size-10 items-center justify-center rounded-full bg-surface hover:bg-surface-hover"
      >
        {children}
      </button>
      {count ? (
        <span className="text-xs font-medium text-foreground">{count}</span>
      ) : null}
    </div>
  );
}

export function ShortItem({ short }: { short: VideoWithChannel }) {
  return (
    <section className="flex h-full w-full snap-start snap-always items-center justify-center gap-4 py-3">
      <div className="relative flex aspect-[9/16] h-full items-end overflow-hidden rounded-xl bg-[#0f0f0f]">
        <Image
          src={short.thumbnailUrl ?? "/images/avatar-user.png"}
          alt={short.title}
          fill
          sizes="405px"
          className="object-cover"
          priority={false}
        />
        {/* Scrim keeps the caption readable whatever the artwork behind it is. */}
        <div className="relative flex w-full flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <div className="flex items-center gap-2">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
              <Image
                src={short.channel.avatarUrl ?? "/images/avatar-user.png"}
                alt={short.channel.name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-white">
              {short.channel.name}
            </span>
            <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
              Purrscribe
            </button>
          </div>
          <h2 className="text-sm font-medium text-white">{short.title}</h2>
          <p className="text-xs text-white/70">{formatViews(short.viewCount)}</p>
        </div>
      </div>

      <div className="flex h-full flex-col justify-end gap-4 pb-2">
        <ActionButton label="Like" count={formatCount(short.likeCount)}>
          <ThumbsUp className="size-5 text-foreground" />
        </ActionButton>
        <ActionButton label="Dislike">
          <ThumbsDown className="size-5 text-foreground" />
        </ActionButton>
        <ActionButton label="Comments">
          <MessageCircle className="size-5 text-foreground" />
        </ActionButton>
        <ActionButton label="Share">
          <Share2 className="size-5 text-foreground" />
        </ActionButton>
        <ActionButton label="More options">
          <EllipsisVertical className="size-5 text-foreground" />
        </ActionButton>
      </div>
    </section>
  );
}
