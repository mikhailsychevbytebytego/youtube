import { Bell, ChevronDown, Menu, Mic, Plus, Search, Video } from "lucide-react";
import { Avatar } from "@/components/media-placeholder";
import { IconButton } from "@/components/icon-button";

function MeowTubeLogo() {
  return (
    <svg viewBox="0 0 36 28" className="h-6 w-9" role="img" aria-label="MeowTube">
      <path d="M6 8 L7 0 L15 8 Z" className="fill-brand" />
      <path d="M21 8 L29 0 L30 8 Z" className="fill-brand" />
      <rect x="0" y="6" width="36" height="22" rx="6" className="fill-brand" />
      <path d="M15 12 L15 22 L24 17 Z" fill="white" />
    </svg>
  );
}

function SearchBar() {
  return (
    <div className="border-line flex h-10 w-full items-center rounded-full border pr-1 pl-4">
      <input
        type="search"
        placeholder="Search"
        aria-label="Search"
        className="placeholder:text-muted h-full min-w-0 flex-1 bg-transparent text-base outline-none"
      />
      <IconButton label="Search" className="size-8">
        <Search className="size-5" />
      </IconButton>
    </div>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-background sticky top-0 z-50 flex h-14 items-center gap-2 px-4">
      <div className="flex shrink-0 items-center gap-3">
        <IconButton label="Toggle sidebar" onClick={onMenuClick}>
          <Menu className="size-6" />
        </IconButton>
        <a href="#" className="flex items-center gap-1.5">
          <MeowTubeLogo />
          <span className="text-xl font-bold tracking-tight">MeowTube</span>
        </a>
      </div>

      <div className="mx-auto flex max-w-2xl flex-1 items-center gap-3 px-6">
        <SearchBar />
        <IconButton label="Search with your voice" className="bg-subtle hover:bg-subtle-hover">
          <Mic className="size-5" />
        </IconButton>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton label="Create">
          <span className="relative">
            <Video className="size-6" />
            <Plus
              className="bg-background absolute -top-1 -right-1 size-3 rounded-full"
              strokeWidth={3}
            />
          </span>
        </IconButton>
        <IconButton label="Notifications" badge={3}>
          <Bell className="size-6" />
        </IconButton>
        <button type="button" className="ml-1 flex items-center gap-1" aria-label="Account">
          <Avatar seed="viewer" emoji="🐱" className="size-8" />
          <ChevronDown className="text-muted size-4" />
        </button>
      </div>
    </header>
  );
}
