// src/app/api/exchanges/route.ts
import { NextResponse } from 'next/server';
import { ExchangeService } from '@/core/exchanges/exchange.service';
import { requireUser } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const result = await ExchangeService.listByOwner(user.sub);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, exchanges: result.value });

  } catch (err) {
    console.error("GET /api/exchanges error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const result = await ExchangeService.create({
      ...body,
      ownerId: user.sub
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, exchange: result.value });

  } catch (err) {
    console.error("POST /api/exchanges error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
