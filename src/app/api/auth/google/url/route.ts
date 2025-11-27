// src/app/api/auth/google/url/route.ts

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const invite = searchParams.get("invite") ?? "";
  const redirect = searchParams.get("redirect") ?? "/exchanges";

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleRedirect = process.env.GOOGLE_REDIRECT_URL;

  if (!googleClientId || !googleRedirect) {
    console.error("❌ Missing Google OAuth env vars");
    return NextResponse.json(
      { ok: false, error: "Google OAuth not configured" },
      { status: 500 }
    );
  }

  // ---------------------------------------------------
  // IMPORTANT:
  // state = JSON string allows multiple parameters
  // and avoids errors with "&" inside invite codes
  // ---------------------------------------------------
  const state = JSON.stringify({ invite, redirect });

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${googleClientId}` +
    `&redirect_uri=${encodeURIComponent(googleRedirect)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&state=${encodeURIComponent(state)}`;

  return NextResponse.json({ ok: true, url });
}
