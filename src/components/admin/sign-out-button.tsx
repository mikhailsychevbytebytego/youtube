"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/signin");
        router.refresh();
      }}
      className="rounded-full border border-[#e5e5e5] px-4 py-1.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#f2f2f2]"
    >
      Sign out
    </button>
  );
}
