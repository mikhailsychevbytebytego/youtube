import Image from "next/image";
import Link from "next/link";
import { BellDot, CircleX, Menu, Mic, Play, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Theme } from "@/lib/theme";

export function Header({ theme, query }: { theme: Theme; query?: string }) {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <button aria-label="Menu">
          <Menu className="size-6 text-foreground" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-[34px] items-center justify-center rounded-md bg-[#ff0000]">
            <Play className="size-3 fill-white text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">MeowTube</span>
        </Link>
      </div>

      <div className="flex w-[720px] items-center gap-3">
        <form
          action="/search"
          className="flex h-10 flex-1 items-center overflow-hidden rounded-full border border-border"
        >
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search cats..."
            className="h-full min-w-0 flex-1 px-4 text-base text-foreground outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-full w-16 shrink-0 items-center justify-center border-l border-border bg-surface"
          >
            <Search className="size-5 text-foreground" />
          </button>
        </form>
        <button
          aria-label="Search with voice"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface"
        >
          <Mic className="size-5 text-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-5">
        <ThemeToggle initialTheme={theme} />
        <button aria-label="Create">
          <CircleX className="size-6 text-foreground" />
        </button>
        <button aria-label="Notifications">
          <BellDot className="size-6 text-foreground" />
        </button>
        <div className="relative size-8 overflow-hidden rounded-full">
          <Image
            src="/images/avatar-user.png"
            alt="Your profile"
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
