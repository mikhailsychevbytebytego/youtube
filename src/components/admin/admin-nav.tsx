"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  SquarePlay,
  Tv2,
  Users,
  type LucideIcon,
} from "lucide-react";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Channels", href: "/admin/channels", icon: Tv2 },
  { label: "Videos", href: "/admin/videos", icon: SquarePlay },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-1">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex w-full items-center gap-4 rounded-[10px] px-3 py-2.5 ${
              active ? "bg-[#f2f2f2]" : "hover:bg-[#f8f8f8]"
            }`}
          >
            <Icon className="size-5 shrink-0 text-[#0f0f0f]" />
            <span
              className={`flex-1 text-sm text-[#0f0f0f] ${
                active ? "font-semibold" : "font-normal"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
      <div className="my-2 w-full border-t border-[#e5e5e5]" />
      <Link
        href="/"
        className="flex w-full items-center gap-4 rounded-[10px] px-3 py-2.5 hover:bg-[#f8f8f8]"
      >
        <ExternalLink className="size-5 shrink-0 text-[#0f0f0f]" />
        <span className="flex-1 text-sm text-[#0f0f0f]">View site</span>
      </Link>
    </nav>
  );
}
