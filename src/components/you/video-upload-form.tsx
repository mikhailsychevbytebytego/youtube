"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 200 * 1024 * 1024;

type Status =
  | "idle"
  | "requesting"
  | "uploading"
  | "processing"
  | "done"
  | "error";

export function VideoUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"video" | "short">("video");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 2) {
      setError("Give the video a title.");
      return;
    }
    if (!file) {
      setError("Choose a video file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep uploads under 200 MB.");
      return;
    }

    setStatus("requesting");
    const direct = await fetch("/api/uploads/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), type }),
    });
    const directBody = (await direct.json().catch(() => null)) as {
      uid?: string;
      uploadURL?: string;
      error?: string;
    } | null;
    if (!direct.ok || !directBody?.uid || !directBody.uploadURL) {
      setStatus("error");
      setError(directBody?.error ?? "Could not start the upload.");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    try {
      await uploadToStream(directBody.uploadURL, file, setProgress);
    } catch (uploadError) {
      setStatus("error");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload to Cloudflare failed.",
      );
      return;
    }

    setStatus("processing");
    const complete = await fetch("/api/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: directBody.uid,
        title: title.trim(),
        description: description.trim(),
        type,
      }),
    });
    const completeBody = (await complete.json().catch(() => null)) as {
      videoId?: string;
      error?: string;
    } | null;
    if (!complete.ok || !completeBody?.videoId) {
      setStatus("error");
      setError(completeBody?.error ?? "Could not save the video row.");
      return;
    }

    setVideoId(completeBody.videoId);
    setStatus("done");
    router.refresh();
  }

  const pending =
    status === "requesting" ||
    status === "uploading" ||
    status === "processing";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-border bg-background p-6 md:p-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Upload a video</h1>
        <p className="text-sm text-muted">
          The file goes to Cloudflare Stream from this browser. MewTube then
          stores the same kind of row the AI catalog already uses, so playback
          is the Stream player you already have.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-[#cc0000] bg-[#fff0f0] px-3 py-2 text-sm text-[#cc0000]">
          {error}
        </p>
      ) : null}

      {status === "done" && videoId ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-medium text-foreground">
            Uploaded. It plays through the same watch page as generated videos.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/watch?v=${videoId}`}
              className="rounded-full bg-[#ff0000] px-5 py-2 text-sm font-semibold text-white hover:bg-[#e60000]"
            >
              Watch it
            </a>
            <a
              href="/you"
              className="rounded-full bg-surface px-5 py-2 text-sm font-semibold text-foreground hover:bg-border"
            >
              Back to You
            </a>
          </div>
        </div>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
          required
          disabled={pending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={4}
          disabled={pending}
          className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-foreground"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Type</legend>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            name="type"
            checked={type === "video"}
            onChange={() => setType("video")}
            disabled={pending}
          />
          Regular video
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            name="type"
            checked={type === "short"}
            onChange={() => setType("short")}
            disabled={pending}
          />
          Short
        </label>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        File
        <input
          type="file"
          accept="video/*"
          disabled={pending}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground"
        />
        <span className="text-xs text-muted">MP4 or similar, up to 200 MB.</span>
      </label>

      {status === "uploading" || status === "processing" || status === "requesting" ? (
        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full bg-[#ff0000] transition-[width]"
              style={{
                width:
                  status === "uploading"
                    ? `${progress}%`
                    : status === "processing"
                      ? "100%"
                      : "8%",
              }}
            />
          </div>
          <p className="text-sm text-muted">
            {status === "requesting" && "Asking Stream for an upload URL…"}
            {status === "uploading" && `Uploading to Cloudflare… ${progress}%`}
            {status === "processing" && "Saving the video row…"}
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || status === "done"}
        className="self-start rounded-full bg-[#ff0000] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e60000] disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}

function uploadToStream(
  uploadURL: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadURL);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      reject(new Error(`Cloudflare rejected the file (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(form);
  });
}
