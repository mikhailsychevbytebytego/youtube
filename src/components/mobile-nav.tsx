"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Library, Zap, type LucideIcon } from "lucide-react";

const items: {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}[] = [
  { href: "/", label: "Home", icon: House, match: (p) => p === "/" },
  {
    href: "/shorts",
    label: "Shorts",
    icon: Zap,
    match: (p) => p.startsWith("/shorts"),
  },
  {
    href: "/channel",
    label: "You",
    icon: Library,
    match: (p) => p.startsWith("/channel"),
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-14 items-stretch border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5"
          >
            <Icon
              className={`size-6 ${active ? "text-foreground" : "text-muted"}`}
            />
            <span
              className={`text-[10px] ${
                active ? "font-semibold text-foreground" : "text-muted"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
