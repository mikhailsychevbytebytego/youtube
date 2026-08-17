import Image from "next/image";
import { EllipsisVertical, Play } from "lucide-react";

import { shorts, type Short } from "@/lib/data";

const coverSizes =
  "(min-width: 1536px) 12vw, (min-width: 1280px) 16vw, (min-width: 768px) 24vw, 50vw";

function ShortCard({ short }: { short: Short }) {
  return (
    <article className="group relative aspect-[156/291] overflow-hidden rounded-[11px]">
      <a href="#" className="absolute inset-0">
        <Image
          src={short.cover}
          alt={short.title}
          fill
          sizes={coverSizes}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-b from-transparent to-black/80" />
      </a>

      <button
        type="button"
        aria-label={`More options for ${short.title}`}
        className="absolute right-2 top-3 cursor-pointer text-white/90 hover:text-white"
      >
        <EllipsisVertical className="size-[18px]" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 px-[9px] pb-[7px]">
        <h3 className="line-clamp-2 text-[17px] font-extrabold leading-[1.15] text-white">
          {short.title}
        </h3>
        <p className="text-[14px] text-white">{short.views}</p>
      </div>
    </article>
  );
}

export function ShortsShelf() {
  return (
    <section aria-labelledby="cat-shorts">
      <div className="flex items-center gap-3">
        <span className="flex size-[30px] shrink-0 rotate-[10deg] items-center justify-center rounded-[9px] bg-brand">
          <Play className="size-[18px] text-white" strokeWidth={2.75} />
        </span>
        <h2 id="cat-shorts" className="text-[28px] font-extrabold text-ink">
          Cat Shorts 🐾
        </h2>
        <a
          href="#"
          className="ml-auto text-[15px] font-semibold text-link hover:underline"
        >
          View all
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {shorts.map((short) => (
          <ShortCard key={short.id} short={short} />
        ))}
      </div>
    </section>
  );
}
