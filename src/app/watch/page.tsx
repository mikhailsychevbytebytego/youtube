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
  getRecentShorts,
  getRelatedVideos,
  getSidebarChannels,
  getWatchVideo,
  isVideoLiked,
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
  const [theme, video, session] = await Promise.all([
    getTheme(),
    getWatchVideo(v),
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!video) notFound();

  const [upNext, kittenShorts, catShorts, subscriptions, liked] =
    await Promise.all([
      getRelatedVideos(video),
      getChannelShorts(video.channelId, 3),
      getRecentShorts(video.channelId, 3),
      getSidebarChannels(4),
      session?.user ? isVideoLiked(session.user.id, video.id) : false,
    ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WatchChrome theme={theme} subscriptions={subscriptions}>
        <div className="flex flex-1 flex-col lg:flex-row lg:items-start">
          <main className="flex min-w-0 flex-1 flex-col gap-3 p-0 lg:p-6">
            <VideoPlayer video={video} />
            <div className="px-3 lg:px-0">
              <VideoDetails video={video} liked={liked} />
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
