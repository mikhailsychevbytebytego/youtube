"use client";

import { useState } from "react";
import { filters } from "@/lib/meowtube-data";

export function FilterPills() {
  const [active, setActive] = useState(filters[0]);

  return (
    <div className="flex w-full gap-3 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filters.map((filter) => {
        const isActive = filter === active;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : "border border-border bg-muted text-foreground hover:bg-hover"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
