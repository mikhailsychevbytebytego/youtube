"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { profileAvatar } from "@/lib/meowtube-data";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return (
      <div className="size-8 animate-pulse rounded-full bg-[#e5e5e5]" aria-hidden />
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-[#e5e5e5] px-4 py-1.5 text-sm font-medium text-[#0f0f0f] transition-colors hover:bg-[#f8f8f8]"
      >
        Sign in
      </Link>
    );
  }

  const avatar = session.user.image ?? profileAvatar;
  const name = session.user.name ?? session.user.email;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/upload"
        className="hidden rounded-full bg-[#f2f2f2] px-4 py-1.5 text-sm font-medium text-[#0f0f0f] transition-colors hover:bg-[#e5e5e5] sm:inline-flex"
      >
        Upload
      </Link>
      <span className="hidden max-w-[140px] truncate text-sm text-[#0f0f0f] sm:inline">
        {name}
      </span>
      <Link href="/admin" aria-label="Open admin" className="flex">
        <Image
          src={avatar}
          alt={name}
          width={32}
          height={32}
          className="size-8 rounded-full object-cover"
        />
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full px-3 py-1.5 text-sm font-medium text-[#606060] transition-colors hover:bg-[#f8f8f8] hover:text-[#0f0f0f]"
      >
        Sign out
      </button>
    </div>
  );
}
