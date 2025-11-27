// src/app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { signSession } from "@/lib/auth";
import { createSessionCookieOptions } from "@/lib/auth";

import { UserRepository } from "@/core/users/user.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

import type { CreateUserInput } from "@/core/users/user.types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const invite =
      typeof body.invite === "string" ? body.invite : null;

    // ------------------------------------
    // 1. Validación
    // ------------------------------------
    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ------------------------------------
    // 2. Email debe ser único
    // ------------------------------------
    const existing = await UserRepository.findByEmail(email);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // ------------------------------------
    // 3. Hash de la contraseña
    // ------------------------------------
    const password_hash = await bcrypt.hash(password, 10);

    const input: CreateUserInput = {
      name,
      email,
      password_hash,
      google_id: null,
    };

    // ------------------------------------
    // 4. Crear usuario
    // ------------------------------------
    const createRes = await UserRepository.create(input);
    const user = createRes.rows[0];

    // ------------------------------------
    // 5. Crear sesión JWT + cookie httpOnly
    // ------------------------------------
    const token = signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, createSessionCookieOptions());

    // ------------------------------------
    // 6. Auto-join si viene INVITE
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
    console.error("AUTH_SIGNUP_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
