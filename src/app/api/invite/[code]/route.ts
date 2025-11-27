// src/app/api/invite/[code]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

//
// GET → Validar código de invitación y manejar auto-join si ya está logueado
//
// /api/invite/[code]
//
export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const inviteCode = params.code;

    //
    // 1) Buscar intercambio por código
    //
    const exchangeQuery = await ExchangeRepository.findByInviteCode(inviteCode);
    const exchange = exchangeQuery.rows[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Invalid invite code" },
        { status: 404 }
      );
    }

    //
    // 2) Validar sesión (si existe)
    //
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      //
      // Usuario NO logueado → devolver datos del intercambio
      // La UI mostrará "Login o Regístrate para unirte"
      //
      return NextResponse.json({
        ok: true,
        requiresAuth: true,
        exchange: {
          id: exchange.id,
          name: exchange.name,
          eventDate: exchange.event_date,
        },
      });
    }

    //
    // 3) Auto-join si ya tiene sesión
    //
    await ParticipantRepository.add(exchange.id, session.sub);

    return NextResponse.json({
      ok: true,
      requiresAuth: false,
      joined: true,
      exchange: {
        id: exchange.id,
        name: exchange.name,
        eventDate: exchange.event_date,
      },
    });
  } catch (err: any) {
    console.error("INVITE_GET_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
