import { createChannel } from "@/app/admin/actions";
import { ChannelForm } from "@/components/admin/channel-form";
import { getAllUsers } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function NewChannelPage() {
  const owners = await getAllUsers();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">New channel</h1>
      <ChannelForm action={createChannel} owners={owners} />
    </>
  );
}
