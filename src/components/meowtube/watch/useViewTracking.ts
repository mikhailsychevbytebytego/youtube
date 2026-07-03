"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PingResponse = {
  viewId: string;
  state: "started" | "finished";
  pingCount: number;
};

export function useViewTracking(videoSlug: string, isPlaying: boolean) {
  const router = useRouter();
  const viewIdRef = useRef<string | undefined>(undefined);
  const finishedRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    viewIdRef.current = undefined;
    finishedRef.current = false;
    inFlightRef.current = false;
  }, [videoSlug]);

  useEffect(() => {
    const sendPing = async () => {
      if (!isPlaying || finishedRef.current || inFlightRef.current) return;

      inFlightRef.current = true;
      try {
        const response = await fetch("/api/views/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoSlug,
            viewId: viewIdRef.current,
          }),
        });

        if (!response.ok) return;

        const data = (await response.json()) as PingResponse;
        viewIdRef.current = data.viewId;

        if (data.state === "finished") {
          finishedRef.current = true;
          router.refresh();
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    const intervalId = window.setInterval(() => {
      void sendPing();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [videoSlug, isPlaying, router]);
}
