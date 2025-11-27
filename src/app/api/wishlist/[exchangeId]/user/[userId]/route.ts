// src/app/api/wishlist/[exchangeId]/user/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ exchangeId: string; userId: string }> }
) {
  try {
    const { exchangeId, userId } = await context.params;

    // Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load exchange to check owner permissions
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows?.[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Only owner may view another participant's wishlist
    if (exchange.owner_id !== session.sub) {
      return NextResponse.json(
        { ok: false, error: "Forbidden — Only the owner may view this wishlist" },
        { status: 403 }
      );
    }

    // Validate the target user IS a participant of this exchange
    const isParticipantRes = await ParticipantRepository.isParticipant(
      exchangeId,
      userId
    );

    if (isParticipantRes.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "This user is not part of this exchange" },
        { status: 400 }
      );
    }

    // Load wishlist
    const wishlistRes = await WishlistRepository.getByUser(exchangeId, userId);

    return NextResponse.json({
      ok: true,
      items: wishlistRes.rows,
    });

  } catch (err: any) {
    console.error("ADMIN_USER_WISHLIST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
