import type { Metadata } from "next";

import { Navbar } from "@/components/meowtube/Navbar";
import { CreateChannelForm } from "@/components/meowtube/channel/CreateChannelForm";
import { requireSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Create Channel · MeowTube",
  description: "Create a MeowTube channel.",
};

export default async function CreateChannelPage() {
  await requireSession("/channel/new");

  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f9] text-[#0f0f0f]">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <CreateChannelForm />
      </main>
    </div>
  );
}
