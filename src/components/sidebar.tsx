import Image from "next/image";
import {
  ClockPlus,
  Compass,
  FolderHeart,
  History,
  House,
  Library,
  ThumbsUp,
  Tv2,
  type LucideIcon,
} from "lucide-react";
import { subscriptions } from "@/lib/data";

const mainNav: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Home", icon: House, active: true },
  { label: "Explore", icon: Compass },
  { label: "Cat Shows", icon: Tv2 },
  { label: "Subscriptions", icon: FolderHeart },
];

const libraryNav: { label: string; icon: LucideIcon }[] = [
  { label: "Library", icon: Library },
  { label: "History", icon: History },
  { label: "Watch Later", icon: ClockPlus },
  { label: "Liked Videos", icon: ThumbsUp },
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
    <a
      href="#"
      className={`flex w-full items-center gap-5 rounded-[10px] px-3 py-2.5 ${
        active ? "bg-[#f2f2f2]" : ""
      }`}
    >
      <Icon className="size-6 shrink-0 text-[#0f0f0f]" />
      <span
        className={`flex-1 text-sm text-[#0f0f0f] ${
          active ? "font-semibold" : "font-normal"
        }`}
      >
        {label}
      </span>
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-3 px-3 pt-3">
      <nav className="flex w-full flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
      <div className="w-full border-t border-[#e5e5e5]" />
      <nav className="flex w-full flex-col gap-1">
        {libraryNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
      <div className="w-full border-t border-[#e5e5e5]" />
      <div className="flex w-full flex-col gap-2 pt-3">
        <h3 className="text-sm font-semibold text-[#0f0f0f]">Subscriptions</h3>
        {subscriptions.map((sub) => (
          <a
            key={sub.id}
            href="#"
            className="flex w-full items-center gap-4 px-3 py-2"
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
            {sub.isLive && (
              <span className="size-1 shrink-0 rounded-full bg-[#3ea6ff]" />
            )}
          </a>
        ))}
      </div>
    </aside>
  );
}
