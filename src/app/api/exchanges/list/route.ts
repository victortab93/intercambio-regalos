// src/app/api/exchanges/list/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const res = await ExchangeRepository.listByOwner(session.sub);
    const exchanges = res.rows;

    return NextResponse.json({
      ok: true,
      exchanges
    });
  } catch (err: any) {
    console.error("ERROR_EXCHANGE_LIST:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
