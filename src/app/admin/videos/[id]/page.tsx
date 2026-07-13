import { notFound } from "next/navigation";
import { updateVideo } from "@/app/admin/actions";
import { VideoForm } from "@/components/admin/video-form";
import { getAllChannels, getVideo } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [video, channels] = await Promise.all([
    getVideo(id),
    getAllChannels(),
  ]);
  if (!video) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">Edit video</h1>
      <VideoForm
        action={updateVideo.bind(null, video.id)}
        video={video}
        channels={channels}
      />
    </>
  );
}
