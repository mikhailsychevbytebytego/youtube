import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { ShortsFeed } from "@/components/shorts/shorts-feed";
import { auth } from "@/lib/auth";
import { getTheme } from "@/lib/get-theme";
import {
  forClientVideo,
  getShorts,
  getSidebarChannels,
  isVideoLiked,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Cat Shorts - MewTube",
};

export const dynamic = "force-dynamic";

export default async function ShortsPage() {
  const [theme, starter, subscriptions, session] = await Promise.all([
    getTheme(),
    getShorts(1),
    getSidebarChannels(4),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const starterShort = starter[0];
  const liked =
    session?.user && starterShort
      ? await isVideoLiked(session.user.id, starterShort.id)
      : false;
  const initialShorts = starter.map((short) => ({
    ...forClientVideo(short),
    liked: short.id === starterShort?.id ? liked : false,
  }));

  return (
    // h-screen with overflow-hidden keeps the scrolling inside <main>, which is
    // what gives the snap container a fixed height to snap against.
    <div className="flex h-dvh flex-col overflow-hidden bg-background pb-14 md:h-screen md:pb-0">
      <Header theme={theme} />
      {/* No items-start here: <main> has to stretch to full height or the snap
          container has nothing to snap against. */}
      <div className="flex min-h-0 flex-1">
        <Sidebar subscriptions={subscriptions} activeItem="Shorts" />
        <main className="h-full min-h-0 flex-1">
          <ShortsFeed initialShorts={initialShorts} />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
