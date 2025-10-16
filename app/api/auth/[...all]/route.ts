import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better-Auth API route handler for Next.js App Router
 *
 * Handles all authentication endpoints:
 * - /api/auth/signin/github - Initiate GitHub OAuth
 * - /api/auth/callback/github - OAuth callback
 * - /api/auth/signout - Sign out
 * - /api/auth/session - Get current session
 * - /api/auth/refresh - Refresh session
 */
export const { GET, POST } = toNextJsHandler(auth);
