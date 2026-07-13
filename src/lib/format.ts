/** Formats 1234567 as "1.2M", 542000 as "542K", 987 as "987". */
export function formatCount(count: number, decimals = 1): string {
  const format = (value: number, suffix: string) => {
    const text = value.toFixed(decimals).replace(/\.?0+$/, "");
    return `${text}${suffix}`;
  };
  if (count >= 1_000_000) return format(count / 1_000_000, "M");
  if (count >= 1_000) return format(count / 1_000, "K");
  return String(count);
}

export function formatViews(count: number): string {
  return `${formatCount(count)} views`;
}

export function formatWatching(count: number): string {
  return `${formatCount(count)} watching`;
}

export function timeAgo(date: Date): string {
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  const units: [name: string, seconds: number][] = [
    ["year", 365 * 86_400],
    ["month", 30 * 86_400],
    ["week", 7 * 86_400],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [name, unitSeconds] of units) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/** Formats 252 as "4:12" and 3735 as "1:02:15". */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}
