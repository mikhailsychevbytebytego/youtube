import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
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

const mainNav: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Home", icon: House, active: true },
  { label: "PawFeed", icon: PawPrint },
  { label: "Subscriptions", icon: Subscript },
];

const libraryNav: { label: string; icon: LucideIcon }[] = [
  { label: "Library", icon: Library },
  { label: "History", icon: History },
  { label: "Your videos", icon: SquarePlay },
  { label: "Watch later", icon: Clock },
  { label: "Liked videos", icon: ThumbsUp },
];

function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <Link
      href={label === "Home" ? "/" : "#"}
      className={`flex w-full items-center gap-6 rounded-[10px] px-3 py-2.5 ${
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
      <div className="w-full border-t border-border" />
      {libraryNav.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <div className="w-full border-t border-border" />
      <div className="flex w-full flex-col gap-2 pt-3 pl-3">
        <h3 className="text-sm font-semibold text-foreground">Subscriptions</h3>
        {subscriptions.map((sub) => (
          <Link
            key={sub.id}
            href="/channel"
            className="flex w-full items-center gap-4"
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
            {sub.hasNew && (
              <span className="size-1 shrink-0 rounded-full bg-[#ff0000]" />
            )}
          </Link>
        ))}
        <button className="flex w-full items-center gap-4">
          <ChevronDown className="size-6 shrink-0 text-foreground" />
          <span className="text-sm text-foreground">Show 12 more</span>
        </button>
      </div>
    </aside>
  );
}
