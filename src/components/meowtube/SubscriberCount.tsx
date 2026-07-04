"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

export function SubscriberCount({ 
  channelName, 
  initialCount,
  className = "text-xs text-muted-foreground"
}: { 
  channelName: string; 
  initialCount: number;
  className?: string;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Only update if different
    if (initialCount !== count) {
      setCount(initialCount);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCount]);

  useEffect(() => {
    const handleSubscriptionChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ channelName: string; subscribed: boolean }>;
      if (customEvent.detail && customEvent.detail.channelName === channelName) {
        setCount(prev => customEvent.detail.subscribed ? prev + 1 : Math.max(0, prev - 1));
      }
    };

    window.addEventListener("subscription-change", handleSubscriptionChange);
    return () => window.removeEventListener("subscription-change", handleSubscriptionChange);
  }, [channelName]);

  return (
    <span className={className}>
      {formatCount(count, "subscribers")}
    </span>
  );
}