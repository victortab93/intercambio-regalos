// src/app/api/exchanges/[id]/participants/route.ts
import { NextResponse } from 'next/server';
import { ParticipantService } from '@/core/participants/participant.service';
import { requireUser } from '@/lib/auth-helpers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const result = await ParticipantService.list(params.id);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, participants: result.value });

  } catch (err) {
    console.error("GET /api/exchanges/[id]/participants error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
