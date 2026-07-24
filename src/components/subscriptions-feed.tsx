"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Cat, FolderHeart, Sparkles } from "lucide-react";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { SubscribeButton } from "@/components/subscribe-button";
import { VideoCard } from "@/components/video-card";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import type { VideoWithChannel, SidebarChannel } from "@/lib/queries";
import type { Channel } from "@/db/schema";
import { formatCount } from "@/lib/format";

interface SubscriptionsFeedProps {
  recommendedChannels: Channel[];
  sidebarChannels: SidebarChannel[];
}

export function SubscriptionsFeed({
  recommendedChannels,
  sidebarChannels,
}: SubscriptionsFeedProps) {
  const { subscribedIds, channels: subscribedChannels, loading } = useSubscriptions();
  const [feedVideos, setFeedVideos] = useState<VideoWithChannel[]>([]);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);

  const fetchFeed = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setFeedVideos([]);
      return;
    }
    setIsFetchingVideos(true);
    try {
      const res = await fetch("/api/subscriptions/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelIds: ids }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedVideos(data.videos ?? []);
      }
    } catch (err) {
      console.error("Failed to load feed videos:", err);
    } finally {
      setIsFetchingVideos(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(subscribedIds);
  }, [subscribedIds, fetchFeed]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 items-start">
        <Sidebar subscriptions={sidebarChannels} activeItem="Subscriptions" />
        <main className="flex min-w-0 flex-1 flex-col p-6">
          <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#ff0000]/10 text-[#ff0000]">
                <FolderHeart className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
                <p className="text-xs text-muted">
                  Latest videos from your purrferred creators
                </p>
              </div>
            </div>

            {subscribedChannels.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
                {subscribedChannels.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/channel?id=${ch.id}`}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 hover:border-foreground/20 transition-all"
                  >
                    <div className="relative size-5 overflow-hidden rounded-full">
                      <Image
                        src={ch.avatarUrl ?? "/images/avatar-user.png"}
                        alt={ch.name}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                      {ch.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {loading || isFetchingVideos ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className="aspect-video w-full rounded-xl bg-surface" />
                  <div className="flex gap-3">
                    <div className="size-9 rounded-full bg-surface shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-4 w-3/4 rounded bg-surface" />
                      <div className="h-3 w-1/2 rounded bg-surface" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : subscribedIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-2xl mx-auto">
              <div className="flex size-20 items-center justify-center rounded-full bg-surface mb-4 shadow-inner">
                <Cat className="size-10 text-[#ff0000]" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Don't miss a single meow!
              </h2>
              <p className="text-sm text-muted mb-8 max-w-md leading-relaxed">
                Subscribe to your favorite cat channels to build your personal feed.
                Their latest videos will appear right here!
              </p>

              <div className="w-full text-left">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-4 text-[#ff0000]" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Recommended Channels
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 overflow-hidden rounded-full border border-border">
                          <Image
                            src={channel.avatarUrl ?? "/images/avatar-user.png"}
                            alt={channel.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">
                            {channel.name}
                          </span>
                          <span className="text-xs text-muted">
                            {formatCount(channel.subscriberCount)} subscribers
                          </span>
                        </div>
                      </div>
                      <SubscribeButton channelId={channel.id} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : feedVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Cat className="size-12 text-muted mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No videos found yet</h3>
              <p className="text-sm text-muted mt-1">
                Your subscribed channels haven't uploaded any videos yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {feedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
