"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Cat, Tv } from "lucide-react";

import { createChannel } from "@/app/channel/actions";

export function CreateChannelForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleHandleChange(val: string) {
    // Ensure it starts with @, and strip spaces / invalid characters
    let formatted = val;
    if (formatted && !formatted.startsWith("@")) {
      formatted = `@${formatted}`;
    }
    // Only allow lowecase letters, numbers, underscores, and @
    formatted = formatted.toLowerCase().replace(/[^a-z0-9_@]/g, "");
    setHandle(formatted);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a channel name.");
      return;
    }

    if (!handle.trim() || handle === "@") {
      setError("Please enter a valid channel handle.");
      return;
    }

    setLoading(true);

    try {
      const res = await createChannel({
        name,
        handle,
        description,
      });

      if (!res.success) {
        setError(res.error ?? "Failed to create channel.");
        setLoading(false);
        return;
      }

      router.push(`/channel/${res.channelSlug}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-[#e5e5e5] bg-white p-8 shadow-sm">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="flex items-start rounded-lg bg-red-600 p-1">
          <Cat className="size-5 text-white" />
        </span>
        <span className="text-xl font-bold text-black">MeowTube</span>
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#f2f2f2] text-[#0f0f0f]">
          <Tv className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-[#0f0f0f]">Create a channel</h1>
          <p className="text-sm text-[#606060]">Setup your channel to start uploading and sharing cat videos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
            Channel Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f]"
            placeholder="e.g. Whiskers Adventures"
          />
        </div>

        <div>
          <label htmlFor="handle" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
            Channel Handle
          </label>
          <input
            id="handle"
            type="text"
            required
            value={handle}
            onChange={(event) => handleHandleChange(event.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f]"
            placeholder="@whiskers_adv"
          />
          <p className="mt-1 text-xs text-[#606060]">
            Handles must start with @ and can only contain lowercase letters, numbers, and underscores.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f] resize-none"
            placeholder="Tell viewers about your cat channel..."
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#0f0f0f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#272727] disabled:opacity-60"
        >
          {loading ? "Creating Channel…" : "Create Channel"}
        </button>
      </form>
    </div>
  );
}
