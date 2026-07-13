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
    <div className="flex items-start gap-3">
      {filterChips.map((chip, i) => (
        <button
          key={chip}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
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
