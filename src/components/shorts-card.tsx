import Image from "next/image";
import type { Short } from "@/lib/data";

export function ShortsCard({ short }: { short: Short }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl">
        <Image
          src={short.thumbnail}
          alt={short.title}
          fill
          sizes="(min-width: 1280px) 16vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="truncate text-sm font-medium text-[#0f0f0f]">
          {short.title}
        </h3>
        <p className="text-xs text-[#606060]">{short.views}</p>
      </div>
    </div>
  );
}
