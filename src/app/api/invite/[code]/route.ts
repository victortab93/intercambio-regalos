// src/app/api/invite/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    // 1. Look up exchange by invite code
    const exRes = await ExchangeRepository.findByInviteCode(code);
    const exchange = exRes.rows[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // 2. Check if user is already logged in
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    // User is NOT logged in → UI must redirect to signup/login
    if (!session) {
      return NextResponse.json({
        ok: true,
        requireSignup: true,
        exchange: {
          id: exchange.id,
          name: exchange.name,
          eventDate: exchange.event_date,
          inviteCode: exchange.invite_code,
        },
      });
    }

    // 3. User is logged in → auto-join them to the exchange
    await ParticipantRepository.add(exchange.id, session.sub);

    return NextResponse.json({
      ok: true,
      requireSignup: false,
      exchange: {
        id: exchange.id,
        name: exchange.name,
        eventDate: exchange.event_date,
        inviteCode: exchange.invite_code,
      },
    });

  } catch (err: any) {
    console.error("INVITE_CODE_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
