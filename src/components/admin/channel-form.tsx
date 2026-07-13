"use client";

import { useActionState } from "react";
import type { Channel, User } from "@/db/schema";
import type { FormState } from "@/app/admin/actions";
import {
  errorClass,
  inputClass,
  labelClass,
  submitClass,
} from "./form-styles";

export function ChannelForm({
  action,
  channel,
  owners,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  channel?: Channel;
  owners: User[];
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex w-full max-w-xl flex-col gap-4">
      {state.error && <p className={errorClass}>{state.error}</p>}
      <label className={labelClass}>
        Name
        <input
          name="name"
          defaultValue={channel?.name}
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Handle
        <input
          name="handle"
          defaultValue={channel?.handle}
          placeholder="@thedailypurr"
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Owner
        <select
          name="userId"
          defaultValue={channel?.userId ?? ""}
          required
          className={inputClass}
        >
          <option value="" disabled>
            Select a user...
          </option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name} ({owner.email})
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Description
        <textarea
          name="description"
          defaultValue={channel?.description ?? ""}
          rows={3}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Avatar URL
        <input
          name="avatarUrl"
          defaultValue={channel?.avatarUrl ?? ""}
          placeholder="/images/avatar-daily-purr.png"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Banner URL
        <input
          name="bannerUrl"
          defaultValue={channel?.bannerUrl ?? ""}
          placeholder="/images/channel-banner.png"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Subscribers
        <input
          name="subscriberCount"
          type="number"
          min={0}
          defaultValue={channel?.subscriberCount ?? 0}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving..." : channel ? "Save changes" : "Create channel"}
      </button>
    </form>
  );
}
