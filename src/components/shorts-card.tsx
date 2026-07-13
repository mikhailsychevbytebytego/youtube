import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/db/schema";
import { formatViews } from "@/lib/format";

export function ShortsCard({ short }: { short: Video }) {
  return (
    <Link href={`/watch?v=${short.id}`} className="flex flex-col gap-2">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl">
        <Image
          src={short.thumbnailUrl ?? "/images/avatar-user.png"}
          alt={short.title}
          fill
          sizes="(min-width: 1280px) 16vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="truncate text-sm font-medium text-foreground">
          {short.title}
        </h3>
        <p className="text-xs text-muted">{formatViews(short.viewCount)}</p>
      </div>
    </Link>
  );
}
