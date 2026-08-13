function trimDecimal(value: number) {
  return value.toFixed(1).replace(/\.0$/, "");
}

/**
 * Compacts a count the way YouTube does: one decimal place below ten of any
 * unit (3.4K, 1.2M) but a whole number above it (987K).
 */
export function formatCompact(count: number): string {
  if (count >= 1_000_000_000) return `${trimDecimal(count / 1_000_000_000)}B`;
  if (count >= 1_000_000) return `${trimDecimal(count / 1_000_000)}M`;
  if (count >= 1_000) {
    const thousands = count / 1_000;
    return `${thousands < 10 ? trimDecimal(thousands) : Math.round(thousands)}K`;
  }
  return String(count);
}

export function formatViews(count: number): string {
  return `${formatCompact(count)} views`;
}

export function formatWatching(count: number): string {
  return `${formatCompact(count)} watching`;
}
