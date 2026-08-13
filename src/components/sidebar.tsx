import {
  ChevronDown,
  ChevronRight,
  Clock,
  Clock4,
  House,
  ListVideo,
  MonitorPlay,
  Scissors,
  SquarePlay,
  ThumbsUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/media-placeholder";
import { subscribedChannels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  /** Trailing decoration, e.g. the paw beside "Meow Mix". */
  suffix?: string;
};

const primaryNav: NavItem[] = [
  { label: "Home", icon: House, active: true },
  { label: "Cat Shorts", icon: SquarePlay },
  { label: "Subscriptions", icon: MonitorPlay },
];

const personalNav: NavItem[] = [
  { label: "History", icon: Clock },
  { label: "Watch later", icon: Clock4 },
  { label: "Liked videos", icon: ThumbsUp },
  { label: "Your clips", icon: Scissors },
  { label: "Meow Mix", icon: ListVideo, suffix: "🐾" },
];

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <a
      href="#"
      className={cn(
        "flex h-10 items-center gap-5 rounded-lg px-3 text-sm transition-colors",
        item.active
          ? "bg-brand-soft text-brand font-medium"
          : "hover:bg-subtle text-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.suffix ? <span aria-hidden>{item.suffix}</span> : null}
    </a>
  );
}

export function Sidebar({ open }: { open: boolean }) {
  return (
    <aside
      // Collapsing to zero width keeps the row in flow so the grid simply reflows.
      className={cn(
        "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 overflow-x-hidden overflow-y-auto pb-6 transition-[width] duration-200 md:block",
        open ? "w-60" : "w-0",
      )}
      aria-hidden={!open}
    >
      <nav className="w-60 px-3">
        <ul>
          {primaryNav.map((item) => (
            <li key={item.label}>
              <NavRow item={item} />
            </li>
          ))}
        </ul>

        <hr className="border-line my-3" />

        <a
          href="#"
          className="hover:bg-subtle flex h-10 items-center gap-5 rounded-lg px-3 text-base font-medium transition-colors"
        >
          <UserRound className="size-5 shrink-0" />
          <span className="truncate">Purrsonal</span>
          <ChevronRight className="text-muted ml-auto size-4" />
        </a>
        <ul>
          {personalNav.map((item) => (
            <li key={item.label}>
              <NavRow item={item} />
            </li>
          ))}
        </ul>

        <hr className="border-line my-3" />

        <h2 className="px-3 py-2 text-base font-medium">Subscriptions</h2>
        <ul>
          {subscribedChannels.map((channel) => (
            <li key={channel.id}>
              <a
                href="#"
                className="hover:bg-subtle flex h-10 items-center gap-5 rounded-lg px-3 text-sm transition-colors"
              >
                <Avatar
                  seed={channel.id}
                  emoji={channel.emoji}
                  className="size-6"
                  emojiClassName="text-xs"
                />
                <span className="truncate">{channel.name}</span>
                {channel.streaming ? (
                  <span
                    className="bg-brand ml-auto size-1.5 shrink-0 rounded-full"
                    title="Streaming now"
                  />
                ) : null}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#"
              className="hover:bg-subtle flex h-10 items-center gap-5 rounded-lg px-3 text-sm transition-colors"
            >
              <ChevronDown className="size-5 shrink-0" />
              <span className="truncate">Show more</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
