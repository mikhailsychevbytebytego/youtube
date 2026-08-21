"use client";

import { useState } from "react";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-20 bg-background">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      </div>

      <div className="flex flex-1 items-start">
        {sidebarOpen ? <Sidebar /> : null}
        {children}
      </div>
    </div>
  );
}
