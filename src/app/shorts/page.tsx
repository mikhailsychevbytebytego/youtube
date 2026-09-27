import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ShortItem } from "@/components/shorts/short-item";
import { shorts } from "@/lib/data";
import { getTheme } from "@/lib/get-theme";

export const metadata: Metadata = {
  title: "Cat Shorts - MewTube",
};

export default async function ShortsPage() {
  const theme = await getTheme();

  return (
    // h-screen with overflow-hidden keeps the scrolling inside <main>, which is
    // what gives the snap container a fixed height to snap against.
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header theme={theme} />
      {/* No items-start here: <main> has to stretch to full height or the snap
          container has nothing to snap against. */}
      <div className="flex min-h-0 flex-1">
        <Sidebar activeItem="Shorts" />
        <main className="h-full flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain">
          {shorts.map((short) => (
            <ShortItem key={short.id} short={short} />
          ))}
        </main>
      </div>
    </div>
  );
}
