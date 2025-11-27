// src/app/api/wishlist/[exchangeId]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { WishlistRepository } from "@/core/wishlist/wishlist.repository";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { PairingRepository } from "@/core/pairings/pairing.repository";
import { queueEmail } from "@/lib/email/queueEmail";
import { wishlistUpdatedTemplate } from "@/lib/email/templates/WishListUpdated";
import { query } from "@/lib/db"; // si prefieres no tocar PairingRepository

// ---------------------------------------------
// GET  /api/wishlist/[exchangeId]
// Devuelve la wishlist del usuario actual
// ---------------------------------------------
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

    // Obtener wishlist del usuario actual
    const wishlistResult = await WishlistRepository.getByUser(
      exchangeId,
      session.sub
    );
    const items = wishlistResult.rows;

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("WISHLIST_GET_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------
// POST /api/wishlist/[exchangeId]
// Guarda la wishlist del usuario actual
// y notifica a su "giver" si existe pairing
// ---------------------------------------------
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
    const userId = session.sub;

    const body = await req.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];

    // Normalizar / validar items
    const cleanItems = rawItems
      .map((i: any) => ({
        title: typeof i.title === "string" ? i.title.trim() : "",
        description:
          typeof i.description === "string" ? i.description.trim() : undefined,
        url: typeof i.url === "string" ? i.url.trim() : undefined,
        price:
          typeof i.price === "number"
            ? i.price
            : typeof i.price === "string"
            ? Number(i.price)
            : undefined,
      }))
      .filter((i : any) => i.title.length > 0);

    // Asegurar que el intercambio existe (y obtener nombre para el correo)
    const exchangeQuery = await ExchangeRepository.findById(exchangeId);
    const exchange = exchangeQuery.rows[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // 1) Borrar wishlist anterior del usuario
    await WishlistRepository.deleteUserWishlist(exchangeId, userId);

    // 2) Insertar nuevos items (si hay)
    if (cleanItems.length > 0) {
      await WishlistRepository.insertItems(exchangeId, userId, cleanItems);
    }

    // 3) Intentar notificar a su "giver" (si existe pairing activo)
    // Buscamos el giver de este "receiver" usando SQL directo
    // (evitamos tocar PairingRepository para no romper nada)
    const pairingQuery = await query<{
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

    const pairingRow = pairingQuery.rows[0];

    if (pairingRow && cleanItems.length > 0) {
      const wishlistTitles = cleanItems.map((i : any) => i.title);

      await queueEmail({
        to: pairingRow.giverEmail,
        subject: `Wishlist actualizada de ${pairingRow.receiverName}`,
        html: wishlistUpdatedTemplate({
          giverName: pairingRow.giverName,
          receiverName: pairingRow.receiverName,
          wishlist: wishlistTitles,
          exchangeName: exchange.name,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("WISHLIST_POST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
