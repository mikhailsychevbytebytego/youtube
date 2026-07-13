import type { Metadata } from "next";
import { WatchHeader } from "@/components/watch/watch-header";
import { WatchSidebar } from "@/components/watch/watch-sidebar";
import { VideoPlayer } from "@/components/watch/video-player";
import { VideoDetails } from "@/components/watch/video-details";
import { WatchRightRail } from "@/components/watch/watch-right-rail";
import { watchVideo } from "@/lib/watch-data";

export const metadata: Metadata = {
  title: `${watchVideo.title} - MewTube`,
};

export default function WatchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <WatchHeader />
      <div className="flex flex-1 items-start">
        <WatchSidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-3 p-6">
          <VideoPlayer />
          <VideoDetails />
        </main>
        <WatchRightRail />
      </div>
    </div>
  );
}
