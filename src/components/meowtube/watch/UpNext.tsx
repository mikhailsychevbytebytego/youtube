import Image from "next/image";
import Link from "next/link";
import type { Recommendation } from "@/lib/watch-data";

export function UpNext({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="flex w-full flex-col gap-4 lg:w-[402px] lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-black">Up Next</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-black">Autoplay</span>
          <span className="relative h-5 w-9 rounded-full bg-red-600">
            <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" />
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex w-full flex-col gap-3">
            {rec.sectionLabel && (
              <div className="flex items-center gap-3 py-1">
                <span className="text-sm font-semibold text-[#606060]">{rec.sectionLabel}</span>
                <span className="h-px flex-1 bg-[#e5e5e5]" />
              </div>
            )}
            <Link href={`/watch/${rec.id}`} className="group flex w-full gap-3">
              <div className="relative h-[94px] w-[168px] shrink-0 overflow-hidden rounded-lg bg-[#f2f2f2]">
                <Image
                  src={rec.thumbnail}
                  alt={rec.title}
                  fill
                  sizes="168px"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="line-clamp-2 text-sm font-semibold text-[#0f0f0f]">{rec.title}</p>
                <div className="flex flex-col gap-0.5 text-xs text-[#606060]">
                  <span>{rec.channel}</span>
                  <span>
                    {rec.views} · {rec.publishedAt}
                  </span>
                  {rec.similarity !== undefined && rec.similarity > 0 && (
                    <span className="font-semibold text-green-600">
                      {(rec.similarity * 100).toFixed(0)}% related
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
