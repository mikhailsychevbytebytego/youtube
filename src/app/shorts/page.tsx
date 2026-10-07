import type { Metadata } from "next";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { ShortItem } from "@/components/shorts/short-item";
import { getTheme } from "@/lib/get-theme";
import { getShorts, getSidebarChannels } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Cat Shorts - MewTube",
};

export const dynamic = "force-dynamic";

export default async function ShortsPage() {
  const [theme, shorts, subscriptions] = await Promise.all([
    getTheme(),
    getShorts(12),
    getSidebarChannels(4),
  ]);

  return (
    // h-screen with overflow-hidden keeps the scrolling inside <main>, which is
    // what gives the snap container a fixed height to snap against.
    <div className="flex h-dvh flex-col overflow-hidden bg-background pb-14 md:h-screen md:pb-0">
      <Header theme={theme} />
      {/* No items-start here: <main> has to stretch to full height or the snap
          container has nothing to snap against. */}
      <div className="flex min-h-0 flex-1">
        <Sidebar subscriptions={subscriptions} activeItem="Shorts" />
        <main className="h-full flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain">
          {shorts.map((short) => (
            <ShortItem key={short.id} short={short} />
          ))}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
