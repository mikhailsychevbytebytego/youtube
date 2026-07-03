import * as p from "@clack/prompts";
import color from "picocolors";

import {
  formatLabel,
  type ContentFormat,
  type PublishConfig,
  type VideoDuration,
  type VideoResolution,
} from "./publish-config";

type ChannelOption = {
  channelId: string;
  channelName: string;
  userName: string;
};

const DURATION_OPTIONS: { value: VideoDuration; label: string; hint: string }[] = [
  { value: "4", label: "4 seconds", hint: "Quick clip · cheapest" },
  { value: "6", label: "6 seconds", hint: "Short & punchy" },
  { value: "8", label: "8 seconds", hint: "Balanced" },
  { value: "10", label: "10 seconds", hint: "Room for a beat" },
  { value: "12", label: "12 seconds", hint: "Mini story" },
  { value: "15", label: "15 seconds", hint: "Maximum length" },
  { value: "auto", label: "Auto", hint: "Model picks based on prompt" },
];

function cancelIfNeeded<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value;
}

function formatDurationLabel(duration: VideoDuration): string {
  return duration === "auto" ? "Auto (model decides)" : `${duration}s`;
}

export async function promptPublishConfig(channels: ChannelOption[]): Promise<PublishConfig> {
  p.intro(`${color.magenta("MeowTube")} ${color.dim("·")} AI Video Creator`);

  const format = cancelIfNeeded(
    await p.select<ContentFormat>({
      message: "What are you creating?",
      options: [
        { value: "video", label: "Video", hint: "16:9 landscape · home feed & watch page" },
        { value: "short", label: "Short", hint: "9:16 vertical · Shorts row" },
      ],
      initialValue: "video",
    }),
  );

  const creativePrompt = cancelIfNeeded(
    await p.text({
      message: "Creative direction for the LLM",
      placeholder: "e.g. A dramatic slow-mo kitten discovering a cardboard box fortress",
      validate(value) {
        if (!value?.trim()) return "Describe what kind of cat video you want.";
      },
    }),
  );

  const resolution = cancelIfNeeded(
    await p.select<VideoResolution>({
      message: "Video resolution",
      options: [
        { value: "480p", label: "480p", hint: "Faster generation · lower cost" },
        { value: "720p", label: "720p", hint: "Sharper output · takes longer" },
      ],
      initialValue: "480p",
    }),
  );

  const duration = cancelIfNeeded(
    await p.select<VideoDuration>({
      message: format === "short" ? "Short length" : "Video length",
      options: DURATION_OPTIONS,
      initialValue: format === "short" ? "6" : "4",
    }),
  );

  const channelId = cancelIfNeeded(
    await p.select({
      message: "Publish to channel",
      options: channels.map((channel) => ({
        value: channel.channelId,
        label: channel.channelName,
        hint: `Owner: ${channel.userName}`,
      })),
    }),
  );

  const selectedChannel = channels.find((channel) => channel.channelId === channelId);

  p.note(
    [
      `${color.bold("Format")}    ${formatLabel(format)}`,
      `${color.bold("Creative")}  ${creativePrompt.trim()}`,
      `${color.bold("Resolution")} ${resolution}`,
      `${color.bold("Length")}     ${formatDurationLabel(duration)}`,
      `${color.bold("Channel")}   ${selectedChannel?.channelName ?? channelId}`,
    ].join("\n"),
    "Review",
  );

  const confirmed = cancelIfNeeded(
    await p.confirm({
      message: `Generate and publish this ${format === "short" ? "Short" : "video"}?`,
      initialValue: true,
    }),
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`${color.green("Starting generation…")} This may take a few minutes.`);

  return {
    format,
    creativePrompt: creativePrompt.trim(),
    resolution,
    duration,
    channelId,
  };
}

export function createSpinner() {
  return p.spinner({ indicator: "dots" });
}

export function logStepSuccess(message: string) {
  p.log.success(message);
}

export function logStepInfo(message: string) {
  p.log.info(message);
}

export function logPublishComplete(
  title: string,
  slug: string,
  watchUrl: string,
  format: ContentFormat,
) {
  p.note(
    [
      `${color.bold("Type")}  ${formatLabel(format)}`,
      `${color.bold("Title")} ${title}`,
      `${color.bold("Slug")}  ${slug}`,
      `${color.bold("Watch")} ${color.cyan(watchUrl)}`,
    ].join("\n"),
    `Published ${format === "short" ? "Short" : "Video"}`,
  );
  p.outro(color.green("Done!"));
}
