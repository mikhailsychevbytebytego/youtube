import Image from "next/image";
import { ChevronRight, PawPrint, Search } from "lucide-react";
import { channel, channelTabs } from "@/lib/channel-data";

export function ChannelHero() {
  return (
    <>
      <div className="h-[200px] w-full p-6">
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <Image
            src={channel.banner}
            alt={`${channel.name} banner`}
            fill
            sizes="(min-width: 1280px) 80vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-5 px-6 pb-6">
        <div className="flex w-full items-center gap-6">
          <div className="relative size-40 shrink-0">
            <div className="relative size-full overflow-hidden rounded-full">
              <Image
                src={channel.avatar}
                alt={channel.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <span className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full border-[3px] border-white bg-[#ff0000]">
              <PawPrint className="size-5 text-white" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-bold text-[#0f0f0f]">
                {channel.name}
              </h1>
              <p className="text-sm text-[#606060]">{channel.handle}</p>
            </div>
            <button className="flex items-center gap-1 self-start">
              <span className="text-sm text-[#606060]">
                {channel.description}
              </span>
              <ChevronRight className="size-4 text-[#606060]" />
            </button>
            <button className="flex items-center gap-3 self-start rounded-3xl bg-[#ff0000] px-6 py-3">
              <PawPrint className="size-5 text-white" />
              <span className="text-xs font-bold text-white">Purrscribe</span>
            </button>
          </div>
        </div>

        <div className="flex w-full items-center gap-8">
          {channelTabs.map((tab, i) => (
            <button
              key={tab}
              className={`pb-3 text-base ${
                i === 0
                  ? "border-b-[3px] border-[#0f0f0f] font-bold text-[#0f0f0f]"
                  : "font-medium text-[#606060]"
              }`}
            >
              {tab}
            </button>
          ))}
          <button aria-label="Search channel">
            <Search className="size-5 text-[#606060]" />
          </button>
        </div>
      </div>
    </>
  );
}
