"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Cat, Upload } from "lucide-react";

function uploadToCloudflare(
  uploadURL: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadURL);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error("Video upload failed."));
    };

    xhr.onerror = () => reject(new Error("Video upload failed."));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose a video file to upload.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const initResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init", title }),
      });

      const initData = (await initResponse.json()) as {
        uploadURL?: string;
        uid?: string;
        error?: string;
      };

      if (!initResponse.ok || !initData.uploadURL || !initData.uid) {
        setError(initData.error ?? "Could not start upload.");
        return;
      }

      await uploadToCloudflare(initData.uploadURL, file, setProgress);

      const completeResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          title,
          uid: initData.uid,
        }),
      });

      const completeData = (await completeResponse.json()) as {
        slug?: string;
        error?: string;
      };

      if (!completeResponse.ok || !completeData.slug) {
        setError(completeData.error ?? "Upload finished but saving failed.");
        return;
      }

      router.push(`/watch/${completeData.slug}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setProgress(null);
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
          <Upload className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-[#0f0f0f]">Upload video</h1>
          <p className="text-sm text-[#606060]">Add a title and choose your video file.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f]"
            placeholder="My awesome cat video"
          />
        </div>

        <div>
          <label htmlFor="video" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
            Video file
          </label>
          <input
            id="video"
            type="file"
            required
            accept="video/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[#606060] file:mr-4 file:rounded-full file:border-0 file:bg-[#f2f2f2] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#0f0f0f] hover:file:bg-[#e5e5e5]"
          />
          {file && (
            <p className="mt-2 text-sm text-[#606060]">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}
        </div>

        {progress !== null && (
          <div>
            <div className="mb-1 flex justify-between text-sm text-[#606060]">
              <span>Uploading to Cloudflare Stream…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f2f2f2]">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#0f0f0f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#272727] disabled:opacity-60"
        >
          {loading ? "Uploading…" : "Upload video"}
        </button>
      </form>
    </div>
  );
}
