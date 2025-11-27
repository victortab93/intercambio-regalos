// src/app/api/wishlist/[exchangeId]/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { query } from "@/lib/db";

import { queueEmail } from "@/lib/email/queueEmail";
import { wishlistUpdatedTemplate } from "@/lib/email/templates/WishListUpdated";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ exchangeId: string }> }
) {
  try {
    const { exchangeId } = await context.params;

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

    const userId = session.sub;

    // Parse request body
    const body = await req.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];

    // Normalize + validate items
    const cleanItems = rawItems
      .map((i: any) => ({
        title: typeof i.title === "string" ? i.title.trim() : "",
        description:
          typeof i.description === "string" ? i.description.trim() : null,
        url: typeof i.url === "string" ? i.url.trim() : null,
        price:
          typeof i.price === "number"
            ? i.price
            : typeof i.price === "string"
            ? Number(i.price)
            : null,
      }))
      .filter((i: any) => i.title.length > 0);

    // Load exchange to include name in email
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows[0];

    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Replace user wishlist
    await WishlistRepository.deleteUserWishlist(exchangeId, userId);

    if (cleanItems.length > 0) {
      await WishlistRepository.insertItems(exchangeId, userId, cleanItems);
    }

    // Notify giver if a pairing exists
    const pairingRes = await query<{
      giverEmail: string;
      giverName: string;
      receiverName: string;
    }>(
      `
      SELECT 
        g.email AS "giverEmail",
        g.name  AS "giverName",
        r.name  AS "receiverName"
      FROM pairing_runs pr
      JOIN pairing_pairs pp ON pp.pairing_run_id = pr.id
      JOIN users g ON g.id = pp.giver_id
      JOIN users r ON r.id = pp.receiver_id
      WHERE pr.exchange_id = $1
        AND pr.is_active = TRUE
        AND r.id = $2
      LIMIT 1
      `,
      [exchangeId, userId]
    );

    const pairing = pairingRes.rows[0];

    if (pairing && cleanItems.length > 0) {
      await queueEmail({
        to: pairing.giverEmail,
        subject: `Wishlist actualizada de ${pairing.receiverName}`,
        html: wishlistUpdatedTemplate({
          giverName: pairing.giverName,
          receiverName: pairing.receiverName,
          wishlist: cleanItems.map((i: any) => i.title),
          exchangeName: exchange.name,
        }),
      });
    }

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("SAVE_WISHLIST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
