import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { PairingRepository } from "@/core/pairings/pairing.repository";
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

    // Load pairing
    const pairing = await PairingRepository.getActiveView(exchangeId);
    const pairs = pairing.rows;

    if (pairs.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No pairing exists" },
        { status: 400 }
      );
    }

    // Find who is YOUR receiver
    const myPair = pairs.find((p: any) => p.giverId === session.sub);

    if (!myPair) {
      return NextResponse.json(
        { ok: false, error: "You are not part of the pairing" },
        { status: 403 }
      );
    }

    const receiverId = (myPair as any).receiverId;
    const receiverName = myPair.receiverName;

    // Get wishlist
    const res = await WishlistRepository.getByUser(exchangeId, receiverId);

    return NextResponse.json({
      ok: true,
      partnerName: receiverName,
      items: res.rows
    });

  } catch (err) {
    console.error("PARTNER_WISHLIST_ERROR:", err);
    return NextResponse.json({ ok: false, error: "Internal error" });
  }
}
