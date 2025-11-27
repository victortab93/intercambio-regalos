// src/app/api/invite/join/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invite = searchParams.get("invite");

    if (!invite) {
      return NextResponse.json(
        { ok: false, error: "Missing invite code" },
        { status: 400 }
      );
    }

    // Check session
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Lookup exchange
    const exRes = await ExchangeRepository.findByInviteCode(invite);
    const exchange = exRes.rows[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Invalid invite" },
        { status: 404 }
      );
    }

    // Join exchange
    await ParticipantRepository.add(exchange.id, session.sub);

    return NextResponse.redirect(`/exchanges/${exchange.id}`);

  } catch (err: any) {
    console.error("JOIN_INVITE_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal join error" },
      { status: 500 }
    );
  }
}
