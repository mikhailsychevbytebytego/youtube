"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { BellDot, Cat, CircleX, Menu, Mic, Search } from "lucide-react";

import { UserMenu } from "@/components/auth/UserMenu";

interface NavbarProps {
  searchQuery?: string;
}

export function Navbar({ searchQuery }: NavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery ?? "");

  // Sync state if searchQuery prop changes (e.g. back/forward navigation or URL change)
  useEffect(() => {
    setQuery(searchQuery ?? "");
  }, [searchQuery]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#f2f2f2] bg-white px-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-6 items-center justify-center text-[#0f0f0f]"
        >
          <Menu className="size-6" />
        </button>
        <Link href="/" className="flex items-center gap-1">
          <span className="flex items-start rounded-lg bg-red-600 p-1">
            <Cat className="size-5 text-white" />
          </span>
          <span className="text-xl font-bold text-black">MeowTube</span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex w-full max-w-[600px] items-center gap-2">
        <div className="flex h-10 flex-1 items-center rounded-l-full border border-[#e5e5e5] pl-4 pr-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cats..."
            className="w-full bg-transparent text-base text-[#0f0f0f] outline-none placeholder:text-[#606060]"
          />
        </div>
        <button
          type="submit"
          aria-label="Search"
          className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-[#e5e5e5] bg-[#f8f8f8] text-[#0f0f0f] transition-colors hover:bg-[#f0f0f0]"
        >
          <Search className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Search with your voice"
          className="flex size-10 items-center justify-center rounded-full bg-[#f8f8f8] text-[#0f0f0f] transition-colors hover:bg-[#f0f0f0]"
        >
          <Mic className="size-5" />
        </button>
      </form>

      <div className="flex items-center gap-5">
        <button type="button" aria-label="Close" className="flex size-6 items-center justify-center text-[#0f0f0f]">
          <CircleX className="size-6" />
        </button>
        <button type="button" aria-label="Notifications" className="flex size-6 items-center justify-center text-[#0f0f0f]">
          <BellDot className="size-6" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
