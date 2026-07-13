import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchHeader } from "@/components/watch/watch-header";
import { WatchSidebar } from "@/components/watch/watch-sidebar";
import { VideoPlayer } from "@/components/watch/video-player";
import { VideoDetails } from "@/components/watch/video-details";
import { WatchRightRail } from "@/components/watch/watch-right-rail";
import { getTheme } from "@/lib/get-theme";
import {
  getChannelShorts,
  getRecentShorts,
  getSidebarChannels,
  getUpNextVideos,
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
  const [theme, video] = await Promise.all([getTheme(), getWatchVideo(v)]);
  if (!video) notFound();

  const [upNext, kittenShorts, catShorts, subscriptions] = await Promise.all([
    getUpNextVideos(video),
    getChannelShorts(video.channelId, 3),
    getRecentShorts(video.channelId, 3),
    getSidebarChannels(4),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WatchHeader theme={theme} />
      <div className="flex flex-1 items-start">
        <WatchSidebar subscriptions={subscriptions} />
        <main className="flex min-w-0 flex-1 flex-col gap-3 p-6">
          <VideoPlayer video={video} />
          <VideoDetails video={video} />
        </main>
        <WatchRightRail
          upNext={upNext}
          kittenShorts={kittenShorts}
          catShorts={catShorts}
        />
      </div>
    </div>
  );
}
