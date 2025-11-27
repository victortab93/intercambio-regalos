// src/app/api/exchanges/[id]/route.ts
import { NextResponse } from 'next/server';
import { ExchangeService } from '@/core/exchanges/exchange.service';
import { requireUser } from '@/lib/auth-helpers';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id: exchangeId } = await context.params;
    
    const result = await ExchangeService.getById(exchangeId);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ ok: true, exchange: result.value });

  } catch (err) {
    console.error("GET /api/exchanges/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
