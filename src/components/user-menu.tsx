"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { setTheme } from "@/lib/theme-actions";
import type { Theme } from "@/lib/theme";

const profile = {
  name: "Mew Viewer",
  email: "viewer@mewtube.local",
  avatar: "/images/avatar-user.png",
};

type MenuView = "main" | "appearance";

const appearanceOptions = [
  { value: "light" as const, label: "Light theme", icon: Sun },
  { value: "dark" as const, label: "Dark theme", icon: Moon },
];

export function UserMenu({ initialTheme }: { initialTheme: Theme }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MenuView>("main");
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setView("main");
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setView("main");
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Theme) {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    startTransition(() => {
      setTheme(next);
    });
    setOpen(false);
    setView("main");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((prev) => !prev);
          setView("main");
        }}
        className="relative size-8 overflow-hidden rounded-full"
      >
        <Image
          src={profile.avatar}
          alt="Your profile"
          fill
          sizes="32px"
          className="object-cover"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-10 right-0 z-50 w-[300px] overflow-hidden rounded-xl border border-menu-border bg-menu py-2 shadow-[0_4px_32px_rgba(0,0,0,0.2)]"
        >
          {view === "main" ? (
            <>
              <div className="flex items-start gap-4 px-4 py-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={profile.avatar}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-foreground">
                    {profile.name}
                  </p>
                  <p className="truncate text-sm text-muted">{profile.email}</p>
                  <a
                    href="/channel"
                    className="mt-1 inline-block text-sm font-medium text-link hover:underline"
                  >
                    Create a channel
                  </a>
                </div>
              </div>

              <div className="my-2 border-t border-menu-border" />

              <button
                type="button"
                role="menuitem"
                onClick={() => setView("appearance")}
                className="flex w-full items-center gap-4 px-4 py-2.5 text-left hover:bg-surface"
              >
                <Moon className="size-5 shrink-0 text-foreground" />
                <span className="flex-1 text-sm text-foreground">
                  Appearance: {theme === "dark" ? "Dark" : "Light"}
                </span>
                <ChevronRight className="size-5 shrink-0 text-foreground" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-2 py-1">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={() => setView("main")}
                  className="flex size-10 items-center justify-center rounded-full hover:bg-surface"
                >
                  <ChevronLeft className="size-5 text-foreground" />
                </button>
                <h2 className="text-base font-medium text-foreground">
                  Appearance
                </h2>
              </div>

              <div className="my-1 border-t border-menu-border" />

              <p className="px-4 py-2 text-xs text-muted">
                Setting applies to this browser only
              </p>

              {appearanceOptions.map(({ value, label, icon: Icon }) => {
                const selected = theme === value;

                return (
                  <button
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => choose(value)}
                    className="flex w-full items-center gap-4 px-4 py-2.5 text-left hover:bg-surface"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      {selected ? (
                        <Check className="size-5 text-foreground" />
                      ) : null}
                    </span>
                    <Icon className="size-5 shrink-0 text-foreground" />
                    <span className="flex-1 text-sm text-foreground">
                      {label}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
