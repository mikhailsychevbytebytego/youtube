import Image from "next/image";
import {
  Cat,
  ChevronDown,
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
import { channelSubscriptions } from "@/lib/channel-data";

const mainNav: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Home", icon: House, active: true },
  { label: "PawFeed", icon: PawPrint },
  { label: "Subscriptions", icon: Users },
];

const libraryNav: { label: string; icon: LucideIcon }[] = [
  { label: "Library", icon: Library },
  { label: "History", icon: History },
  { label: "Your videos", icon: Video },
  { label: "Watch later", icon: Clock },
  { label: "Liked videos", icon: ThumbsUp },
];

const exploreNav: { label: string; icon: LucideIcon }[] = [
  { label: "Trending", icon: FireExtinguisher },
  { label: "Music", icon: Music },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Meow & Chill", icon: Cat },
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
      <Icon
        className={`size-6 shrink-0 ${active ? "text-[#ff0000]" : "text-[#0f0f0f]"}`}
      />
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

export function ChannelSidebar() {
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
      <div className="flex w-full flex-col gap-2">
        <h3 className="px-3 text-xs font-bold text-[#0f0f0f]">Subscriptions</h3>
        {channelSubscriptions.map((sub) => (
          <a
            key={sub.id}
            href="#"
            className="flex w-full items-center gap-4 rounded-[10px] px-3 py-2"
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
          </a>
        ))}
        <button className="flex items-center gap-3 pl-3">
          <ChevronDown className="size-5 text-black" />
          <span className="text-sm text-black">Show 8 more</span>
        </button>
      </div>
      <div className="w-full border-t border-[#e5e5e5]" />
      <div className="flex w-full flex-col gap-2">
        <h3 className="px-3 text-xs font-bold text-[#0f0f0f]">Explore</h3>
        <nav className="flex w-full flex-col gap-1">
          {exploreNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
