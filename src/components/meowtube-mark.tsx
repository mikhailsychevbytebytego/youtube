import { Play } from "lucide-react";

/** The MeowTube play button, wearing a pair of cat ears. */
export function MeowTubeMark() {
  return (
    <span className="relative flex h-[39px] w-12 items-center justify-center rounded-xl bg-brand">
      <span
        aria-hidden
        className="absolute -top-1.5 left-[5px] h-[13px] w-3 -rotate-[5deg] bg-brand [clip-path:polygon(50%_0%,100%_100%,0%_100%)]"
      />
      <span
        aria-hidden
        className="absolute -top-1.5 right-[5px] h-[13px] w-3 rotate-[5deg] bg-brand [clip-path:polygon(50%_0%,100%_100%,0%_100%)]"
      />
      <Play className="relative h-5 w-[22px] text-white" strokeWidth={3} />
    </span>
  );
}
