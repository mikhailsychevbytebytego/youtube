"use client";

import { useState, useTransition, useEffect } from "react";
import { subscribeToChannel, unsubscribeFromChannel, getSubscriptionStatus } from "@/app/subscription-actions";

interface SubscribeButtonProps {
  channelName: string;
  initialSubscribed?: boolean;
  className?: string;
  variant?: "default" | "shorts";
}

export function SubscribeButton({
  channelName,
  initialSubscribed = false,
  className = "",
  variant = "default",
}: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await getSubscriptionStatus(channelName);
        setSubscribed(status);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
      }
    }
    checkStatus();
  }, [channelName]);

  const handleToggle = () => {
    startTransition(async () => {
      if (subscribed) {
        const res = await unsubscribeFromChannel(channelName);
        if (res.success) {
          setSubscribed(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("subscription-change", { detail: { channelName, subscribed: false } }));
          }
        } else if (res.error) {
          alert(res.error);
        }
      } else {
        const res = await subscribeToChannel(channelName);
        if (res.success) {
          setSubscribed(true);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("subscription-change", { detail: { channelName, subscribed: true } }));
          }
        } else if (res.error) {
          alert(res.error);
        }
      }
    });
  };

  const defaultClasses = "rounded-full transition-all duration-200 disabled:opacity-50";
  
  let stateClasses = "";
  if (variant === "shorts") {
    stateClasses = subscribed
      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 text-xs font-bold"
      : "bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs font-bold";
  } else {
    stateClasses = subscribed
      ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-sm font-semibold"
      : "bg-red-600 text-white hover:bg-red-700 text-sm font-semibold";
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`${defaultClasses} ${stateClasses} ${className}`}
    >
      {isPending ? "Updating..." : subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
