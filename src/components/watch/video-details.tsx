import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpNarrowWide,
  ChevronDown,
  CircleCheck,
  EllipsisVertical,
  PawPrint,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { watchComment, watchVideo } from "@/lib/watch-data";

export function VideoDetails() {
  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="text-xl font-bold text-foreground">{watchVideo.title}</h1>

      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/channel"
            className="relative size-10 shrink-0 overflow-hidden rounded-full"
          >
            <Image
              src={watchVideo.channelAvatar}
              alt={watchVideo.channel}
              fill
              sizes="40px"
              className="object-cover"
            />
          </Link>
          <div className="flex flex-col gap-0.5">
            <Link href="/channel" className="flex items-center gap-1">
              <span className="text-base font-semibold text-foreground">
                {watchVideo.channel}
              </span>
              <CircleCheck className="size-3 text-muted" />
            </Link>
            <span className="text-xs text-muted">
              {watchVideo.subscribers}
            </span>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-surface px-4 py-2">
            <PawPrint className="size-[18px] text-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Purrscribed
            </span>
            <ChevronDown className="size-4 text-foreground" />
          </button>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex overflow-hidden rounded-full bg-surface">
            <button className="flex items-center gap-2 border-r border-border px-3 py-2">
              <ThumbsUp className="size-5 text-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {watchVideo.likes}
              </span>
            </button>
            <button aria-label="Dislike" className="flex items-center px-3 py-2">
              <ThumbsDown className="size-5 text-foreground" />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-surface px-4 py-2">
            <Share className="size-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Share</span>
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 rounded-xl bg-surface p-3 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{watchVideo.views}</span>
          <span className="font-semibold">{watchVideo.age}</span>
          <span>{watchVideo.hashtags}</span>
        </div>
        <p className="leading-[1.4]">{watchVideo.description}</p>
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
