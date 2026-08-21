import Image from "next/image";
import {
  ChevronDown,
  Clock3,
  Clapperboard,
  History,
  House,
  Library,
  ListMusic,
  PawPrint,
  Scissors,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { subscriptions } from "@/lib/data";

type NavItem = { label: string; icon: LucideIcon; active?: boolean };

const navGroups: NavItem[][] = [
  [
    { label: "Home", icon: House, active: true },
    { label: "Cat Shorts", icon: Clapperboard },
    { label: "Subscriptions", icon: Users },
  ],
  [
    { label: "Library", icon: Library },
    { label: "History", icon: History },
    { label: "Watch later", icon: Clock3 },
    { label: "Liked videos", icon: ThumbsUp },
    { label: "Your clips", icon: Scissors },
    { label: "Meow Mix", icon: ListMusic },
  ],
];

const row =
  "flex w-full items-center gap-6 rounded-xl px-3 py-2.5 cursor-pointer";

function NavRow({ label, icon: Icon, active }: NavItem) {
  return (
    <a
      href="#"
      aria-current={active ? "page" : undefined}
      className={`${row} ${
        active
          ? "bg-brand-tint font-medium text-brand"
          : "text-ink-soft hover:bg-soft"
      }`}
    >
      <Icon className="size-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
      <span className="text-sm">{label}</span>
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto px-3 py-3 sm:top-16 sm:h-[calc(100vh-4rem)] lg:block">
      <nav aria-label="Main">
        {navGroups.map((group, index) => (
          <div key={index}>
            {index > 0 && <hr className="my-3 border-line" />}
            {group.map((item) => (
              <NavRow key={item.label} {...item} />
            ))}
          </div>
        ))}
      </nav>

      <hr className="my-3 border-line" />

      <h2 className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink">
        <PawPrint className="size-4" />
        Subscriptions
      </h2>
      <ul>
        {subscriptions.map((channel) => (
          <li key={channel.id}>
            <a href="#" className={`${row} gap-3 hover:bg-soft`}>
              <Image
                src={channel.avatar}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full object-cover"
              />
              <span className="flex-1 truncate text-sm text-ink-soft">
                {channel.name}
              </span>
              {channel.hasNew && (
                <span className="size-1.5 shrink-0 rounded-full bg-brand">
                  <span className="sr-only">New videos</span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>

      <button type="button" className={`${row} text-ink-soft hover:bg-soft`}>
        <span className="flex size-5 shrink-0 items-center justify-center">
          <ChevronDown className="size-4" />
        </span>
        <span className="text-sm">Show more</span>
      </button>
    </aside>
  );
}
