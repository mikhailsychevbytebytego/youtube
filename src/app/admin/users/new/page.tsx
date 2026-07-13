import { createUser } from "@/app/admin/actions";
import { UserForm } from "@/components/admin/user-form";

export default function NewUserPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">New user</h1>
      <UserForm action={createUser} />
    </>
  );
}
