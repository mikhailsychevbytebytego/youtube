"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ChevronDown, PawPrint } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import type { SidebarChannel } from "@/lib/queries";
import type { Channel } from "@/db/schema";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function SidebarSubscriptions({
  initialChannels = [],
}: {
  initialChannels?: SidebarChannel[];
}) {
  const mounted = useIsMounted();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { channels: realSubs, subscribedIds } = useSubscriptions();
  const [showAll, setShowAll] = useState(false);

  // Map of all known channels (from initial server props or fetched real subs)
  const knownMap = new Map<string, SidebarChannel>();
  initialChannels.forEach((ch) => knownMap.set(ch.id, ch));
  realSubs.forEach((ch: Channel) => {
    const existing = knownMap.get(ch.id);
    knownMap.set(ch.id, {
      ...ch,
      isLive: existing?.isLive ?? false,
      hasNew: existing?.hasNew ?? true,
    });
  });

  // Calculate subscribed channels
  const displayChannels = mounted && (session?.user || isSessionPending)
    ? subscribedIds
        .map((id) => knownMap.get(id) || realSubs.find((c) => c.id === id))
        .filter((ch): ch is SidebarChannel => Boolean(ch))
    : [];

  if (mounted && !isSessionPending && !session?.user) {
    return (
      <div className="flex w-full flex-col gap-2 pt-1">
        <div className="flex items-center justify-between px-3">
          <Link
            href="/subscriptions"
            className="text-sm font-semibold text-foreground hover:text-foreground/80 flex items-center gap-1.5"
          >
            <span>Subscriptions</span>
            <PawPrint className="size-3.5 text-[#ff0000]" />
          </Link>
        </div>
        <div className="flex flex-col gap-2 px-3 py-1">
          <p className="text-xs text-muted leading-relaxed">
            Sign in to subscribe to cat channels and view your feed.
          </p>
          <Link
            href="/signin"
            className="self-start rounded-full bg-[#ff0000] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#e60000] transition-colors shadow-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const visibleChannels = showAll ? displayChannels : displayChannels.slice(0, 6);
  const hasMore = displayChannels.length > 6;

  return (
    <div className="flex w-full flex-col gap-2 pt-1">
      <div className="flex items-center justify-between px-3">
        <Link
          href="/subscriptions"
          className="text-sm font-semibold text-foreground hover:text-foreground/80 flex items-center gap-1.5"
        >
          <span>Subscriptions</span>
          <PawPrint className="size-3.5 text-[#ff0000]" />
        </Link>
        {displayChannels.length > 0 && (
          <span className="text-xs text-muted font-normal">
            {displayChannels.length}
          </span>
        )}
      </div>

      {!mounted || displayChannels.length === 0 ? (
        <div className="flex flex-col gap-1.5 px-3 py-1.5 text-xs text-muted">
          <p>No subscriptions yet.</p>
          <Link
            href="/subscriptions"
            className="text-[#ff0000] hover:underline font-medium inline-block"
          >
            Explore channels &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {visibleChannels.map((sub) => (
            <Link
              key={sub.id}
              href={`/channel?id=${sub.id}`}
              className="flex w-full items-center gap-3.5 rounded-[10px] px-3 py-2 transition-colors hover:bg-surface font-medium"
            >
              <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-border/50">
                <Image
                  src={sub.avatarUrl ?? "/images/avatar-user.png"}
                  alt={sub.name}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <span className="flex-1 truncate text-sm text-foreground">
                {sub.name}
              </span>
              <span
                title="Subscribed"
                className="size-2 shrink-0 rounded-full bg-[#ff0000]"
              />
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              showAll ? "rotate-180" : ""
            }`}
          />
          <span>
            {showAll ? "Show less" : `Show ${displayChannels.length - 6} more`}
          </span>
        </button>
      )}
    </div>
  );
}
