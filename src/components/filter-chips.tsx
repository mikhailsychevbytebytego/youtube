import { filterChips } from "@/lib/data";

export function FilterChips() {
  return (
    <div className="flex items-start gap-3">
      {filterChips.map((chip, i) => (
        <button
          key={chip}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
            i === 0
              ? "bg-[#0f0f0f] text-white"
              : "border border-[#e5e5e5] bg-[#f2f2f2] text-[#0f0f0f]"
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
