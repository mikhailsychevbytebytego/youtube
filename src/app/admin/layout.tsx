import type { Metadata } from "next";
import Link from "next/link";
import { Cat } from "lucide-react";

import { requireSession } from "@/lib/auth-server";

import { entityConfigs, entityKeys } from "./config";

export const metadata: Metadata = {
  title: "Admin · MeowTube",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession("/admin");

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] text-[#0f0f0f]">
      <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-[#e5e5e5] bg-white p-4">
        <Link href="/admin" className="mb-4 flex items-center gap-2">
          <span className="flex items-center rounded-lg bg-red-600 p-1">
            <Cat className="size-5 text-white" />
          </span>
          <span className="text-lg font-bold">Admin</span>
        </Link>

        <Link
          href="/admin"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[#0f0f0f] transition-colors hover:bg-[#f2f2f2]"
        >
          Dashboard
        </Link>
        {entityKeys.map((key) => (
          <Link
            key={key}
            href={`/admin/${key}`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#0f0f0f] transition-colors hover:bg-[#f2f2f2]"
          >
            {entityConfigs[key].label}
          </Link>
        ))}

        <Link
          href="/"
          className="mt-auto rounded-lg px-3 py-2 text-sm font-medium text-[#606060] transition-colors hover:bg-[#f2f2f2]"
        >
          ← Back to site
        </Link>
      </aside>

      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
