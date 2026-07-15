"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cat } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  errorClass,
  inputClass,
  labelClass,
  submitClass,
} from "@/components/admin/form-styles";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result =
      mode === "signin"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password });

    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Something went wrong, try again.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff0000]">
          <Cat className="size-5 text-white" />
        </span>
        <span className="text-lg font-bold text-[#0f0f0f]">MewTube</span>
      </Link>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[#e5e5e5] p-6"
      >
        <h1 className="text-xl font-bold text-[#0f0f0f]">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>

        {error && <p className={errorClass}>{error}</p>}

        {mode === "signup" && (
          <label className={labelClass}>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </label>
        )}
        <label className={labelClass}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
          />
        </label>

        <button type="submit" disabled={pending} className={submitClass}>
          {pending
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="self-start text-sm text-[#065fd4] hover:underline"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
