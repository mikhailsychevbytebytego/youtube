import Image from "next/image";
import { Bell, Menu, Mic, Play, Plus, Search } from "lucide-react";

export function WatchHeader() {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <button
          aria-label="Menu"
          className="flex size-10 items-center justify-center"
        >
          <Menu className="size-6 text-[#0f0f0f]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-[34px] items-center justify-center rounded-md bg-[#ff0000]">
            <Play className="size-3 fill-white text-white" />
          </div>
          <span className="text-xl font-bold text-[#0f0f0f]">MeowTube</span>
        </div>
      </div>

      <div className="flex w-[720px] items-center gap-3">
        <div className="flex h-10 flex-1 items-center overflow-hidden rounded-full border border-[#e5e5e5]">
          <input
            type="text"
            placeholder="Search cats..."
            className="h-full min-w-0 flex-1 pl-4 text-base text-[#0f0f0f] outline-none placeholder:text-[#606060]"
          />
          <button
            aria-label="Search"
            className="flex h-full w-16 shrink-0 items-center justify-center border-l border-[#e5e5e5] bg-[#f2f2f2]"
          >
            <Search className="size-5 text-[#0f0f0f]" />
          </button>
        </div>
        <button
          aria-label="Search with voice"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <Mic className="size-5 fill-[#0f0f0f] text-[#0f0f0f]" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-full border border-[#e5e5e5] px-3 py-2">
          <Plus className="size-5 text-black" />
          <span className="text-sm font-semibold text-black">Create</span>
        </button>
        <button
          aria-label="Notifications"
          className="flex size-10 items-center justify-center"
        >
          <span className="relative">
            <Bell className="size-6 text-[#0f0f0f]" />
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#ff0000] text-[10px] font-bold text-white">
              3
            </span>
          </span>
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
