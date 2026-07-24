"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, PawPrint } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSubscriptions } from "@/hooks/use-subscriptions";

interface SubscribeButtonProps {
  channelId: string;
  initialSubscribed?: boolean;
  subscriberCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  onSubscribeChange?: (subscribed: boolean, count: number) => void;
}

export function SubscribeButton({
  channelId,
  initialSubscribed,
  subscriberCount,
  size = "md",
  className = "",
  onSubscribeChange,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { isSubscribed: checkSubscribed, toggleSubscription } = useSubscriptions();

  const isSubFromHook = checkSubscribed(channelId);
  const [overrideSubscribed, setOverrideSubscribed] = useState<boolean | null>(null);

  // Compute subscribed state synchronously for 0ms render delay
  const subscribed = overrideSubscribed !== null
    ? overrideSubscribed
    : Boolean(initialSubscribed || isSubFromHook);

  const [count, setCount] = useState<number | undefined>(subscriberCount);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // LOGIN GATE: Must be signed in to subscribe or unsubscribe
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    if (isPending) return;
    setIsPending(true);

    const willBeSubscribed = !subscribed;
    setOverrideSubscribed(willBeSubscribed);

    if (count !== undefined) {
      const nextCount = willBeSubscribed ? count + 1 : Math.max(0, count - 1);
      setCount(nextCount);
      onSubscribeChange?.(willBeSubscribed, nextCount);
    } else {
      onSubscribeChange?.(willBeSubscribed, 0);
    }

    try {
      await toggleSubscription(channelId);
    } finally {
      setIsPending(false);
    }
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-full font-semibold",
    md: "px-4 py-2 text-sm gap-2 rounded-full font-semibold",
    lg: "px-6 py-3 text-base gap-3 rounded-3xl font-bold",
  }[size];

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4.5",
    lg: "size-5",
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center transition-all duration-200 active:scale-95 ${sizeStyles} ${
        subscribed
          ? "bg-surface hover:bg-surface/80 text-foreground border border-border"
          : "bg-[#ff0000] hover:bg-[#e60000] text-white shadow-sm"
      } ${className}`}
    >
      {subscribed ? (
        <>
          <Check className={`${iconSizes} text-foreground`} />
          <span>Purrscribed</span>
        </>
      ) : (
        <>
          <PawPrint className={`${iconSizes} text-white`} />
          <span>Purrscribe</span>
        </>
      )}
    </button>
  );
}
