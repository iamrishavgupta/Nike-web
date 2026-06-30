"use client";

import { createAuthClient } from "better-auth/react";

function resolveBaseURL(): string {
  // In the browser, always use the current origin (works on any domain).
  if (typeof window !== "undefined") return window.location.origin;
  const raw =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
  // Ensure a protocol is present so createAuthClient gets a valid URL.
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
