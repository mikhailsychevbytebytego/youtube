import { AppShell } from "@/components/app-shell";
import { FilterChips } from "@/components/filter-chips";
import { ShortsShelf } from "@/components/shorts-shelf";
import { VideoCard } from "@/components/video-card";
import { videos } from "@/lib/data";

export default function Home() {
  return (
    <AppShell>
      <main className="min-w-0 flex-1 px-4 pb-12 pt-3 sm:px-6">
        <FilterChips />

        <h1 className="sr-only">Recommended cat videos</h1>
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} eager={index === 0} />
          ))}
        </div>

        <hr className="my-8 border-line" />

        <ShortsShelf />
      </main>
    </AppShell>
  );
}
