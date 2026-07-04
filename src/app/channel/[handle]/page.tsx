import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/meowtube/Navbar";
import { ChannelHeader } from "@/components/meowtube/channel/ChannelHeader";
import { ChannelShorts } from "@/components/meowtube/channel/ChannelShorts";
import { ChannelTabs } from "@/components/meowtube/channel/ChannelTabs";
import { ChannelVideoCard } from "@/components/meowtube/channel/ChannelVideoCard";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { getChannelBySlug, searchChannelVideos } from "@/lib/queries";

export const dynamic = "force-dynamic";

type ChannelPageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

export default async function ChannelPage({ params, searchParams }: ChannelPageProps) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;
  const channel = await getChannelBySlug(handle);

  if (!channel) notFound();

  const tab = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'videos';
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';

  let content;

  if (query) {
    const searchResults = await searchChannelVideos(handle, query);
    content = (
      <div className="grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {searchResults.length > 0 ? (
          searchResults.map((video) => (
            <ChannelVideoCard key={video.id} video={video} channelName={channel.name} />
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No videos match your search.
          </div>
        )}
      </div>
    );
  } else if (tab === 'videos') {
    const firstRow = channel.videos.slice(0, 4);
    const secondRow = channel.videos.slice(4, 8);
    content = (
      <>
        <div className="grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {firstRow.map((video) => (
            <ChannelVideoCard key={video.id} video={video} channelName={channel.name} />
          ))}
        </div>
        {secondRow.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {secondRow.map((video) => (
              <ChannelVideoCard key={video.id} video={video} channelName={channel.name} />
            ))}
          </div>
        )}
      </>
    );
  } else if (tab === 'shorts') {
    content = <ChannelShorts shorts={channel.shorts} />;
  } else if (tab === 'about') {
    content = (
      <div className="flex flex-col gap-4 py-6 max-w-3xl">
        <h2 className="text-xl font-bold">Description</h2>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{channel.description}</p>
        <div className="mt-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold">Details</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{channel.subscribers}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{channel.videos.length} videos</span>
          </div>
        </div>
      </div>
    );
  } else {
    content = <div className="py-10 text-muted-foreground">This tab is empty.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 pb-20">
          <div className="mx-auto w-full max-w-[1284px]">
            <ChannelHeader channel={channel} />
            <ChannelTabs activeTab={query ? 'Search' : tab} channelHandle={handle} />
            
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
