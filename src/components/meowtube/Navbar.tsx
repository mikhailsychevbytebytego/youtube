"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { Cat, Menu, Search } from "lucide-react";

import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  searchQuery?: string;
}

export function Navbar({ searchQuery }: NavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery ?? "");
  const [scrollOpacity, setScrollOpacity] = useState(0);

  // Sync state if searchQuery prop changes (e.g. back/forward navigation or URL change)
  useEffect(() => {
    setQuery(searchQuery ?? "");
  }, [searchQuery]);

  // Handle scroll opacity
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fade in over the first 30px of scroll
      const opacity = Math.min(1, scrollY / 30);
      setScrollOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-background px-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-6 items-center justify-center text-foreground"
          >
            <Menu className="size-6" />
          </button>
          <Link href="/" className="flex items-center gap-1 pr-4">
            <span className="flex items-start rounded-lg bg-red-600 p-1">
              <Cat className="size-5 text-white" />
            </span>
            <span className="text-xl font-bold text-foreground">MeowTube</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-[600px] items-center gap-4">
          <div className="flex flex-1 items-center">
            <div className="flex h-10 flex-1 items-center rounded-l-full border border-border pl-4 pr-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cats..."
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-border bg-muted text-foreground transition-colors hover:bg-hover"
            >
              <Search className="size-5" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      {/* Scroll gradient shadow that appears under the header */}
      <div
        className="fixed top-14 left-0 right-0 z-40 h-4 bg-gradient-to-b from-black/10 dark:from-black/40 to-transparent pointer-events-none transition-opacity duration-75"
        style={{ opacity: scrollOpacity }}
      />
    </>
  );
}
