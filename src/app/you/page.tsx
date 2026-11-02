import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { VideoCard } from "@/components/video-card";
import { auth } from "@/lib/auth";
import { getTheme } from "@/lib/get-theme";
import {
  getChannelForUser,
  getOwnedChannelVideos,
  getSidebarChannels,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You - MewTube",
};

export default async function YouPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/signin?next=/you");
  }

  const [theme, channel, subscriptions] = await Promise.all([
    getTheme(),
    getChannelForUser(session.user.id),
    getSidebarChannels(4),
  ]);
  const uploads = channel ? await getOwnedChannelVideos(channel) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header theme={theme} />
      <div className="flex flex-1 items-start">
        <Sidebar subscriptions={subscriptions} activeItem="Library" />
        <main className="flex min-w-0 flex-1 flex-col gap-8 px-3 pt-3 pb-20 md:px-6 md:pb-10">
          <section className="flex items-start gap-4 rounded-2xl border border-border p-4 md:p-6">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full md:size-20">
              <Image
                src={session.user.image || "/images/avatar-user.png"}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Your account
              </p>
              <h1 className="truncate text-2xl font-bold text-foreground">
                {session.user.name}
              </h1>
              <p className="truncate text-sm text-muted">{session.user.email}</p>
            </div>
          </section>

          {channel ? (
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-border p-4 md:flex-row md:items-center md:p-6">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={channel.avatarUrl ?? "/images/avatar-user.png"}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                    Your channel
                  </p>
                  <h2 className="truncate text-xl font-bold text-foreground">
                    {channel.name}
                  </h2>
                  <p className="truncate text-sm text-muted">{channel.handle}</p>
                </div>
                <Link
                  href={`/channel?handle=${encodeURIComponent(channel.handle)}`}
                  className="self-start rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-border"
                >
                  View channel
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-foreground">
                  Your videos
                </h2>
                {uploads.length > 0 ? (
                  <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                    {uploads.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    This channel has no videos yet. Uploads will show up here
                    and on the public channel page.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-start gap-4 rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground">
                You don&apos;t have a channel yet
              </h2>
              <p className="max-w-xl text-sm text-muted">
                Signing in created an account. A channel is a separate public
                identity you publish as — name, handle, and picture of its own.
              </p>
              <Link
                href="/you/create"
                className="rounded-full bg-[#ff0000] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e60000]"
              >
                Create a channel
              </Link>
            </section>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
