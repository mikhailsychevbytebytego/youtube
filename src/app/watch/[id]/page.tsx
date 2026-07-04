import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/meowtube/Navbar";
import { CommentsSection } from "@/components/meowtube/watch/CommentsSection";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { UpNext } from "@/components/meowtube/watch/UpNext";
import { VideoPlayer } from "@/components/meowtube/watch/VideoPlayer";
import { WatchInfo } from "@/components/meowtube/watch/WatchInfo";
import { getRecommendations, getWatchVideo, getVideoComments } from "@/lib/queries";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await getWatchVideo(id);
  if (!video) return { title: "Video not found · MeowTube" };
  return {
    title: `${video.title} · MeowTube`,
    description: video.description,
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const [video, recommendations, comments] = await Promise.all([
    getWatchVideo(id),
    getRecommendations(id),
    getVideoComments(id),
  ]);

  if (!video) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 pb-10 pt-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col">
            <VideoPlayer video={video} />
            <WatchInfo video={video} />
            <CommentsSection comments={comments} />
          </div>
          <UpNext recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
