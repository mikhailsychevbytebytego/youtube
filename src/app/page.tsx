import { FilterChips } from "@/components/filter-chips";
import { Header } from "@/components/header";
import { ShortsShelf } from "@/components/shorts-shelf";
import { Sidebar } from "@/components/sidebar";
import { VideoCard } from "@/components/video-card";
import { videos } from "@/lib/data";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-20 bg-background">
        <Header />
      </div>

      <div className="flex flex-1 items-start">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 pb-12 pt-3">
          <FilterChips />

          <h1 className="sr-only">Recommended cat videos</h1>
          <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          <hr className="my-6 border-line" />

          <ShortsShelf />
        </main>
      </div>
    </div>
  );
}
