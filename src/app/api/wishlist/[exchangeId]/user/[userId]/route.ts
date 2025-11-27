// src/app/api/wishlist/[exchangeId]/user/[userId]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { query } from "@/lib/db";

/**
 * GET — Get the wishlist of ANOTHER user (receiver)
 *
 * Only the following can see:
 * - The owner of the exchange
 * - The "giver" assigned to this receiver (in the active pairing)
 */
export async function GET(
  req: Request,
  { params }: { params: { exchangeId: string; userId: string } }
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
    const receiverId = params.userId;
    const requesterId = session.sub;

    //
    // 1) Validate exchange exists
    //
    const exchangeQuery = await ExchangeRepository.findById(exchangeId);
    const exchange = exchangeQuery.rows[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    //
    // 2) Check if requester is exchange owner
    //
    const isOwner = exchange.owner_id === requesterId;

    if (!isOwner) {
      //
      // 3) Validate pairing: requester must be giver of receiver
      //
      const pairingQuery = await query<{
        giverId: string;
      }>(
        `
        SELECT pp.giver_id AS "giverId"
        FROM pairing_runs pr
        JOIN pairing_pairs pp ON pp.pairing_run_id = pr.id
        WHERE pr.exchange_id = $1
          AND pr.is_active = TRUE
          AND pp.receiver_id = $2
        LIMIT 1
        `,
        [exchangeId, receiverId]
      );

      const pairing = pairingQuery.rows[0];

      if (!pairing || pairing.giverId !== requesterId) {
        return NextResponse.json(
          { ok: false, error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    //
    // 4) Load wishlist of the receiver
    //
    const wishlistQuery = await WishlistRepository.getByUser(
      exchangeId,
      receiverId
    );
    const items = wishlistQuery.rows;

    return NextResponse.json({
      ok: true,
      receiverId,
      items,
    });
  } catch (err: any) {
    console.error("WISHLIST_RECEIVER_GET_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
