import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/meowtube/Navbar";
import { ChannelHeader } from "@/components/meowtube/channel/ChannelHeader";
import { ChannelShorts } from "@/components/meowtube/channel/ChannelShorts";
import { ChannelTabs } from "@/components/meowtube/channel/ChannelTabs";
import { ChannelVideoCard } from "@/components/meowtube/channel/ChannelVideoCard";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { getChannelBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

type ChannelPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { handle } = await params;
  const channel = await getChannelBySlug(handle);
  if (!channel) return { title: "Channel not found · MeowTube" };
  return {
    title: `${channel.name} · MeowTube`,
    description: channel.description,
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { handle } = await params;
  const channel = await getChannelBySlug(handle);

  if (!channel) notFound();

  const firstRow = channel.videos.slice(0, 4);
  const secondRow = channel.videos.slice(4, 8);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 pb-20">
          <div className="mx-auto w-full max-w-[1284px]">
            <ChannelHeader channel={channel} />
            <ChannelTabs />

            <div className="grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {firstRow.map((video) => (
                <ChannelVideoCard key={video.id} video={video} channelName={channel.name} />
              ))}
            </div>

            <ChannelShorts shorts={channel.shorts} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {secondRow.map((video) => (
                <ChannelVideoCard key={video.id} video={video} channelName={channel.name} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
