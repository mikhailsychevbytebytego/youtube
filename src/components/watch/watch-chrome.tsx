"use client";

import { useState } from "react";
import { WatchHeader } from "@/components/watch/watch-header";
import { WatchSidebar } from "@/components/watch/watch-sidebar";
import type { SidebarChannel } from "@/lib/queries";
import type { Theme } from "@/lib/theme";

export function WatchChrome({
  theme,
  searchPlaceholder,
  subscriptions,
  children,
}: {
  theme: Theme;
  searchPlaceholder?: string;
  subscriptions: SidebarChannel[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <WatchHeader
        theme={theme}
        searchPlaceholder={searchPlaceholder}
        menuOpen={open}
        onMenuClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-14 z-30 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-14 left-0 z-40 h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background shadow-[4px_0_24px_rgba(0,0,0,0.15)]">
            <WatchSidebar subscriptions={subscriptions} />
          </div>
        </>
      ) : null}
      {children}
    </>
  );
}
