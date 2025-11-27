// src/app/api/wishlist/[exchangeId]/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";
import { PairingRepository } from "@/core/pairings/pairing.repository";
import { queueEmail } from "@/lib/email/queueEmail";
import { wishlistUpdatedTemplate } from "@/lib/email/templates/WishListUpdated";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";


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

    const result = await WishlistRepository.getByUser(exchangeId, session.sub);

    return NextResponse.json({
      ok: true,
      items: result.rows,
    });

  } catch (err: any) {
    console.error("GET_MY_WISHLIST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    const normalized = items.map((it: any) => ({
      title: (it.title ?? "").trim(),
      description: it.description?.trim() ?? null,
      url: it.url?.trim() ?? null,
      price: it.price ?? null,
    }));

    // Load exchange for email template
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows[0];
    const exchangeName = exchange?.name ?? "";

    // Delete old items
    await WishlistRepository.deleteUserWishlist(exchangeId, session.sub);

    // Insert new items
    if (normalized.length > 0) {
      await WishlistRepository.insertItems(exchangeId, session.sub, normalized);
    }

    // Pairings
    const pairing = await PairingRepository.getActiveView(exchangeId);
    const pairs = pairing.rows;

    const myPair = pairs.find((p) => p.giverId === session.sub);

    if (myPair) {
      await queueEmail({
        to: myPair.receiverEmail,
        subject: `Wishlist updated`,
        html: wishlistUpdatedTemplate({
          giverName: myPair.giverName,
          receiverName: myPair.receiverName,
          wishlist: normalized,
          exchangeName,
        }),
      });
    }

    return NextResponse.json({
      ok: true,
      saved: normalized.length,
    });

  } catch (err: any) {
    console.error("PUT_MY_WISHLIST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

