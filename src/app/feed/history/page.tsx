import Link from "next/link";
import { Clock } from "lucide-react";
import { getSession } from "@/lib/auth-server";
import { Navbar } from "@/components/meowtube/Navbar";
import { Sidebar } from "@/components/meowtube/Sidebar";
import { VideoCard } from "@/components/meowtube/VideoCard";
import { getUserWatchHistory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getSession();

  // If not logged in, render an elegant sign-in call to action
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground relative">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
        <main className="min-w-0 flex-1 px-6 pb-20 pt-12 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <div className="flex size-24 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6 shadow-sm">
            <Clock className="size-12" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Keep track of what you watch</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Sign in to view your watch history and pick up right where you left off.
          </p>
          <Link
            href="/login?callbackUrl=/feed/history"
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-md"
          >
            Sign In Now
          </Link>
        </main>
        </div>
      </div>
    );
  }

  // Logged in user: load history data
  const historyVideos = await getUserWatchHistory(session.user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 pb-20 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Clock className="size-7 text-red-600" /> Watch History
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                The videos you have recently watched on MeowTube
              </p>
            </div>
          </div>

          {historyVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <div className="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-5">
                <Clock className="size-10" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Your history is empty</h2>
              <p className="text-sm text-muted-foreground mb-6">
                You haven&apos;t watched any videos yet! Start exploring and they will show up here.
              </p>
              <Link
                href="/"
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-sm"
              >
                Go Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {historyVideos.map((video, index) => (
                // We append index to ID in key because same video can appear multiple times in history
                <VideoCard key={`${video.id}-${index}`} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
