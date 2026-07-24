import Link from "next/link";
import {
  Cat,
  Clock,
  FireExtinguisher,
  Gamepad2,
  History,
  House,
  Library,
  Music,
  PawPrint,
  ThumbsUp,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { SidebarChannel } from "@/lib/queries";
import { SidebarSubscriptions } from "@/components/sidebar-subscriptions";

const mainNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Home", icon: House, href: "/" },
  { label: "PawFeed", icon: PawPrint, href: "/search?q=cats" },
  { label: "Subscriptions", icon: Users, href: "/subscriptions" },
];

const libraryNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Library", icon: Library, href: "#" },
  { label: "History", icon: History, href: "#" },
  { label: "Your videos", icon: Video, href: "#" },
  { label: "Watch later", icon: Clock, href: "#" },
  { label: "Liked videos", icon: ThumbsUp, href: "#" },
];

const exploreNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Trending", icon: FireExtinguisher, href: "/search?q=trending" },
  { label: "Music", icon: Music, href: "/search?q=music" },
  { label: "Gaming", icon: Gamepad2, href: "/search?q=gaming" },
  { label: "Meow & Chill", icon: Cat, href: "/search?q=chill" },
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
      className={`flex w-full items-center gap-5 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-surface ${
        active ? "bg-surface" : ""
      }`}
    >
      <Icon
        className={`size-6 shrink-0 ${active ? "text-[#ff0000]" : "text-foreground"}`}
      />
      <span
        className={`flex-1 text-sm text-foreground ${
          active ? "font-semibold" : "font-normal"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function ChannelSidebar({
  subscriptions,
}: {
  subscriptions: SidebarChannel[];
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-3 px-3 pt-3 md:flex">
      <nav className="flex w-full flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
      <div className="w-full border-t border-border" />
      <nav className="flex w-full flex-col gap-1">
        {libraryNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
      <div className="w-full border-t border-border" />
      <SidebarSubscriptions initialChannels={subscriptions} />
      <div className="w-full border-t border-border" />
      <div className="flex w-full flex-col gap-2">
        <h3 className="px-3 text-xs font-bold text-foreground">Explore</h3>
        <nav className="flex w-full flex-col gap-1">
          {exploreNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
