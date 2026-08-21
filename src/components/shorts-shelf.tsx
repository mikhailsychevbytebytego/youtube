import Image from "next/image";
import { EllipsisVertical, Play } from "lucide-react";

import { shorts, type Short } from "@/lib/data";

const coverSizes =
  "(min-width: 1536px) 12vw, (min-width: 1280px) 16vw, (min-width: 768px) 24vw, 50vw";

function ShortCard({ short }: { short: Short }) {
  return (
    <article className="group relative aspect-[9/16] overflow-hidden rounded-xl">
      <a href="#" className="absolute inset-0">
        <Image
          src={short.cover}
          alt={short.title}
          fill
          sizes={coverSizes}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black/80" />
      </a>

      <button
        type="button"
        aria-label={`More options for ${short.title}`}
        className="absolute right-2 top-2 cursor-pointer text-white/90 hover:text-white"
      >
        <EllipsisVertical className="size-5" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 px-2.5 pb-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">
          {short.title}
        </h3>
        <p className="text-xs text-white/90">{short.views}</p>
      </div>
    </article>
  );
}

export function ShortsShelf() {
  return (
    <section aria-labelledby="cat-shorts">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 rotate-[10deg] items-center justify-center rounded-lg bg-brand">
          <Play className="size-4 fill-white text-white" strokeWidth={2.5} />
        </span>
        <h2 id="cat-shorts" className="text-lg font-semibold text-ink">
          Cat Shorts
        </h2>
        <a
          href="#"
          className="ml-auto text-sm font-medium text-link hover:underline"
        >
          View all
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {shorts.map((short) => (
          <ShortCard key={short.id} short={short} />
        ))}
      </div>
    </section>
  );
}
