// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { signSession } from "@/lib/auth";
import { createSessionCookieOptions } from "@/lib/auth";

import { UserRepository } from "@/core/users/user.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const invite =
      typeof body.invite === "string" ? body.invite : null;

    // ------------------------------------
    // 1. Validar campos
    // ------------------------------------
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing email or password" },
        { status: 400 }
      );
    }

    // ------------------------------------
    // 2. Buscar usuario por email
    // ------------------------------------
    const userRes = await UserRepository.findByEmail(email);
    const user = userRes.rows[0];

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // ------------------------------------
    // 3. Comparar password
    // ------------------------------------
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // ------------------------------------
    // 4. Crear JWT + Cookie
    // ------------------------------------
    const token = signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, createSessionCookieOptions());

    // ------------------------------------
    // 5. Auto-join si viene invite
    // ------------------------------------
    let joinedByInvite = false;

    if (invite) {
      const exRes = await ExchangeRepository.findByInviteCode(invite);
      const exchange = exRes.rows[0];

      if (exchange) {
        await ParticipantRepository.add(exchange.id, user.id);
        joinedByInvite = true;
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      joinedByInvite,
    });
  } catch (err: any) {
    console.error("AUTH_LOGIN_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
