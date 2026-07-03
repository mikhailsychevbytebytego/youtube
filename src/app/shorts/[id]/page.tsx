import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/meowtube/Navbar";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { ShortsPlayer } from "@/components/meowtube/shorts/ShortsPlayer";
import { getAllShorts, getWatchShort } from "@/lib/queries";

export const dynamic = "force-dynamic";

type ShortsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ShortsPageProps): Promise<Metadata> {
  const { id } = await params;
  const short = await getWatchShort(id);
  if (!short) return { title: "Short not found · MeowTube" };
  return {
    title: `${short.title} · Cat Shorts · MeowTube`,
  };
}

export default async function WatchShortPage({ params }: ShortsPageProps) {
  const { id } = await params;

  const [currentShort, allShorts] = await Promise.all([
    getWatchShort(id),
    getAllShorts(),
  ]);

  if (!currentShort) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f0f0f]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center bg-zinc-950">
          <ShortsPlayer currentShort={currentShort} allShorts={allShorts} />
        </main>
      </div>
    </div>
  );
}
