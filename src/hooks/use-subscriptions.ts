"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { triggerCatConfetti } from "@/components/cat-confetti";
import { authClient } from "@/lib/auth-client";
import type { Channel } from "@/db/schema";

const STORAGE_KEY_IDS = "mewtube_sub_ids";
const STORAGE_KEY_CHANNELS = "mewtube_sub_channels";
const SUBS_EVENT = "mewtube-subscriptions-changed";

export function getCachedSubscribedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCachedChannels(): Channel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHANNELS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateCache(ids: string[], channelsList?: Channel[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(ids));
    if (channelsList) {
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channelsList));
    }
    window.dispatchEvent(new CustomEvent(SUBS_EVENT));
  } catch (err) {
    console.error("Failed to update subscriptions cache:", err);
  }
}

export function useSubscriptions() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const [subscribedIds, setSubscribedIds] = useState<string[]>(getCachedSubscribedIds);
  const [channels, setChannels] = useState<Channel[]>(getCachedChannels);
  const [loading, setLoading] = useState(true);

  // Sync state when custom event fires
  useEffect(() => {
    function handleSubsChange() {
      setSubscribedIds(getCachedSubscribedIds());
      setChannels(getCachedChannels());
    }

    window.addEventListener(SUBS_EVENT, handleSubsChange);
    return () => window.removeEventListener(SUBS_EVENT, handleSubsChange);
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!session?.user) {
      if (!isSessionPending) {
        updateCache([], []);
        setSubscribedIds([]);
        setChannels([]);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) {
        const data = await res.json();
        const serverIds: string[] = data.channelIds ?? [];
        const serverChannels: Channel[] = data.channels ?? [];

        setSubscribedIds(serverIds);
        setChannels(serverChannels);
        updateCache(serverIds, serverChannels);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user, isSessionPending]);

  useEffect(() => {
    let ignore = false;
    if (!isSessionPending) {
      if (!session?.user) {
        Promise.resolve().then(() => {
          if (!ignore) {
            updateCache([], []);
            setSubscribedIds([]);
            setChannels([]);
            setLoading(false);
          }
        });
      } else {
        fetch("/api/subscriptions")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!ignore && data) {
              const serverIds: string[] = data.channelIds ?? [];
              const serverChannels: Channel[] = data.channels ?? [];
              setSubscribedIds(serverIds);
              setChannels(serverChannels);
              updateCache(serverIds, serverChannels);
            }
          })
          .catch((err) => console.error("Failed to load subscriptions:", err))
          .finally(() => {
            if (!ignore) setLoading(false);
          });
      }
    }
    return () => {
      ignore = true;
    };
  }, [session?.user, isSessionPending]);

  const isSubscribed = useCallback(
    (channelId: string) => {
      return subscribedIds.includes(channelId);
    },
    [subscribedIds]
  );

  const subscribe = useCallback(
    async (channelId: string) => {
      if (!session?.user) {
        router.push("/signin");
        return;
      }

      const currentIds = getCachedSubscribedIds();
      if (!currentIds.includes(channelId)) {
        const nextIds = [...currentIds, channelId];
        updateCache(nextIds);
        setSubscribedIds(nextIds);
      }

      // Trigger happy cat confetti!
      triggerCatConfetti();

      try {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId }),
        });
        if (res.status === 401) {
          router.push("/signin");
        } else if (res.ok) {
          fetchSubscriptions();
        }
      } catch (err) {
        console.error("Subscription API failed:", err);
      }
    },
    [session?.user, router, fetchSubscriptions]
  );

  const unsubscribe = useCallback(
    async (channelId: string) => {
      if (!session?.user) {
        router.push("/signin");
        return;
      }

      const currentIds = getCachedSubscribedIds();
      const nextIds = currentIds.filter((id) => id !== channelId);
      updateCache(nextIds);
      setSubscribedIds(nextIds);

      try {
        const res = await fetch("/api/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId }),
        });
        if (res.status === 401) {
          router.push("/signin");
        } else if (res.ok) {
          fetchSubscriptions();
        }
      } catch (err) {
        console.error("Unsubscribe API failed:", err);
      }
    },
    [session?.user, router, fetchSubscriptions]
  );

  const toggleSubscription = useCallback(
    async (channelId: string) => {
      if (!session?.user) {
        router.push("/signin");
        return;
      }
      if (isSubscribed(channelId)) {
        await unsubscribe(channelId);
      } else {
        await subscribe(channelId);
      }
    },
    [session?.user, isSubscribed, subscribe, unsubscribe, router]
  );

  return {
    subscribedIds,
    channels,
    loading,
    isSubscribed,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
}
