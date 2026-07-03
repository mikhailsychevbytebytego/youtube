import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { channels } from "@/db/schema";
import { Navbar } from "@/components/meowtube/Navbar";
import { UploadForm } from "@/components/upload/UploadForm";
import { requireSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Upload · MeowTube",
  description: "Upload a video to MeowTube.",
};

export default async function UploadPage() {
  const session = await requireSession("/upload");

  // Check if they already have a channel, redirect to create channel if not
  const [userChannel] = await db
    .select({ id: channels.id })
    .from(channels)
    .where(eq(channels.ownerId, session.user.id))
    .limit(1);

  if (!userChannel) {
    redirect("/channel/new");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f9] text-[#0f0f0f]">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <UploadForm />
      </main>
    </div>
  );
}
