"use client";

import { useState, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { setTheme } from "@/lib/theme-actions";
import type { Theme } from "@/lib/theme";

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [, startTransition] = useTransition();

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    // Flip the class straight away so the change is instant; the cookie is
    // what makes it survive the next page load.
    document.documentElement.classList.toggle("dark", next === "dark");
    startTransition(() => {
      setTheme(next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="flex size-11 items-center justify-center rounded-full hover:bg-surface md:size-8"
    >
      {theme === "dark" ? (
        <Sun className="size-6 text-foreground" />
      ) : (
        <Moon className="size-6 text-foreground" />
      )}
    </button>
  );
}
