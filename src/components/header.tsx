import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Mic, Search, Video } from "lucide-react";

import { MeowTubeMark } from "@/components/meowtube-mark";

const iconButton =
  "flex shrink-0 cursor-pointer items-center justify-center text-ink-soft transition-colors hover:text-ink";

export function Header() {
  return (
    <header className="flex h-[87px] shrink-0 items-center gap-4 bg-background px-4 lg:gap-7 lg:pl-8 lg:pr-12">
      <button type="button" aria-label="Open menu" className={iconButton}>
        <Menu className="size-6" strokeWidth={2.25} />
      </button>

      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <MeowTubeMark />
        <span className="text-2xl font-extrabold leading-none tracking-[-1px] text-ink sm:text-[34px]">
          MeowTube
        </span>
      </Link>

      <div className="hidden min-w-0 flex-1 justify-center md:flex lg:px-6">
        <form
          role="search"
          className="flex h-[47px] w-full max-w-[798px] items-center gap-3 rounded-full border border-[#d3d3d3] pl-5 pr-6"
        >
          <label htmlFor="search" className="sr-only">
            Search MeowTube
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-[18px] text-ink outline-none placeholder:text-[#8b8b8b]"
          />
          <button type="submit" aria-label="Search" className={iconButton}>
            <Search className="size-[25px]" />
          </button>
        </form>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-5 lg:gap-10 2xl:gap-14">
        <button
          type="button"
          aria-label="Search"
          className={`${iconButton} md:hidden`}
        >
          <Search className="size-[25px]" />
        </button>

        <button
          type="button"
          aria-label="Search with your voice"
          className="hidden size-[45px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-soft text-ink transition-colors hover:bg-line sm:flex"
        >
          <Mic className="size-[22px]" />
        </button>

        <button
          type="button"
          aria-label="Create"
          className={`${iconButton} hidden sm:flex`}
        >
          <Video className="size-[25px]" />
        </button>

        <button type="button" className={`${iconButton} relative`}>
          <Bell className="size-[25px]" />
          <span className="absolute -right-2.5 -top-2 flex size-5 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
            3
          </span>
          <span className="sr-only">3 new notifications</span>
        </button>

        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-4"
        >
          <Image
            src="/images/avatars/you.jpg"
            alt=""
            width={106}
            height={106}
            className="size-10 rounded-full object-cover sm:size-[53px]"
          />
          <ChevronDown className="hidden size-[18px] text-ink-soft sm:block" />
          <span className="sr-only">Your account</span>
        </button>
      </div>
    </header>
  );
}
