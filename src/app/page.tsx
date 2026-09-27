import { X } from "lucide-react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { FilterChips } from "@/components/filter-chips";
import { VideoCard } from "@/components/video-card";
import { ShortsCard } from "@/components/shorts-card";
import { shorts, videos } from "@/lib/data";
import { getTheme } from "@/lib/get-theme";

export default async function Home() {
  const theme = await getTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header theme={theme} />
      <div className="flex flex-1 items-start">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-6 pt-3 pb-10">
          <FilterChips />

          <div className="grid w-full grid-cols-4 gap-x-4 gap-y-10">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          <section className="flex w-full flex-col gap-6 pt-4">
            <div className="w-full border-t border-border" />
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-[10px] border-2 border-[#ff0000]">
                <X className="size-2.5 text-[#ff0000]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Cat Shorts</h2>
            </div>
            <div className="grid w-full grid-cols-6 gap-4">
              {shorts.map((short) => (
                <ShortsCard key={short.id} short={short} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
