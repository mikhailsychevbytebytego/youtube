import { notFound } from "next/navigation";
import { updateChannel } from "@/app/admin/actions";
import { ChannelForm } from "@/components/admin/channel-form";
import { getAllUsers, getChannel } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function EditChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [channel, owners] = await Promise.all([getChannel(id), getAllUsers()]);
  if (!channel) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">Edit channel</h1>
      <ChannelForm
        action={updateChannel.bind(null, channel.id)}
        channel={channel}
        owners={owners}
      />
    </>
  );
}
