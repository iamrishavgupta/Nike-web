"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // In the browser, always use the current origin so it works on any domain
  // (localhost, Vercel preview, production) without extra config.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
