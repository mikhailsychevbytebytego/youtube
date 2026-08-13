"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, EllipsisVertical } from "lucide-react";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { formatViews } from "@/lib/format";
import { shorts, type Short } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function ShortsCard({ short }: { short: Short }) {
  return (
    <article className="w-40 shrink-0">
      <div className="relative aspect-9/16 overflow-hidden rounded-xl">
        <MediaPlaceholder
          seed={short.id}
          emoji={short.emoji}
          className="size-full"
          emojiClassName="text-5xl"
        />
        <button
          type="button"
          aria-label={`More options for ${short.title}`}
          className="absolute top-1 right-1 grid size-7 place-items-center rounded-full text-white transition-colors hover:bg-black/30"
        >
          <EllipsisVertical className="size-4" />
        </button>
        <h3 className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6 text-sm leading-5 font-medium text-white">
          {short.title}
        </h3>
      </div>
      <p className="text-muted mt-1.5 text-xs">{formatViews(short.views)}</p>
    </article>
  );
}

export function ShortsShelf() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, [syncArrows]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section aria-label="Cat Shorts" className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span aria-hidden>🐾</span>
          Cat Shorts
          <span aria-hidden>🐾</span>
        </h2>
        <a href="#" className="hover:bg-subtle ml-auto rounded-full px-3 py-1.5 text-sm font-medium">
          View all
        </a>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={syncArrows}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth"
        >
          {shorts.map((short) => (
            <ShortsCard key={short.id} short={short} />
          ))}
        </div>

        <ShelfArrow
          direction="left"
          visible={canScrollLeft}
          onClick={() => scrollByPage(-1)}
        />
        <ShelfArrow
          direction="right"
          visible={canScrollRight}
          onClick={() => scrollByPage(1)}
        />
      </div>
    </section>
  );
}

function ShelfArrow({
  direction,
  visible,
  onClick,
}: {
  direction: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      // Vertically centered on the artwork rather than the card, which also
      // includes the view-count line underneath.
      className={cn(
        "bg-background absolute top-[38%] grid size-9 place-items-center rounded-full shadow-md ring-1 ring-black/5 transition-opacity",
        direction === "left" ? "-left-4" : "-right-4",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
