// src/app/api/exchanges/[id]/participants/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

import { ParticipantRepository } from "@/core/participants/participant.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await context.params;

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

    // Verify exchange exists
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows?.[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Fetch participants
    const pRes = await ParticipantRepository.listByExchange(exchangeId);
    const participants = pRes.rows;

    return NextResponse.json({
      ok: true,
      participants,
    });

  } catch (err: any) {
    console.error("PARTICIPANTS_GET_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await context.params;

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

    // Verify exchange exists
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows?.[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Add participant (idempotent)
    await ParticipantRepository.add(exchangeId, session.sub);

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("PARTICIPANTS_POST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
