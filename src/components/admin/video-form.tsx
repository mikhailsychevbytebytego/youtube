"use client";

import { useActionState } from "react";
import type { Channel, Video } from "@/db/schema";
import type { FormState } from "@/app/admin/actions";
import {
  errorClass,
  inputClass,
  labelClass,
  submitClass,
} from "./form-styles";

/** Formats a Date for a datetime-local input in the local timezone. */
function toLocalInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function VideoForm({
  action,
  video,
  channels,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  video?: Video;
  channels: Channel[];
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex w-full max-w-xl flex-col gap-4">
      {state.error && <p className={errorClass}>{state.error}</p>}
      <label className={labelClass}>
        Title
        <input
          name="title"
          defaultValue={video?.title}
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Channel
        <select
          name="channelId"
          defaultValue={video?.channelId ?? ""}
          required
          className={inputClass}
        >
          <option value="" disabled>
            Select a channel...
          </option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name} ({channel.handle})
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Type
        <select
          name="type"
          defaultValue={video?.type ?? "video"}
          className={inputClass}
        >
          <option value="video">Video</option>
          <option value="short">Short</option>
          <option value="live">Live</option>
        </select>
      </label>
      <label className={labelClass}>
        Description
        <textarea
          name="description"
          defaultValue={video?.description ?? ""}
          rows={3}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Thumbnail URL
        <input
          name="thumbnailUrl"
          defaultValue={video?.thumbnailUrl ?? ""}
          placeholder="/images/thumb-box-challenge.png"
          className={inputClass}
        />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className={labelClass}>
          Duration (seconds)
          <input
            name="durationSeconds"
            type="number"
            min={0}
            defaultValue={video?.durationSeconds ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Views
          <input
            name="viewCount"
            type="number"
            min={0}
            defaultValue={video?.viewCount ?? 0}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Likes
          <input
            name="likeCount"
            type="number"
            min={0}
            defaultValue={video?.likeCount ?? 0}
            className={inputClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Published at
        <input
          name="publishedAt"
          type="datetime-local"
          defaultValue={video ? toLocalInputValue(video.publishedAt) : ""}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-[#0f0f0f]">
        <input
          name="isPublished"
          type="checkbox"
          defaultChecked={video?.isPublished ?? true}
          className="size-4 accent-[#0f0f0f]"
        />
        Published
      </label>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving..." : video ? "Save changes" : "Create video"}
      </button>
    </form>
  );
}
