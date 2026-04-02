"use client";

import { createAuthClient } from "better-auth/react";

const authClientConfig = {
  basePath: "/api/auth",
  ...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? { baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL }
    : {}),
};

/**
 * Better-Auth client for React components
 * Provides hooks and methods for authentication in client components
 */
export const { signIn, signOut, useSession, signUp, $Infer } =
  createAuthClient(authClientConfig);

export type Session = typeof $Infer.Session;
