import { cn } from "@/lib/utils";

type IconButtonProps = {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** Rendered as a red counter bubble on the top-right corner. */
  badge?: number;
};

export function IconButton({
  label,
  children,
  onClick,
  className,
  badge,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-subtle",
        className,
      )}
    >
      {children}
      {badge ? (
        <span className="bg-brand absolute top-1 right-1 grid min-w-4 place-items-center rounded-full px-1 text-[10px] leading-4 font-medium text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
