import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpNarrowWide,
  CircleCheck,
  EllipsisVertical,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { VideoWithChannel } from "@/lib/queries";
import { formatCount, formatViews, timeAgo } from "@/lib/format";
import { SubscribeButton } from "@/components/subscribe-button";

const watchComment = {
  author: "PurrfectLife",
  age: "3 days ago",
  avatar: "/images/avatar-purrfectlife.png",
  text: "Box: 1, Kitten: 0 😹",
  likes: "2.1K",
};

export function VideoDetails({
  video,
  initialSubscribed,
}: {
  video: VideoWithChannel;
  initialSubscribed?: boolean;
}) {
  const lines = (video.description ?? "").split("\n");
  const hashtags = lines
    .filter((line) => line.trim().startsWith("#"))
    .join(" ");
  const description = lines
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="text-xl font-bold text-foreground">{video.title}</h1>

      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Link
            href={`/channel?id=${video.channel.id}`}
            className="relative size-10 shrink-0 overflow-hidden rounded-full"
          >
            <Image
              src={video.channel.avatarUrl ?? "/images/avatar-user.png"}
              alt={video.channel.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </Link>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Link
                href={`/channel?id=${video.channel.id}`}
                className="text-base font-semibold text-foreground"
              >
                {video.channel.name}
              </Link>
              <CircleCheck className="size-3 text-muted" />
            </div>
            <span className="text-xs text-muted">
              {formatCount(video.channel.subscriberCount, 2)} purrscribers
            </span>
          </div>
          <SubscribeButton
            channelId={video.channel.id}
            initialSubscribed={initialSubscribed}
            subscriberCount={video.channel.subscriberCount}
            size="md"
          />
        </div>

        <div className="-mx-3 flex items-start gap-2 overflow-x-auto px-3 md:mx-0 md:px-0">
          <div className="flex overflow-hidden rounded-full bg-surface">
            <button className="flex min-h-11 items-center gap-2 border-r border-border px-3 py-2">
              <ThumbsUp className="size-5 text-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {formatCount(video.likeCount)}
              </span>
            </button>
            <button
              aria-label="Dislike"
              className="flex min-h-11 items-center px-3 py-2"
            >
              <ThumbsDown className="size-5 text-foreground" />
            </button>
          </div>
          <button className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-surface px-4 py-2">
            <Share className="size-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Share</span>
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 rounded-xl bg-surface p-3 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatViews(video.viewCount)}</span>
          <span className="font-semibold">{timeAgo(video.publishedAt)}</span>
          {hashtags && <span>{hashtags}</span>}
        </div>
        <p className="leading-[1.4]">{description}</p>
        <button className="self-start font-semibold">...more</button>
      </div>

      <div className="flex w-full flex-col gap-6 pt-3">
        <div className="flex items-center gap-8">
          <p className="text-xl font-bold text-foreground">
            Comments <span className="font-normal text-muted">2.6K</span>
          </p>
          <button className="flex items-center gap-2">
            <ArrowUpNarrowWide className="size-6 text-foreground" />
            <span className="text-xs font-semibold text-foreground">Sort by</span>
          </button>
        </div>

        <div className="flex w-full items-center gap-4">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/images/avatar-user.png"
              alt="Your profile"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 border-b border-border pb-2">
            <span className="text-sm text-muted">Add a comment...</span>
          </div>
        </div>

        <div className="flex w-full items-start gap-4">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src={watchComment.avatar}
              alt={watchComment.author}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-foreground">
                {watchComment.author}
              </span>
              <span className="text-xs text-muted">{watchComment.age}</span>
            </div>
            <p className="text-sm text-foreground">{watchComment.text}</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-4 text-foreground" />
                <span className="text-xs text-muted">
                  {watchComment.likes}
                </span>
              </span>
              <ThumbsDown className="size-4 text-foreground" />
              <span className="text-xs font-semibold text-foreground">Reply</span>
            </div>
          </div>
          <button
            aria-label="More options"
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
          >
            <EllipsisVertical className="size-4 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
