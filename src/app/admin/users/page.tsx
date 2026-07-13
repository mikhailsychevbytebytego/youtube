import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { deleteUser } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/admin/pagination";
import { listUsers } from "@/lib/admin-queries";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { rows, total, pageCount } = await listUsers(page);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0f0f0f]">
          Users <span className="text-base font-normal text-[#606060]">({total})</span>
        </h1>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 rounded-full bg-[#0f0f0f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#272727]"
        >
          <Plus className="size-4" /> New user
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e5e5]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f8f8] text-xs font-semibold text-[#606060]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {rows.map((user) => (
              <tr key={user.id} className="hover:bg-[#f8f8f8]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[#f2f2f2]">
                      {user.avatarUrl && (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-semibold text-[#0f0f0f]">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#606060]">{user.email}</td>
                <td className="px-4 py-3 text-[#606060]">
                  {timeAgo(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#f2f2f2]"
                    >
                      <Pencil className="size-4" /> Edit
                    </Link>
                    <DeleteButton
                      action={deleteUser.bind(null, user.id)}
                      message={`Delete user "${user.name}"? Their channels and videos will be deleted too.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#606060]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/admin/users" />
    </>
  );
}
