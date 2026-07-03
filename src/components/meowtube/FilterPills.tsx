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
                ? "bg-[#0f0f0f] text-white"
                : "border border-[#e5e5e5] bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e8e8e8]"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
