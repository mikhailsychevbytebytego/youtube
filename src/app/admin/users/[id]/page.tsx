import { notFound } from "next/navigation";
import { updateUser } from "@/app/admin/actions";
import { UserForm } from "@/components/admin/user-form";
import { getUser } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">Edit user</h1>
      <UserForm action={updateUser.bind(null, user.id)} user={user} />
    </>
  );
}
