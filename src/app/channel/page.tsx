import type { Metadata } from "next";
import { WatchHeader } from "@/components/watch/watch-header";
import { ChannelSidebar } from "@/components/channel/channel-sidebar";
import { ChannelHero } from "@/components/channel/channel-hero";
import {
  ChannelUploads,
  FeaturedVideo,
} from "@/components/channel/channel-uploads";
import { ChannelShorts } from "@/components/channel/channel-shorts";
import { channel } from "@/lib/channel-data";
import { getTheme } from "@/lib/get-theme";

export const metadata: Metadata = {
  title: `${channel.name} - MewTube`,
};

export default async function ChannelPage() {
  const theme = await getTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WatchHeader theme={theme} searchPlaceholder="Search" />
      <div className="flex flex-1 items-start">
        <ChannelSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <ChannelHero />
          <div className="flex w-full flex-col gap-10 p-6">
            <FeaturedVideo />
            <ChannelUploads />
            <ChannelShorts />
          </div>
        </main>
      </div>
    </div>
  );
}
