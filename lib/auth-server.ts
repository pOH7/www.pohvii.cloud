import "server-only";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Get the current user session from server components
 * Reads JWT from HTTP-only cookies
 *
 * @returns Session object if authenticated, null otherwise
 */
export async function getSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session?.user !== null && session?.user !== undefined;
}
