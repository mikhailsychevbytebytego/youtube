"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatCount } from "@/lib/format";

export function LikeButton({
  videoId,
  initialLiked = false,
  initialCount,
  variant = "watch",
}: {
  videoId: string;
  initialLiked?: boolean;
  initialCount: number;
  variant?: "watch" | "short";
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  function signInRedirect() {
    const next = `${window.location.pathname}${window.location.search}`;
    router.push(`/signin?next=${encodeURIComponent(next)}`);
  }

  async function toggle() {
    if (!session?.user) {
      signInRedirect();
      return;
    }
    if (pending) return;

    const willLike = !liked;
    setLiked(willLike);
    setCount((prev) => Math.max(0, prev + (willLike ? 1 : -1)));
    setPending(true);

    try {
      const response = await fetch("/api/likes", {
        method: willLike ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (response.status === 401) {
        signInRedirect();
        return;
      }
      if (!response.ok) {
        setLiked(!willLike);
        setCount((prev) => Math.max(0, prev + (willLike ? -1 : 1)));
      }
    } catch {
      setLiked(!willLike);
      setCount((prev) => Math.max(0, prev + (willLike ? -1 : 1)));
    } finally {
      setPending(false);
    }
  }

  if (variant === "short") {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          onClick={toggle}
          className="flex size-11 items-center justify-center rounded-full bg-surface hover:bg-surface-hover"
        >
          <ThumbsUp
            className={`size-5 text-foreground ${liked ? "fill-foreground" : ""}`}
          />
        </button>
        <span className="text-xs font-medium text-foreground">
          {formatCount(count)}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      onClick={toggle}
      className="flex min-h-11 items-center gap-2 border-r border-border px-3 py-2"
    >
      <ThumbsUp
        className={`size-5 text-foreground ${liked ? "fill-foreground" : ""}`}
      />
      <span className="text-sm font-semibold text-foreground">
        {formatCount(count)}
      </span>
    </button>
  );
}
