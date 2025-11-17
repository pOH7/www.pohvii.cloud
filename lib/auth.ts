import { betterAuth } from "better-auth";

/**
 * Better-Auth configuration with GitHub OAuth provider
 * Uses JWT-based sessions (no database required)
 */
export const auth = betterAuth({
  // Base URL for the auth API
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Secret key for signing JWTs (must be at least 32 characters)
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "dev-secret-key-change-in-production-min-32-chars",

  // Explicitly use memory adapter (suppresses warning)
  database: undefined,

  // Use JWT sessions stored in HTTP-only cookies (no database)
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  // Email/password disabled - GitHub OAuth only
  emailAndPassword: {
    enabled: false,
  },

  // Social OAuth providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

/**
 * Type for user session data
 */
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
