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
import { watchSubscriptions } from "@/lib/watch-data";

const mainNav: {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}[] = [
  { label: "Home", icon: House, href: "/", active: true },
  { label: "PawFeed", icon: PawPrint, href: "#" },
  { label: "Subscriptions", icon: Subscript, href: "#" },
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
      className={`flex w-full items-center gap-6 rounded-[10px] px-3 py-2.5 ${
        active ? "bg-[#f2f2f2]" : ""
      }`}
    >
      <Icon
        className={`size-6 shrink-0 ${active ? "text-[#ff0000]" : "text-[#0f0f0f]"}`}
      />
      <span
        className={`text-sm ${
          active ? "font-semibold text-[#ff0000]" : "font-normal text-[#0f0f0f]"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function WatchSidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 px-3 pt-3">
      {mainNav.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <div className="w-full border-t border-[#e5e5e5]" />
      {libraryNav.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
      <div className="w-full border-t border-[#e5e5e5]" />
      <div className="flex w-full flex-col gap-2 pt-3 pl-3">
        <h3 className="text-sm font-semibold text-black">Subscriptions</h3>
        {watchSubscriptions.map((sub) => (
          <Link
            key={sub.id}
            href="/channel"
            className="flex w-full items-center gap-4"
          >
            <div className="relative size-6 shrink-0 overflow-hidden rounded-full">
              <Image
                src={sub.avatar}
                alt={sub.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="flex-1 truncate text-sm text-[#0f0f0f]">
              {sub.name}
            </span>
            {sub.hasNew && (
              <span className="size-1 shrink-0 rounded-full bg-[#ff0000]" />
            )}
          </Link>
        ))}
        <button className="flex w-full items-center gap-4">
          <ChevronDown className="size-6 shrink-0 text-black" />
          <span className="text-sm text-black">Show 12 more</span>
        </button>
      </div>
    </aside>
  );
}
