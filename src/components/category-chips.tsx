"use client";

import { useState } from "react";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryChips({ categories }: { categories: string[] }) {
  const [selected, setSelected] = useState(categories[0]);

  return (
    <div className="bg-background no-scrollbar sticky top-14 z-30 flex items-center gap-3 overflow-x-auto py-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => setSelected(category)}
          aria-pressed={category === selected}
          className={cn(
            "h-8 shrink-0 rounded-full px-3 text-sm font-medium transition-colors",
            category === selected
              ? "bg-brand text-white"
              : "bg-subtle hover:bg-subtle-hover text-foreground",
          )}
        >
          {category}
        </button>
      ))}
      <button
        type="button"
        aria-label="Surprise me"
        className="bg-subtle hover:bg-subtle-hover grid size-8 shrink-0 place-items-center rounded-full transition-colors"
      >
        <PawPrint className="size-4" />
      </button>
    </div>
  );
}
