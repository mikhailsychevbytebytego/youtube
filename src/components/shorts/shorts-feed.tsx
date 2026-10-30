"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShortItem } from "@/components/shorts/short-item";
import type { VideoWithChannel } from "@/lib/queries";

export function ShortsFeed({
  initialShorts,
}: {
  initialShorts: VideoWithChannel[];
}) {
  const [shorts, setShorts] = useState(initialShorts);
  const shortsRef = useRef(shorts);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLElement | null>(null);

  shortsRef.current = shorts;

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    const seen = shortsRef.current;
    const last = seen[seen.length - 1];
    if (!last) return;

    loadingRef.current = true;
    try {
      const exclude = seen.map((short) => short.id).join(",");
      const response = await fetch(
        `/api/shorts/next?from=${last.id}&exclude=${exclude}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as { short: VideoWithChannel | null };
      if (data.short) {
        setShorts((prev) => [...prev, data.short!]);
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    const target = lastItemRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { root, threshold: 0.4 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, shorts.length]);

  if (shorts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No Shorts yet.
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
    >
      {shorts.map((short, index) => (
        <ShortItem
          key={`${short.id}-${index}`}
          short={short}
          rootRef={index === shorts.length - 1 ? lastItemRef : undefined}
        />
      ))}
    </div>
  );
}
