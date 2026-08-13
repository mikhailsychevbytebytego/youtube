"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-dvh">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} />
        <main className="min-w-0 flex-1 px-4 pb-12 md:px-6">{children}</main>
      </div>
    </div>
  );
}
