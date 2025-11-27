// src/app/api/auth/google/callback/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  signSession,
  createSessionCookieOptions
} from "@/lib/auth";

import { UserRepository } from "@/core/users/user.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const rawState = searchParams.get("state");

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Missing `code` from Google OAuth" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 1. Parse JSON state: { invite, redirect }
    // ---------------------------------------------------
    let invite: string | null = null;
    let redirect: string = "/exchanges";

    try {
      if (rawState) {
        const parsed = JSON.parse(rawState);
        invite = parsed.invite ?? null;
        redirect = parsed.redirect ?? "/exchanges";
      }
    } catch (e) {
      console.warn("Invalid state JSON");
    }

    // ---------------------------------------------------
    // 2. Exchange code for access token
    // ---------------------------------------------------
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        grant_type: "authorization_code"
      })
    });

    const tokenJson = await tokenRes.json();

    if (!tokenJson.access_token) {
      console.error("GOOGLE_TOKEN_ERROR:", tokenJson);
      return NextResponse.json(
        { ok: false, error: "Google token exchange failed" },
        { status: 500 }
      );
    }

    // ---------------------------------------------------
    // 3. Get profile from Google
    // ---------------------------------------------------
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`
        }
      }
    );

    const googleUser = await profileRes.json();

    if (!googleUser.email) {
      return NextResponse.json(
        { ok: false, error: "Google account has no email" },
        { status: 400 }
      );
    }

    const email = googleUser.email.toLowerCase();
    const google_id = googleUser.id;
    const name = googleUser.name || "User";

    // ---------------------------------------------------
    // 4. Check if user exists
    // ---------------------------------------------------
    const existingRes = await UserRepository.findByEmail(email);
    let user = existingRes.rows[0];

    if (!user) {
      // Create new user with google_id
      const createRes = await UserRepository.create({
        email,
        name,
        google_id,
        password_hash: null
      });

      user = createRes.rows[0];
    } else {
      // User exists → ensure google_id is linked
      if (!user.google_id) {
        const updateRes = await UserRepository.updateGoogleId(email, google_id);
        user = updateRes.rows[0];
      }

      // Security: mismatched google_id
      if (user.google_id !== google_id) {
        return NextResponse.json(
          {
            ok: false,
            error: "This Google account is linked to another login method"
          },
          { status: 403 }
        );
      }
    }

    // ---------------------------------------------------
    // 5. Create JWT session + cookie
    // ---------------------------------------------------
    const jwtToken = signSession({
      sub: user.id,
      email: user.email,
      name: user.name
    });

    const cookieStore = await cookies();
    cookieStore.set("session", jwtToken, createSessionCookieOptions());

    // ---------------------------------------------------
    // 6. Auto-join exchange if `invite` present
    // ---------------------------------------------------
    if (invite) {
      const exRes = await ExchangeRepository.findByInviteCode(invite);
      const exchange = exRes.rows[0];

      if (exchange) {
        await ParticipantRepository.add(exchange.id, user.id);
      }
    }

    // ---------------------------------------------------
    // 7. Redirect to client page
    // ---------------------------------------------------
    return NextResponse.redirect(redirect);

  } catch (err: any) {
    console.error("GOOGLE_CALLBACK_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal Google callback error" },
      { status: 500 }
    );
  }
}
