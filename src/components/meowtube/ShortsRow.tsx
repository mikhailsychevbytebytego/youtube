import Image from "next/image";
import Link from "next/link";
import { Cat } from "lucide-react";
import type { Short } from "@/lib/meowtube-data";

export function ShortsRow({ shorts }: { shorts: Short[] }) {
  return (
    <section className="flex w-full flex-col gap-4 py-6">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center text-red-600">
          <Cat className="size-6" />
        </span>
        <h2 className="text-xl font-bold text-foreground">Cat Shorts</h2>
      </div>
      <div className="flex w-full gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shorts.map((short) => (
          <Link key={short.id} href={`/shorts/${short.id}`} className="group flex w-[140px] shrink-0 flex-col gap-1.5">
            <div className="relative aspect-[4/7] w-full overflow-hidden rounded-[10px] bg-muted">
              <Image
                src={short.thumbnail}
                alt={short.title}
                fill
                sizes="140px"
                className="object-cover transition-transform duration-200 scale-[1.02] group-hover:scale-[1.05]"
              />
              {short.similarity !== undefined && short.similarity > 0 && (
                <div className="absolute left-1.5 top-1.5 rounded bg-black/75 px-1 py-0.5 text-[10px] font-semibold text-green-400">
                  {(short.similarity * 100).toFixed(0)}% match
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-0.5">
              <p className="line-clamp-2 text-[13px] font-semibold text-foreground">{short.title}</p>
              <p className="text-xs text-muted-foreground">{short.views}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
