import Image from "next/image";
import {
  Badge,
  ChevronDown,
  Clock3,
  History,
  House,
  ListMusic,
  PanelTop,
  PawPrint,
  Scissors,
  type LucideIcon,
} from "lucide-react";

import { subscriptions } from "@/lib/data";

type NavItem = { label: string; icon: LucideIcon; active?: boolean };

const navGroups: NavItem[][] = [
  [
    { label: "Home", icon: House, active: true },
    { label: "Cat Shorts", icon: Badge },
    { label: "Subscriptions", icon: PanelTop },
  ],
  [{ label: "Purrsonal", icon: PawPrint }],
  [
    { label: "History", icon: History },
    { label: "Watch later", icon: Clock3 },
    { label: "Liked videos", icon: PawPrint },
    { label: "Your clips", icon: Scissors },
    { label: "Meow Mix", icon: ListMusic },
  ],
];

const row = "flex w-full items-center gap-7 rounded-xl px-4 cursor-pointer";

function NavRow({ label, icon: Icon, active }: NavItem) {
  return (
    <a
      href="#"
      aria-current={active ? "page" : undefined}
      className={`${row} h-11 ${
        active
          ? "bg-brand-tint font-bold text-brand"
          : "text-ink-soft hover:bg-soft"
      }`}
    >
      <Icon className="size-6 shrink-0" />
      <span className="text-[17px]">{label}</span>
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-[87px] hidden h-[calc(100vh-87px)] w-[273px] shrink-0 overflow-y-auto border-r border-line p-4 lg:block">
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

      <h2 className="px-4 py-2 text-[16px] text-ink-soft">Subscriptions</h2>
      <ul>
        {subscriptions.map((channel) => (
          <li key={channel.id}>
            <a href="#" className={`${row} h-[46px] gap-4 hover:bg-soft`}>
              <Image
                src={channel.avatar}
                alt=""
                width={72}
                height={72}
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <span className="flex-1 truncate text-[15px] text-ink-soft">
                {channel.name}
              </span>
              {channel.hasNew && (
                <span className="size-2 shrink-0 rounded-full bg-brand">
                  <span className="sr-only">New videos</span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>

      <button type="button" className={`${row} h-11 text-ink-soft hover:bg-soft`}>
        <span className="flex size-6 shrink-0 items-center justify-center">
          <ChevronDown className="size-[18px]" />
        </span>
        <span className="text-[15px]">Show more</span>
      </button>
    </aside>
  );
}
