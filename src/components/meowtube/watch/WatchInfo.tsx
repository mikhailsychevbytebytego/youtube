import Image from "next/image";
import Link from "next/link";
import {
  Download,
  MoreHorizontal,
  SquareArrowOutUpRight,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { channelHref } from "@/lib/channel-data";
import type { WatchVideo } from "@/lib/watch-data";
import { SubscribeButton } from "@/components/meowtube/SubscribeButton";

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
      className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium text-[#0f0f0f] transition-colors hover:bg-[#e8e8e8]"
    >
      {children}
    </button>
  );
}

export function WatchInfo({ video }: { video: WatchVideo }) {
  return (
    <div className="flex w-full flex-col gap-3 pt-4">
      <h1 className="text-xl font-bold text-[#0f0f0f]">{video.title}</h1>

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
              <span className="text-base font-semibold text-black group-hover:text-[#0f0f0f]">
                {video.channel}
              </span>
              <span className="text-xs text-[#606060]">{video.subscribers}</span>
            </div>
          </Link>
          <SubscribeButton channelName={video.channel} className="ml-2 px-4 py-2" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-[#f2f2f2]">
            <button
              type="button"
              aria-label="Like"
              className="flex items-center gap-2 border-r border-[#e5e5e5] px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e8e8e8] rounded-l-full"
            >
              <ThumbsUp className="size-5" />
              {video.likes}
            </button>
            <button
              type="button"
              aria-label="Dislike"
              className="px-3 py-2 text-black transition-colors hover:bg-[#e8e8e8] rounded-r-full"
            >
              <ThumbsDown className="size-5" />
            </button>
          </div>
          <PillButton label="Share">
            <SquareArrowOutUpRight className="size-5" />
            Share
          </PillButton>
          <PillButton label="Download">
            <Download className="size-5" />
            Download
          </PillButton>
          <PillButton label="More">
            <MoreHorizontal className="size-5" />
          </PillButton>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl bg-[#f2f2f2] p-3 text-sm text-black">
        <p className="font-semibold">
          {video.views} · {video.publishedAt}
        </p>
        <p className="leading-[1.4]">{video.description}</p>
      </div>
    </div>
  );
}
