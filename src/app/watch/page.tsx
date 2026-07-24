import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { WatchChrome } from "@/components/watch/watch-chrome";
import { VideoPlayer } from "@/components/watch/video-player";
import { VideoDetails } from "@/components/watch/video-details";
import { WatchRightRail } from "@/components/watch/watch-right-rail";
import { auth } from "@/lib/auth";
import { getTheme } from "@/lib/get-theme";
import {
  getChannelShorts,
  getIsSubscribed,
  getRecentShorts,
  getRelatedVideos,
  getSidebarChannels,
  getWatchVideo,
} from "@/lib/queries";

type WatchPageProps = {
  searchParams: Promise<{ v?: string }>;
};

export async function generateMetadata({
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const { v } = await searchParams;
  const video = await getWatchVideo(v);
  return { title: video ? `${video.title} - MewTube` : "MewTube" };
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const { v } = await searchParams;
  const video = await getWatchVideo(v);
  if (!video) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const [theme, upNext, kittenShorts, catShorts, subscriptions, isSubscribed] =
    await Promise.all([
      getTheme(),
      getRelatedVideos(video),
      getChannelShorts(video.channelId, 3),
      getRecentShorts(video.channelId, 3),
      getSidebarChannels(4),
      getIsSubscribed(userId, video.channelId),
    ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WatchChrome theme={theme} subscriptions={subscriptions}>
        <div className="flex flex-1 flex-col lg:flex-row lg:items-start">
          <main className="flex min-w-0 flex-1 flex-col gap-3 p-0 lg:p-6">
            <VideoPlayer video={video} />
            <div className="px-3 lg:px-0">
              <VideoDetails
                video={video}
                initialSubscribed={isSubscribed}
              />
            </div>
          </main>
          <WatchRightRail
            upNext={upNext}
            kittenShorts={kittenShorts}
            catShorts={catShorts}
          />
        </div>
      </WatchChrome>
    </div>
  );
}
