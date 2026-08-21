"use client";

import { useState } from "react";

import { filters } from "@/lib/data";

export function FilterChips() {
  const [active, setActive] = useState(filters[0]);

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {filters.map((filter) => {
        const isActive = filter === active;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActive(filter)}
            className={`h-8 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium ${
              isActive
                ? "bg-ink text-white"
                : "bg-chip text-ink-soft hover:bg-line"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
