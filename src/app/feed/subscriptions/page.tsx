import Link from "next/link";
import Image from "next/image";
import { Compass, SquarePlay } from "lucide-react";
import { getSession } from "@/lib/auth-server";
import { Navbar } from "@/components/meowtube/Navbar";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { VideoCard } from "@/components/meowtube/VideoCard";
import { ShortsRow } from "@/components/meowtube/ShortsRow";
import { SubscribeButton } from "@/components/meowtube/SubscribeButton";
import {
  getSubscribedFeedVideos,
  getSubscribedFeedShorts,
  getSuggestedChannels,
} from "@/app/subscription-actions";

export const dynamic = "force-dynamic";

export default async function SubscriptionsFeedPage() {
  const session = await getSession();

  // If not logged in, render an elegant sign-in call to action
  if (!session) {
    const suggested = await getSuggestedChannels();

    return (
      <div className="flex min-h-screen flex-col bg-white text-[#0f0f0f]">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 px-6 pb-20 pt-12 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            <div className="flex size-24 items-center justify-center rounded-full bg-zinc-50 text-red-600 mb-6 shadow-sm">
              <SquarePlay className="size-12" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Don&apos;t miss new videos</h1>
            <p className="text-zinc-600 max-w-md mb-8">
              Sign in to see updates from your favorite MeowTube creators and view your customized subscription feed!
            </p>
            <Link
              href="/login?callbackUrl=/feed/subscriptions"
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-md mb-12"
            >
              Sign In Now
            </Link>

            {suggested.length > 0 && (
              <div className="w-full border-t border-zinc-100 pt-12">
                <h2 className="text-xl font-bold text-black mb-1">Explore Popular Channels</h2>
                <p className="text-sm text-zinc-500 mb-8">Get started by checking out these amazing cat creators</p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {suggested.map((chan) => (
                    <div
                      key={chan.name}
                      className="flex flex-col items-center p-5 rounded-2xl border border-zinc-100 hover:shadow-md transition-all text-center bg-white"
                    >
                      <div className="relative size-16 rounded-full overflow-hidden mb-3 border border-zinc-50">
                        <Image src={chan.avatar} alt={chan.name} fill className="object-cover" />
                      </div>
                      <h3 className="font-bold text-base text-zinc-900 leading-tight">{chan.name}</h3>
                      <p className="text-xs text-zinc-400 mb-2">{chan.subscribers}</p>
                      <p className="text-xs text-zinc-500 line-clamp-2 h-8 mb-4 max-w-[200px]">
                        {chan.description}
                      </p>
                      <SubscribeButton channelName={chan.name} className="w-full py-2 text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Logged in user: load feed data
  const [videos, shorts, suggested] = await Promise.all([
    getSubscribedFeedVideos(),
    getSubscribedFeedShorts(),
    getSuggestedChannels(),
  ]);

  const hasSubscribedToAny = suggested.length < 6; // If we exclude some, or we can check via DB, but suggested logic excludes subscribed ones.

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f0f0f]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 pb-20 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black flex items-center gap-2">
                <SquarePlay className="size-7 text-red-600" /> Subscriptions Feed
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                The latest uploads and shorts from the cat creators you follow
              </p>
            </div>
          </div>

          {/* User has subscriptions but there are no videos / shorts yet */}
          {videos.length === 0 && shorts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <div className="flex size-20 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 mb-5">
                <Compass className="size-10" />
              </div>
              <h2 className="text-lg font-bold text-black mb-1">Your feed is currently quiet</h2>
              <p className="text-sm text-zinc-500 mb-6">
                The channels you follow haven&apos;t posted any videos or shorts yet. Check out other recommendations!
              </p>
            </div>
          )}

          {/* Render feed content */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}

          {shorts.length > 0 && (
            <>
              <hr className="my-8 border-[#e5e5e5]" />
              <ShortsRow shorts={shorts} />
            </>
          )}

          {/* Recommendations section to keep feed discovery active */}
          {suggested.length > 0 && (
            <div className="mt-16 pt-12 border-t border-zinc-100">
              <h2 className="text-xl font-bold text-black mb-1">Recommended for You</h2>
              <p className="text-sm text-zinc-500 mb-6">More creators with wonderful claws and whiskers</p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {suggested.slice(0, 4).map((chan) => (
                  <div
                    key={chan.name}
                    className="flex flex-col items-center p-5 rounded-2xl border border-zinc-100 hover:shadow-md transition-all text-center bg-white"
                  >
                    <div className="relative size-14 rounded-full overflow-hidden mb-3 border border-zinc-50">
                      <Image src={chan.avatar} alt={chan.name} fill className="object-cover" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 leading-tight">{chan.name}</h3>
                    <p className="text-[11px] text-zinc-400 mb-2">{chan.subscribers}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2 h-8 mb-4 max-w-[180px]">
                      {chan.description}
                    </p>
                    <SubscribeButton channelName={chan.name} className="w-full py-2 text-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
