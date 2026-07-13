import { createVideo } from "@/app/admin/actions";
import { VideoForm } from "@/components/admin/video-form";
import { getAllChannels } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function NewVideoPage() {
  const channels = await getAllChannels();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">New video</h1>
      <VideoForm action={createVideo} channels={channels} />
    </>
  );
}
