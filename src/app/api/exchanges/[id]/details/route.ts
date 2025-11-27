// src/app/api/exchanges/[id]/details/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";
import { PairingRepository } from "@/core/pairings/pairing.repository";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // NOTE: params is a Promise according to the generated RouteHandlerConfig
    const { id: exchangeId } = await context.params;

    // Session
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Exchange info
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Participants
    const pRes = await ParticipantRepository.listByExchange(exchangeId);
    const participants = pRes.rows;

    // Pairing (optional)
    const pairingRes = await PairingRepository.getActiveView(exchangeId);
    const pairing = pairingRes.rows;

    return NextResponse.json({
      ok: true,
      exchange,
      participants,
      pairing,
    });
  } catch (err: any) {
    console.error("DETAILS_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
