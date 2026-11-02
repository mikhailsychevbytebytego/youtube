import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { CreateChannelWizard } from "@/components/you/create-channel-wizard";
import { auth } from "@/lib/auth";
import { getTheme } from "@/lib/get-theme";
import { getChannelForUser, getSidebarChannels } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create a channel - MewTube",
};

export default async function CreateChannelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/signin?next=/you/create");
  }

  const [theme, channel, subscriptions] = await Promise.all([
    getTheme(),
    getChannelForUser(session.user.id),
    getSidebarChannels(4),
  ]);
  if (channel) {
    redirect("/you");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header theme={theme} />
      <div className="flex flex-1 items-start">
        <Sidebar subscriptions={subscriptions} activeItem="Library" />
        <main className="flex min-w-0 flex-1 justify-center px-3 pt-6 pb-20 md:px-6 md:pb-10">
          <CreateChannelWizard defaultName={session.user.name} />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
