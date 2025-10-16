"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better-Auth client for React components
 * Provides hooks and methods for authentication in client components
 */
export const { signIn, signOut, useSession, signUp, $Infer } = createAuthClient(
  {
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  }
);

export type Session = typeof $Infer.Session;
