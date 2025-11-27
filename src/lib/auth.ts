// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { z } from "zod";

// ----------------------------------------------
// TYPES
// ----------------------------------------------
export interface SessionPayload {
  sub: string;        // user id
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

const SessionSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  name: z.string(),
});

// ----------------------------------------------
// ENV VALIDATION
// ----------------------------------------------
if (!process.env.JWT_SECRET) {
  throw new Error("❌ Missing JWT_SECRET in environment");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "30d"; // default expiration
const EDGE_SECRET = new TextEncoder().encode(JWT_SECRET);

// ----------------------------------------------
// SIGN SESSION (Node runtime)
// ----------------------------------------------
export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

// ----------------------------------------------
// VERIFY SESSION (Node / API routes)
// ----------------------------------------------
export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch (err) {
    console.error("verifySession error:", err);
    return null;
  }
}

// ----------------------------------------------
// VERIFY SESSION (Edge / Middleware)
// ----------------------------------------------
export async function verifyJwtEdge(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, EDGE_SECRET);

    const parsed = SessionSchema.safeParse(payload);
    if (!parsed.success) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

// ----------------------------------------------
// DECODE (no signature verification)
// ----------------------------------------------
export function decodeSession(token: string): SessionPayload | null {
  try {
    return jwt.decode(token) as SessionPayload | null;
  } catch {
    return null;
  }
}

// ----------------------------------------------
// CREATE SESSION COOKIE OPTIONS
// ----------------------------------------------
export function createSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

// ----------------------------------------------
// CLEAR SESSION COOKIE OPTIONS
// ----------------------------------------------
export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  };
}

