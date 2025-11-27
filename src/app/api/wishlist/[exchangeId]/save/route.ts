// src/app/api/wishlist/[exchangeId]/save/route.ts
import { NextResponse } from 'next/server';
import { WishlistService } from '@/core/wishlist/wishlist.service';
import { requireUser } from '@/lib/auth-helpers';

export async function POST(
  req: Request,
  { params }: { params: { exchangeId: string } }
) {
  try {
    const user = await requireUser();
    if (!user)
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const result = await WishlistService.save({
      exchangeId: params.exchangeId,
      userId: user.sub,
      items: body.items
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('POST /api/wishlist/[exchangeId]/save error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
