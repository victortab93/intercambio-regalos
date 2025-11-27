// src/app/api/wishlist/[exchangeId]/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";

export async function GET(
  req: Request,
  { params }: { params: { exchangeId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exchangeId = params.exchangeId;

    const res = await WishlistRepository.getByUser(exchangeId, session.sub);

    return NextResponse.json({
      ok: true,
      items: res.rows
    });

  } catch (err: any) {
    console.error("WISHLIST_ME_GET_ERROR:", err);
    return NextResponse.json({ ok: false, error: "Internal error" });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { exchangeId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exchangeId = params.exchangeId;
    const body = await req.json();
    const items = body.items ?? [];

    // Clear first then insert
    await WishlistRepository.deleteUserWishlist(exchangeId, session.sub);
    await WishlistRepository.insertItems(exchangeId, session.sub, items);

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("WISHLIST_ME_POST_ERROR:", err);
    return NextResponse.json({ ok: false, error: "Internal error" });
  }
}
