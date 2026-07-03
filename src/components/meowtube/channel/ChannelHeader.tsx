import Image from "next/image";
import type { Channel } from "@/lib/channel-data";
import { SubscribeButton } from "@/components/meowtube/SubscribeButton";

export function ChannelHeader({ channel }: { channel: Channel }) {
  return (
    <div className="flex w-full flex-col items-center pt-6">
      <div className="relative h-[160px] w-full overflow-hidden rounded-xl bg-[#f2f2f2] sm:h-[214px]">
        <Image
          src={channel.banner}
          alt={`${channel.name} banner`}
          fill
          priority
          sizes="(max-width: 1284px) 100vw, 1284px"
          className="object-cover"
        />
      </div>

      <div className="flex w-full flex-col items-center gap-6 pb-1 pt-4 sm:flex-row sm:items-center">
        <div className="relative size-[120px] shrink-0 overflow-hidden rounded-full bg-black/5 sm:size-40">
          <Image
            src={channel.avatar}
            alt={channel.name}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl font-bold text-[#0f0f0f] sm:text-4xl">{channel.name}</h1>
            <p className="text-sm text-[#606060]">
              {channel.handle} • {channel.subscribers} • {channel.videoCount}
            </p>
          </div>
          <p className="max-w-2xl truncate text-sm text-[#606060]">{channel.description}</p>
          <SubscribeButton channelName={channel.name} className="px-5 py-2.5" />
        </div>
      </div>
    </div>
  );
}
