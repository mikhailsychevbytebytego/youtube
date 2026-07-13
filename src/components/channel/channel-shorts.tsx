import Image from "next/image";
import { ChevronRight, Shirt } from "lucide-react";
import { channelShorts } from "@/lib/channel-data";

export function ChannelShorts() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <Shirt className="size-6 text-black" />
        <h2 className="text-xl font-bold text-black">Cat Shorts</h2>
      </div>
      <div className="relative flex w-full items-start gap-4">
        {channelShorts.map((short) => (
          <div key={short.id} className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl">
              <Image
                src={short.thumbnail}
                alt={short.title}
                fill
                sizes="(min-width: 1280px) 13vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="truncate text-sm font-semibold text-[#0f0f0f]">
                {short.title}
              </h3>
              <p className="text-[13px] text-[#606060]">{short.views}</p>
            </div>
          </div>
        ))}
        <button
          aria-label="Scroll shorts"
          className="absolute top-[calc(50%-20px)] -right-5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white drop-shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
        >
          <ChevronRight className="size-5 text-black" />
        </button>
      </div>
    </div>
  );
}
