import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { WatchHeader } from "@/components/watch/watch-header";
import { ChannelSidebar } from "@/components/channel/channel-sidebar";
import { ChannelHero } from "@/components/channel/channel-hero";
import {
  ChannelUploads,
  FeaturedVideo,
} from "@/components/channel/channel-uploads";
import { ChannelShorts } from "@/components/channel/channel-shorts";
import { auth } from "@/lib/auth";
import { getTheme } from "@/lib/get-theme";
import {
  getChannelWithContent,
  getIsSubscribed,
  getSidebarChannels,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const DEFAULT_CHANNEL_HANDLE = "@thedailypurr";

type ChannelPageProps = {
  searchParams: Promise<{ id?: string; handle?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ChannelPageProps): Promise<Metadata> {
  const { id, handle } = await searchParams;
  const identifier = id || handle || DEFAULT_CHANNEL_HANDLE;
  const content = await getChannelWithContent(identifier);
  return {
    title: content ? `${content.channel.name} - MewTube` : "MewTube",
  };
}

export default async function ChannelPage({ searchParams }: ChannelPageProps) {
  const { id, handle } = await searchParams;
  const identifier = id || handle || DEFAULT_CHANNEL_HANDLE;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const [theme, content, subscriptions] = await Promise.all([
    getTheme(),
    getChannelWithContent(identifier),
    getSidebarChannels(5),
  ]);
  if (!content) notFound();

  const isSubscribed = await getIsSubscribed(userId, content.channel.id);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WatchHeader theme={theme} searchPlaceholder="Search" />
      <div className="flex flex-1 items-start">
        <ChannelSidebar subscriptions={subscriptions} />
        <main className="flex min-w-0 flex-1 flex-col">
          <ChannelHero channel={content.channel} initialSubscribed={isSubscribed} />
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
