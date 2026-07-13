import Image from "next/image";
import {
  ArrowRight,
  Captions,
  CirclePlay,
  Fullscreen,
  PictureInPicture,
  Settings,
  TvMinimalPlay,
  Volume2,
} from "lucide-react";
import { watchVideo } from "@/lib/watch-data";

export function VideoPlayer() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0f0f0f]">
      <Image
        src={watchVideo.poster}
        alt={watchVideo.title}
        fill
        sizes="(min-width: 1280px) 60vw, 100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-start p-3">
        <div className="flex flex-col gap-2">
          <div className="flex h-1 w-full bg-white/30">
            <div className="h-full w-[320px] bg-[#ff0000]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CirclePlay className="size-[18px] text-white" />
              <ArrowRight className="size-[18px] text-white" />
              <Volume2 className="size-[18px] text-white" />
              <span className="text-[13px] text-white">
                {watchVideo.currentTime} / {watchVideo.totalTime}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Captions className="size-[18px] text-white" />
              <Settings className="size-[18px] text-white" />
              <PictureInPicture className="size-[18px] text-white" />
              <TvMinimalPlay className="size-[18px] text-white" />
              <Fullscreen className="size-[18px] text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
