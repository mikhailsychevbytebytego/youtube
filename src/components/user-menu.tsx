"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Shield,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { setTheme as persistTheme } from "@/lib/theme-actions";
import type { Theme } from "@/lib/theme";

type MenuView = "main" | "appearance";

const appearanceOptions = [
  { value: "light" as const, label: "Light theme", icon: Sun },
  { value: "dark" as const, label: "Dark theme", icon: Moon },
];

export function UserMenu({ initialTheme = "light" }: { initialTheme?: Theme }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MenuView>("main");
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

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

  const user = session?.user;
  const isAdmin = Boolean((user as { isAdmin?: boolean } | undefined)?.isAdmin);

  const handleSignOut = async () => {
    await authClient.signOut();
    setOpen(false);
    window.location.reload();
  };

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
        className="relative flex size-8 overflow-hidden rounded-full border border-border/80 focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
      >
        <Image
          src={user?.image || "/images/avatar-user.png"}
          alt={user?.name || "User menu"}
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
              {user ? (
                <div className="flex items-start gap-4 px-4 py-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={user.image || "/images/avatar-user.png"}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-muted">{user.email}</p>
                    {isAdmin && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#ff0000]">
                        <Shield className="size-3" />
                        Admin Account
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Welcome to MewTube!
                  </p>
                  <p className="text-xs text-muted">
                    Sign in to manage subscriptions, save favorite cat videos, and access admin features.
                  </p>
                  <Link
                    href="/signin"
                    onClick={() => setOpen(false)}
                    className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#ff0000] px-4 py-2 text-xs font-bold text-white hover:bg-[#e60000] transition-colors"
                  >
                    <UserIcon className="size-4" />
                    <span>Sign in / Sign up</span>
                  </Link>
                </div>
              )}

              <div className="my-2 border-t border-menu-border" />

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-4 px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface"
                >
                  <Shield className="size-5 shrink-0 text-[#ff0000]" />
                  <span className="flex-1 font-medium">Admin Dashboard</span>
                </Link>
              )}

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

              {user && (
                <>
                  <div className="my-2 border-t border-menu-border" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-4 px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface"
                  >
                    <LogOut className="size-5 shrink-0 text-foreground" />
                    <span>Sign out</span>
                  </button>
                </>
              )}
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
                    onClick={() => {
                      setThemeState(value);
                      document.documentElement.classList.toggle(
                        "dark",
                        value === "dark",
                      );
                      startTransition(() => {
                        persistTheme(value);
                      });
                      setOpen(false);
                      setView("main");
                    }}
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
