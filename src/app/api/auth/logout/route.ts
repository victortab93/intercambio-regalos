// src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Remove session cookie
    cookieStore.set("session", "", clearSessionCookieOptions());

    return NextResponse.json({ ok: true, message: "Logged out" });
  } catch (err: any) {
    console.error("AUTH_LOGOUT_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
