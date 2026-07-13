import type { Metadata } from "next";
import Link from "next/link";
import { Cat } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin - MewTube",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-14 items-center gap-2 border-b border-[#e5e5e5] px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff0000]">
            <Cat className="size-5 text-white" />
          </span>
          <span className="text-lg font-bold text-[#0f0f0f]">
            MewTube <span className="font-normal text-[#606060]">Admin</span>
          </span>
        </Link>
      </header>
      <div className="flex flex-1 items-start">
        <aside className="flex w-56 shrink-0 flex-col px-3 pt-3">
          <AdminNav />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
