// src/app/api/exchanges/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    // Load session
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Read body
    const data = await req.json();
    const { name, eventDate } = data ?? {};

    if (!name || !eventDate) {
      return NextResponse.json(
        { ok: false, error: "Missing name or eventDate" },
        { status: 400 }
      );
    }

    // Generate invite code
    const inviteCode = generateInviteCode();

    // Create exchange
    const exRes = await ExchangeRepository.create(
      session.sub,
      name,
      eventDate,
      inviteCode
    );

    const exchange = exRes.rows?.[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Failed to create exchange" },
        { status: 500 }
      );
    }

    // Add owner as participant
    await ParticipantRepository.add(exchange.id, session.sub);

    return NextResponse.json({
      ok: true,
      exchange,
    });

  } catch (err: any) {
    console.error("EXCHANGE_CREATE_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
