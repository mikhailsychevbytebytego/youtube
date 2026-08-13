import { cn } from "@/lib/utils";

// Written out in full so Tailwind picks these class names up when scanning.
const GRADIENTS = [
  "bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400",
  "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
  "bg-gradient-to-br from-rose-200 via-rose-300 to-rose-400",
  "bg-gradient-to-br from-orange-200 via-amber-300 to-yellow-400",
  "bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500",
  "bg-gradient-to-br from-teal-200 via-cyan-300 to-sky-400",
  "bg-gradient-to-br from-violet-200 via-purple-300 to-fuchsia-300",
  "bg-gradient-to-br from-lime-200 via-emerald-300 to-teal-400",
];

function gradientFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_003;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

type MediaPlaceholderProps = {
  /** Picks the gradient, so a given id always renders the same colors. */
  seed: string;
  emoji: string;
  className?: string;
  emojiClassName?: string;
};

/**
 * Stands in for real imagery: a gradient wash with an emoji on top, used for
 * both video thumbnails and channel avatars.
 */
export function MediaPlaceholder({
  seed,
  emoji,
  className,
  emojiClassName,
}: MediaPlaceholderProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid place-items-center overflow-hidden select-none",
        gradientFor(seed),
        className,
      )}
    >
      <span className={cn("leading-none", emojiClassName)}>{emoji}</span>
    </div>
  );
}

type AvatarProps = {
  seed: string;
  emoji: string;
  className?: string;
  emojiClassName?: string;
};

export function Avatar({ seed, emoji, className, emojiClassName }: AvatarProps) {
  return (
    <MediaPlaceholder
      seed={seed}
      emoji={emoji}
      className={cn("size-9 shrink-0 rounded-full", className)}
      emojiClassName={cn("text-base", emojiClassName)}
    />
  );
}
