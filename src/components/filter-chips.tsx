const filterChips = [
  "All",
  "Cat Shows",
  "Shorts",
  "Live",
  "Cat Watching",
  "Saved",
  "New to you",
];

export function FilterChips() {
  return (
    <div className="-mx-3 flex items-start gap-3 overflow-x-auto px-3 md:mx-0 md:px-0">
      {filterChips.map((chip, i) => (
        <button
          key={chip}
          className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
            i === 0
              ? "bg-inverted text-inverted-fg"
              : "border border-border bg-surface text-foreground"
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
