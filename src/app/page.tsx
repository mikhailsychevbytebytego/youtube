import { Navbar } from "@/components/meowtube/Navbar";
import { ShortsRow } from "@/components/meowtube/ShortsRow";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { VideoCard } from "@/components/meowtube/VideoCard";
import { getHomeShorts, getHomeVideos, searchHomeShorts, searchHomeVideos } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { q } = await searchParams;

  const [videos, shorts] = await Promise.all([
    q ? searchHomeVideos(q) : getHomeVideos(),
    q ? searchHomeShorts(q) : getHomeShorts(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f0f0f]">
      <Navbar searchQuery={q} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 pb-10 pt-3">
          {q ? (
            <div className="mb-6">
              <h1 className="text-xl font-bold text-black">
                You searched for &ldquo;{q}&rdquo;
              </h1>
            </div>
          ) : null}

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#606060]">
              <p className="text-lg font-semibold">No matching videos found</p>
              <p className="text-sm mt-1">Try looking for something else, like &quot;happy orange cat&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}

          {shorts.length > 0 && (
            <>
              <hr className="my-6 border-[#e5e5e5]" />
              <ShortsRow shorts={shorts} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
