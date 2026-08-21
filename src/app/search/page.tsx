import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { VideoCard } from "@/components/video-card";
import { getSidebarChannels, searchVideos } from "@/lib/queries";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `${q} - MewTube Search` : "Search - MewTube" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [results, subscriptions] = await Promise.all([
    query ? searchVideos(query) : Promise.resolve([]),
    getSidebarChannels(4),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header query={query} />
      <div className="flex flex-1 items-start">
        <Sidebar subscriptions={subscriptions} />
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-6 pt-3 pb-10">
          {query === "" ? (
            <EmptyState message="Type something in the search box to find cat videos." />
          ) : results.length === 0 ? (
            <EmptyState message={`No results for "${query}".`} />
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#0f0f0f]">
                Results for &ldquo;{query}&rdquo;
              </h1>
              <div className="grid w-full grid-cols-4 gap-x-4 gap-y-10">
                {results.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 pt-24 text-center">
      <SearchX className="size-10 text-[#606060]" />
      <p className="text-base text-[#606060]">{message}</p>
    </div>
  );
}
