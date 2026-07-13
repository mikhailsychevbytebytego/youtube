import Image from "next/image";
import Link from "next/link";
import {
  ClockPlus,
  Compass,
  FolderHeart,
  History,
  House,
  Library,
  ThumbsUp,
  Tv2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SidebarChannel } from "@/lib/queries";

const mainNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Home", icon: House, href: "/" },
  { label: "Shorts", icon: Zap, href: "/shorts" },
  { label: "Explore", icon: Compass, href: "#" },
  { label: "Cat Shows", icon: Tv2, href: "#" },
  { label: "Subscriptions", icon: FolderHeart, href: "#" },
];

const libraryNav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Library", icon: Library, href: "#" },
  { label: "History", icon: History, href: "#" },
  { label: "Watch Later", icon: ClockPlus, href: "#" },
  { label: "Liked Videos", icon: ThumbsUp, href: "#" },
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
      className={`flex w-full items-center gap-5 rounded-[10px] px-3 py-2.5 ${
        active ? "bg-surface" : ""
      }`}
    >
      <Icon className="size-6 shrink-0 text-foreground" />
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

export function Sidebar({
  subscriptions,
  activeItem = "Home",
}: {
  subscriptions: SidebarChannel[];
  activeItem?: string;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-3 overflow-y-auto px-3 pt-3">
      <nav className="flex w-full flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            active={item.label === activeItem}
          />
        ))}
      </nav>
      <div className="w-full border-t border-border" />
      <nav className="flex w-full flex-col gap-1">
        {libraryNav.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            active={item.label === activeItem}
          />
        ))}
      </nav>
      <div className="w-full border-t border-border" />
      <div className="flex w-full flex-col gap-2 pt-3">
        <h3 className="text-sm font-semibold text-foreground">Subscriptions</h3>
        {subscriptions.map((sub) => (
          <Link
            key={sub.id}
            href="/channel"
            className="flex w-full items-center gap-4 px-3 py-2"
          >
            <div className="relative size-6 shrink-0 overflow-hidden rounded-full">
              <Image
                src={sub.avatarUrl ?? "/images/avatar-user.png"}
                alt={sub.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="flex-1 truncate text-sm text-foreground">
              {sub.name}
            </span>
            {sub.isLive && (
              <span className="size-1 shrink-0 rounded-full bg-[#3ea6ff]" />
            )}
          </Link>
        ))}
      </div>
    </aside>
  );
}
