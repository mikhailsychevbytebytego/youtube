import Link from "next/link";
import {
  Clock,
  History,
  House,
  Library,
  PawPrint,
  SquarePlay,
  Subscript,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import type { SidebarChannel } from "@/lib/queries";
import { SidebarSubscriptions } from "@/components/sidebar-subscriptions";

const mainNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Home", icon: House, href: "/" },
  { label: "PawFeed", icon: PawPrint, href: "/search?q=cats" },
  { label: "Subscriptions", icon: Subscript, href: "/subscriptions" },
];

const libraryNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Library", icon: Library, href: "#" },
  { label: "History", icon: History, href: "#" },
  { label: "Your videos", icon: SquarePlay, href: "#" },
  { label: "Watch later", icon: Clock, href: "#" },
  { label: "Liked videos", icon: ThumbsUp, href: "#" },
];

function NavItem({
  label,
  icon: Icon,
  href,
  active,
}: {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-6 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-surface ${
        active ? "bg-surface" : ""
      }`}
    >
      <Icon
        className={`size-6 shrink-0 ${active ? "text-[#ff0000]" : "text-foreground"}`}
      />
      <span
        className={`text-sm ${
          active ? "font-semibold text-[#ff0000]" : "font-normal text-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function WatchSidebar({
  subscriptions,
}: {
  subscriptions: SidebarChannel[];
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 px-3 pt-3">
      {mainNav.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <div className="w-full border-t border-border my-2" />
      {libraryNav.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <div className="w-full border-t border-border my-2" />
      <SidebarSubscriptions initialChannels={subscriptions} />
    </aside>
  );
}
