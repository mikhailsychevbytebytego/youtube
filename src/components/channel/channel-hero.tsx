import Image from "next/image";
import { ChevronRight, PawPrint, Search } from "lucide-react";
import type { Channel } from "@/db/schema";
import { formatCount } from "@/lib/format";

const channelTabs = [
  "Home",
  "Videos",
  "Shorts",
  "Live",
  "Playlists",
  "Community",
];

export function ChannelHero({ channel }: { channel: Channel }) {
  return (
    <>
      <div className="h-28 w-full px-3 pt-3 md:h-[200px] md:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <Image
            src={channel.bannerUrl ?? "/images/channel-banner.png"}
            alt={`${channel.name} banner`}
            fill
            sizes="(min-width: 1280px) 80vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-5 px-3 pb-4 md:px-6 md:pb-6">
        <div className="flex w-full items-start gap-4 md:items-center md:gap-6">
          <div className="relative size-20 shrink-0 md:size-40">
            <div className="relative size-full overflow-hidden rounded-full">
              <Image
                src={channel.avatarUrl ?? "/images/avatar-user.png"}
                alt={channel.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <span className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#ff0000] md:right-2 md:bottom-2 md:size-9 md:border-[3px]">
              <PawPrint className="size-3 text-white md:size-5" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-foreground md:text-4xl">
                {channel.name}
              </h1>
              <p className="text-sm text-muted">
                {channel.handle} · {formatCount(channel.subscriberCount)}{" "}
                subscribers
              </p>
            </div>
            <button className="flex items-center gap-1 self-start">
              <span className="text-sm text-muted">
                {channel.description}
              </span>
              <ChevronRight className="size-4 text-muted" />
            </button>
            <button className="flex min-h-11 items-center gap-3 self-start rounded-3xl bg-[#ff0000] px-6 py-3">
              <PawPrint className="size-5 text-white" />
              <span className="text-xs font-bold text-white">Purrscribe</span>
            </button>
          </div>
        </div>

        <div className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-6 overflow-x-auto px-3 md:mx-0 md:w-full md:gap-8 md:px-0">
          {channelTabs.map((tab, i) => (
            <button
              key={tab}
              className={`min-h-11 shrink-0 pb-3 text-base ${
                i === 0
                  ? "border-b-[3px] border-foreground font-bold text-foreground"
                  : "font-medium text-muted"
              }`}
            >
              {tab}
            </button>
          ))}
          <button aria-label="Search channel">
            <Search className="size-5 text-muted" />
          </button>
        </div>
      </div>
    </>
  );
}
