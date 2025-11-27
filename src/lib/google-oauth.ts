// src/lib/google-oauth.ts
import { randomId } from "@/lib/utils";

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g. https://tuapp.com/api/auth/google/callback

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error("Missing Google OAuth env vars (GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI)");
}

export interface GoogleStateData {
  invite?: string;
  redirect?: string;
  nonce?: string;
}

export function encodeState(data: GoogleStateData): string {
  const json = JSON.stringify(data);
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeState(state: string | null): GoogleStateData | null {
  if (!state) return null;
  try {
    const json = Buffer.from(state, "base64url").toString("utf8");
    return JSON.parse(json) as GoogleStateData;
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(invite?: string, redirectPath: string = "/exchanges") {
  const nonce = randomId(12);

  const state: GoogleStateData = {
    invite,
    redirect: redirectPath,
    nonce
  };

  const params = new URLSearchParams({
    client_id: String(GOOGLE_CLIENT_ID),
    redirect_uri: String(GOOGLE_REDIRECT_URI),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    include_granted_scopes: "true",
    state: encodeState(state),
    prompt: "consent"
  });
  

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID!,
    client_secret: GOOGLE_CLIENT_SECRET!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code"
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Google token error:", text);
    throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  }

  return res.json() as Promise<{
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
  }>;
}

export async function fetchGoogleUser(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Google userinfo error:", text);
    throw new Error("GOOGLE_USERINFO_FAILED");
  }

  return res.json() as Promise<{
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  }>;
}
