import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchHeader } from "@/components/watch/watch-header";
import { ChannelSidebar } from "@/components/channel/channel-sidebar";
import { ChannelHero } from "@/components/channel/channel-hero";
import {
  ChannelUploads,
  FeaturedVideo,
} from "@/components/channel/channel-uploads";
import { ChannelShorts } from "@/components/channel/channel-shorts";
import { getTheme } from "@/lib/get-theme";
import { getChannelWithContent, getSidebarChannels } from "@/lib/queries";

export const dynamic = "force-dynamic";

const CHANNEL_HANDLE = "@thedailypurr";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getChannelWithContent(CHANNEL_HANDLE);
  return {
    title: content ? `${content.channel.name} - MewTube` : "MewTube",
  };
}

export default async function ChannelPage() {
  const [theme, content, subscriptions] = await Promise.all([
    getTheme(),
    getChannelWithContent(CHANNEL_HANDLE),
    getSidebarChannels(5),
  ]);
  if (!content) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WatchHeader theme={theme} searchPlaceholder="Search" />
      <div className="flex flex-1 items-start">
        <ChannelSidebar subscriptions={subscriptions} />
        <main className="flex min-w-0 flex-1 flex-col">
          <ChannelHero channel={content.channel} />
          <div className="flex w-full flex-col gap-10 p-6">
            {content.featured && <FeaturedVideo video={content.featured} />}
            <ChannelUploads
              uploads={content.uploads}
              channelName={content.channel.name}
            />
            <ChannelShorts shorts={content.shorts} />
          </div>
        </main>
      </div>
    </div>
  );
}
