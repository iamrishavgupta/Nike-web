"use client";

import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

type Props = { variant?: "sign-in" | "sign-up" };

type Provider = "google" | "apple";

export default function SocialProviders({ variant = "sign-in" }: Props) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocial = async (provider: Provider) => {
    setError(null);
    setLoading(provider);
    try {
      const res = await authClient.signIn.social({ provider, callbackURL: "/" });
      // If configured correctly the browser redirects to the provider and we
      // never reach here. If we do, the provider returned an error instead.
      if (res?.error) {
        setError(
          `${provider === "google" ? "Google" : "Apple"} sign-in isn't configured yet. Add its OAuth keys to .env.local and restart the dev server.`
        );
        setLoading(null);
      }
    } catch {
      setError(
        `${provider === "google" ? "Google" : "Apple"} sign-in isn't configured yet. Add its OAuth keys to .env.local and restart the dev server.`
      );
      setLoading(null);
    }
  };

  const actionLabel = variant === "sign-in" ? "Continue" : "Sign up";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleSocial("google")}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 transition hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-dark-900/10 disabled:opacity-60"
        aria-label={`${actionLabel} with Google`}
      >
        <Image src="/google.svg" alt="" width={18} height={18} />
        <span>{loading === "google" ? "Redirecting…" : `${actionLabel} with Google`}</span>
      </button>
      <button
        type="button"
        onClick={() => handleSocial("apple")}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 transition hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-dark-900/10 disabled:opacity-60"
        aria-label={`${actionLabel} with Apple`}
      >
        <Image src="/apple.svg" alt="" width={18} height={18} />
        <span>{loading === "apple" ? "Redirecting…" : `${actionLabel} with Apple`}</span>
      </button>

      {error && <p className="text-caption text-[color:var(--color-red)]">{error}</p>}
    </div>
  );
}
