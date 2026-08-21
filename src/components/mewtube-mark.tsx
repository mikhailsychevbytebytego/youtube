import { Play } from "lucide-react";

/** The MewTube play button, wearing a pair of cat ears. */
export function MewTubeMark() {
  return (
    <span className="relative flex h-9 w-11 items-center justify-center rounded-xl bg-brand">
      <span
        aria-hidden
        className="absolute -top-1.5 left-1 h-3 w-2.5 -rotate-[8deg] bg-brand [clip-path:polygon(50%_0%,100%_100%,0%_100%)]"
      />
      <span
        aria-hidden
        className="absolute -top-1.5 right-1 h-3 w-2.5 rotate-[8deg] bg-brand [clip-path:polygon(50%_0%,100%_100%,0%_100%)]"
      />
      <Play
        className="relative h-4 w-5 fill-white text-white"
        strokeWidth={2.5}
      />
    </span>
  );
}
