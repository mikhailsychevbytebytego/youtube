"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { createOwnedChannel, type CreateChannelState } from "@/app/you/actions";
import {
  CHANNEL_AVATARS,
  slugifyHandle,
} from "@/lib/channel";

const steps = ["Name", "Handle", "Picture", "Confirm"] as const;

const initialState: CreateChannelState = { error: null };

export function CreateChannelWizard({
  defaultName,
}: {
  defaultName: string;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName);
  const [handle, setHandle] = useState(slugifyHandle(defaultName));
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>(CHANNEL_AVATARS[0]);
  const [state, formAction, pending] = useActionState(
    createOwnedChannel,
    initialState,
  );

  useEffect(() => {
    if (state.field === "name") setStep(0);
    if (state.field === "handle") setStep(1);
  }, [state]);

  function goNext() {
    if (step === 0 && name.trim().length < 2) return;
    if (step === 1 && handle.replace(/^@/, "").length < 3) return;
    if (step === 1 && !handle) {
      setHandle(slugifyHandle(name));
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-xl flex-col gap-8 rounded-2xl border border-border bg-background p-6 md:p-8"
    >
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <ol className="flex items-center gap-2">
        {steps.map((label, index) => (
          <li key={label} className="flex min-w-0 flex-1 flex-col gap-1">
            <span
              className={`h-1 rounded-full ${
                index <= step ? "bg-[#ff0000]" : "bg-surface"
              }`}
            />
            <span
              className={`truncate text-xs ${
                index === step
                  ? "font-semibold text-foreground"
                  : "text-muted"
              }`}
            >
              {index + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">
          Step {step + 1} of {steps.length}
        </p>
        <h1 className="text-2xl font-bold text-foreground">
          {step === 0 && "Name your channel"}
          {step === 1 && "Choose a handle"}
          {step === 2 && "Pick a picture and bio"}
          {step === 3 && "Create this channel?"}
        </h1>
        <p className="text-sm text-muted">
          {step === 0 &&
            "This is the public name people will see. It is not your account name."}
          {step === 1 &&
            "Handles are unique, start with @, and can be letters, numbers, or underscores."}
          {step === 2 &&
            "A picture and a short bio help visitors tell your channel apart from your account."}
          {step === 3 &&
            "After this, your account still signs you in. The channel is what you publish as."}
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-[#cc0000] bg-[#fff0f0] px-3 py-2 text-sm text-[#cc0000]">
          {state.error}
        </p>
      ) : null}

      {step === 0 ? (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Channel name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            autoFocus
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-foreground"
          />
        </label>
      ) : null}

      {step === 1 ? (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Handle
          <span className="flex items-center overflow-hidden rounded-lg border border-border">
            <span className="px-3 text-sm text-muted">@</span>
            <input
              value={handle.replace(/^@/, "")}
              onChange={(event) => setHandle(event.target.value)}
              maxLength={30}
              autoFocus
              className="h-10 min-w-0 flex-1 bg-background pr-3 text-sm font-normal text-foreground outline-none"
            />
          </span>
        </label>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Channel picture</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {CHANNEL_AVATARS.map((src) => {
                const selected = avatarUrl === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setAvatarUrl(src)}
                    className={`relative size-16 overflow-hidden rounded-full border-2 ${
                      selected
                        ? "border-[#ff0000]"
                        : "border-transparent hover:border-border"
                    }`}
                    aria-pressed={selected}
                    aria-label="Choose channel picture"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="What is this channel about?"
              className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-foreground"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-foreground">{name}</p>
            <p className="truncate text-sm text-muted">
              @{handle.replace(/^@/, "")}
            </p>
            {description ? (
              <p className="mt-2 line-clamp-3 text-sm text-muted">
                {description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">No description yet.</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || pending}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-40"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-[#0f0f0f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#272727] dark:bg-white dark:text-[#0f0f0f]"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[#ff0000] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e60000] disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create channel"}
          </button>
        )}
      </div>
    </form>
  );
}
