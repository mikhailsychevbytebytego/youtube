/**
 * Formats a raw count into a compact, human-readable string, e.g.
 * 1_200_000 -> "1.2M". An optional unit is appended (e.g. "1.2M views").
 */
export function formatCount(value: number, unit?: string): string {
  const compact = compactNumber(value);
  if (!unit) return compact;
  if (value === 1 && unit.endsWith("s")) {
    return `${compact} ${unit.slice(0, -1)}`;
  }
  return `${compact} ${unit}`;
}

function compactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return trim(value / 1_000_000_000) + "B";
  if (abs >= 1_000_000) return trim(value / 1_000_000) + "M";
  if (abs >= 1_000) return trim(value / 1_000) + "K";
  return String(value);
}

function trim(value: number): string {
  // One decimal place, but drop a trailing ".0".
  return value.toFixed(1).replace(/\.0$/, "");
}

/** Turns a past date into a relative string like "2 days ago" or "just now". */
export function formatRelativeTime(date: Date | string): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));

  const units: [string, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [label, secondsPerUnit] of units) {
    const amount = Math.floor(seconds / secondsPerUnit);
    if (amount >= 1) {
      return `${amount} ${label}${amount === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}

/** Formats a duration in seconds as "m:ss" or "h:mm:ss". */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(secs)}`;
  return `${mins}:${pad(secs)}`;
}
