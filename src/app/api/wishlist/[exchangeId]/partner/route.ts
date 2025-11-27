// src/app/api/wishlist/[exchangeId]/partner/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { PairingRepository } from "@/core/pairings/pairing.repository";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ exchangeId: string }> }
) {
  try {
    const { exchangeId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load active pairing
    const pairing = await PairingRepository.getActiveView(exchangeId);
    const pairs = pairing.rows;

    if (pairs.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No pairing exists" },
        { status: 400 }
      );
    }

    // Find my receiver
    const myPair = pairs.find((p: any) => p.giverId === session.sub);
    if (!myPair) {
      return NextResponse.json(
        { ok: false, error: "You are not part of the pairing" },
        { status: 403 }
      );
    }

    const receiverId = myPair.receiverId;
    const receiverName = myPair.receiverName;

    // Get partner wishlist
    const res = await WishlistRepository.getByUser(exchangeId, receiverId);

    return NextResponse.json({
      ok: true,
      partnerName: receiverName,
      items: res.rows,
    });

  } catch (err: any) {
    console.error("WISHLIST_PARTNER_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
