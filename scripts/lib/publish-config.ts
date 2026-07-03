export type VideoResolution = "480p" | "720p";

export type ContentFormat = "video" | "short";

/** Seedance duration enum values supported by fal.ai. */
export type VideoDuration =
  | "auto"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15";

export type PublishConfig = {
  format: ContentFormat;
  creativePrompt: string;
  resolution: VideoResolution;
  duration: VideoDuration;
  channelId: string;
};

export const DEFAULT_PUBLISH_CONFIG: Omit<PublishConfig, "channelId"> = {
  format: "video",
  creativePrompt: "A funny or cute cat doing something entertaining",
  resolution: "480p",
  duration: "4",
};

export function formatLabel(format: ContentFormat): string {
  return format === "video" ? "Video (16:9)" : "Short (9:16)";
}

export function aspectRatioForFormat(format: ContentFormat): "16:9" | "9:16" {
  return format === "video" ? "16:9" : "9:16";
}

export function imageSizeForFormat(format: ContentFormat): "landscape_16_9" | "portrait_16_9" {
  return format === "video" ? "landscape_16_9" : "portrait_16_9";
}

export function parseDurationSeconds(duration: VideoDuration): number | undefined {
  if (duration === "auto") return undefined;
  return Number.parseInt(duration, 10);
}

export function isInteractiveFlag(argv: string[]): boolean {
  return argv.includes("--interactive") || argv.includes("-i");
}
