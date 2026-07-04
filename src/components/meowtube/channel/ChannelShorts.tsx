import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { ChannelShort } from "@/lib/channel-data";

export function ChannelShorts({ shorts }: { shorts: ChannelShort[] }) {
  return (
    <section className="flex w-full flex-col gap-6 pb-12">
      <div className="flex items-center gap-3">
        <PlayCircle className="size-6 text-red-600" />
        <h2 className="text-xl font-bold text-foreground">Cat Shorts</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {shorts.map((short) => (
          <Link key={short.id} href={`/shorts/${short.id}`} className="group flex w-full flex-col gap-2.5">
            <div className="relative aspect-[4/7] w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={short.thumbnail}
                alt={short.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-200 scale-[1.02] group-hover:scale-[1.05]"
              />
            </div>
            <div className="flex w-full flex-col gap-0.5 text-sm">
              <p className="line-clamp-2 font-semibold leading-5 text-foreground">{short.title}</p>
              <p className="text-muted-foreground">{short.views}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
