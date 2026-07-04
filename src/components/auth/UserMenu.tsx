"use client";

import { Image } from "@/components/Image";
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
      <div className="size-8 animate-pulse rounded-full bg-muted" aria-hidden />
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-hover"
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
        className="hidden rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-border sm:inline-flex"
      >
        Upload
      </Link>
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
        className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
