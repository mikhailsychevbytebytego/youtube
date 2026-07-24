import type { Metadata } from "next";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSidebarChannels } from "@/lib/queries";
import { SubscriptionsFeed } from "@/components/subscriptions-feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscriptions - MewTube",
  description: "Feed of videos from your subscribed channels on MewTube.",
};

export default async function SubscriptionsPage() {
  const [recommendedChannels, sidebarChannels] = await Promise.all([
    db.query.channels.findMany({
      orderBy: desc(channels.subscriberCount),
      limit: 6,
    }),
    getSidebarChannels(5),
  ]);

  return (
    <SubscriptionsFeed
      recommendedChannels={recommendedChannels}
      sidebarChannels={sidebarChannels}
    />
  );
}
