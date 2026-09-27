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
      <h1 className="text-xl font-bold text-[#0f0f0f]">{watchVideo.title}</h1>

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
              <span className="text-base font-semibold text-black">
                {watchVideo.channel}
              </span>
              <CircleCheck className="size-3 text-[#606060]" />
            </Link>
            <span className="text-xs text-[#606060]">
              {watchVideo.subscribers}
            </span>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-4 py-2">
            <PawPrint className="size-[18px] text-black" />
            <span className="text-sm font-semibold text-black">
              Purrscribed
            </span>
            <ChevronDown className="size-4 text-black" />
          </button>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex overflow-hidden rounded-full bg-[#f2f2f2]">
            <button className="flex items-center gap-2 border-r border-[#e5e5e5] px-3 py-2">
              <ThumbsUp className="size-5 text-black" />
              <span className="text-sm font-semibold text-black">
                {watchVideo.likes}
              </span>
            </button>
            <button aria-label="Dislike" className="flex items-center px-3 py-2">
              <ThumbsDown className="size-5 text-black" />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-4 py-2">
            <Share className="size-5 text-[#0f0f0f]" />
            <span className="text-sm font-medium text-[#0f0f0f]">Share</span>
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 rounded-xl bg-[#f2f2f2] p-3 text-sm text-black">
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
          <p className="text-xl font-bold text-black">
            Comments <span className="font-normal text-[#606060]">2.6K</span>
          </p>
          <button className="flex items-center gap-2">
            <ArrowUpNarrowWide className="size-6 text-black" />
            <span className="text-xs font-semibold text-black">Sort by</span>
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
          <div className="flex-1 border-b border-[#e5e5e5] pb-2">
            <span className="text-sm text-[#606060]">Add a comment...</span>
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
              <span className="text-[13px] font-semibold text-black">
                {watchComment.author}
              </span>
              <span className="text-xs text-[#606060]">{watchComment.age}</span>
            </div>
            <p className="text-sm text-black">{watchComment.text}</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-4 text-black" />
                <span className="text-xs text-[#606060]">
                  {watchComment.likes}
                </span>
              </span>
              <ThumbsDown className="size-4 text-black" />
              <span className="text-xs font-semibold text-black">Reply</span>
            </div>
          </div>
          <button
            aria-label="More options"
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
          >
            <EllipsisVertical className="size-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
