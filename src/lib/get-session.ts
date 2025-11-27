// src/lib/get-session.ts
import { cookies } from "next/headers";
import { verifySession, decodeSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

/**
 * getSession()
 * -----------------------------------------------------------------------------
 * Safe SSR session getter for Server Components, Layouts, Pages and Actions.
 *
 *  ✔ Reads cookie server-side
 *  ✔ Verifies JWT signature (secure)
 *  ✔ Returns SessionPayload or null
 *  ✔ Handles decoding errors safely
 *  ✔ Works with App Router
 *  ✔ Supports optimization via decode-first (optional)
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return null;

    // Optional fast path: decode without validating signature
    // const soft = decodeSession(token);
    // if (soft) return soft;

    // Validate signature (secure)
    const session = verifySession(token);

    return session;
  } catch (err) {
    console.error("getSession() error:", err);
    return null;
  }
}
