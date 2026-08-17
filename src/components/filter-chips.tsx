import { PawPrint } from "lucide-react";

import { filters } from "@/lib/data";

export function FilterChips() {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {filters.map((filter, index) => (
        <button
          key={filter}
          type="button"
          aria-pressed={index === 0}
          className={`h-10 shrink-0 cursor-pointer rounded-xl px-6 text-[17px] font-bold ${
            index === 0
              ? "bg-brand text-white"
              : "bg-chip text-ink-soft hover:bg-line"
          }`}
        >
          {filter}
        </button>
      ))}
      <button
        type="button"
        aria-label="More filters"
        className="flex h-10 w-[46px] shrink-0 cursor-pointer items-center justify-center rounded-xl bg-chip text-[#7a7a7a] hover:bg-line"
      >
        <PawPrint className="size-[25px]" />
      </button>
    </div>
  );
}
