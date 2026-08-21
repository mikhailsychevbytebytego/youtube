import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Mic, Search, Video } from "lucide-react";

import { MewTubeMark } from "@/components/mewtube-mark";

const iconButton =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-soft hover:text-ink";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 bg-background px-3 sm:h-16 sm:px-4 lg:px-6">
      <button
        type="button"
        aria-label="Toggle menu"
        className={iconButton}
        onClick={onMenuClick}
      >
        <Menu className="size-6" strokeWidth={2} />
      </button>

      <Link href="/" className="flex shrink-0 items-center gap-2">
        <MewTubeMark />
        <span className="text-xl font-semibold tracking-tight text-ink">
          MewTube
        </span>
      </Link>

      <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
        <form
          role="search"
          className="flex h-10 w-full max-w-[640px] items-center"
        >
          <label htmlFor="search" className="sr-only">
            Search MewTube
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search cats..."
            className="h-full min-w-0 flex-1 rounded-l-full border border-line bg-background px-4 text-base text-ink outline-none placeholder:text-muted focus:border-muted"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-full w-16 items-center justify-center rounded-r-full border border-l-0 border-line bg-soft text-ink-soft hover:bg-line"
          >
            <Search className="size-5" />
          </button>
        </form>
        <button
          type="button"
          aria-label="Search with your voice"
          className={`${iconButton} ml-2 bg-soft`}
        >
          <Mic className="size-5" />
        </button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          aria-label="Search"
          className={`${iconButton} md:hidden`}
        >
          <Search className="size-5" />
        </button>

        <button
          type="button"
          aria-label="Create"
          className={`${iconButton} hidden sm:flex`}
        >
          <Video className="size-6" />
        </button>

        <button type="button" className={`${iconButton} relative`}>
          <Bell className="size-6" />
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            3
          </span>
          <span className="sr-only">3 new notifications</span>
        </button>

        <button type="button" className="ml-1 cursor-pointer">
          <Image
            src="/images/avatars/you.jpg"
            alt="Your account"
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
