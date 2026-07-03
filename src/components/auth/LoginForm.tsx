"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Cat } from "lucide-react";

import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: callbackUrl,
        });

        if (result.error) {
          setError(result.error.message ?? "Could not create account.");
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: callbackUrl,
        });

        if (result.error) {
          setError(result.error.message ?? "Invalid email or password.");
          return;
        }
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9f9] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 shadow-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex items-start rounded-lg bg-red-600 p-1">
            <Cat className="size-5 text-white" />
          </span>
          <span className="text-xl font-bold text-black">MeowTube</span>
        </Link>

        <h1 className="mb-2 text-center text-2xl font-semibold text-[#0f0f0f]">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </h1>
        <p className="mb-6 text-center text-sm text-[#606060]">
          {mode === "sign-in"
            ? "Welcome back to the purr-fect place for cat videos."
            : "Join MeowTube and start watching cat content."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "sign-up" && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f]"
                placeholder="Whiskers McFluff"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#0f0f0f]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[#0f0f0f] outline-none focus:border-[#0f0f0f]"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0f0f0f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#272727] disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#606060]">
          {mode === "sign-in" ? "New to MeowTube?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError(null);
            }}
            className="font-medium text-[#0f0f0f] underline-offset-2 hover:underline"
          >
            {mode === "sign-in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
