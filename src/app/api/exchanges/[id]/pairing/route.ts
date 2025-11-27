// src/app/api/exchanges/[id]/pairing/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";
import { PairingRepository } from "@/core/pairings/pairing.repository";

import { queueEmail } from "@/lib/email/queueEmail";
import { pairingCreatedTemplate } from "@/lib/email/templates/pairingCreated";

// ----------------------------------------------
// Helper: generate cyclic pairing (giver → receiver)
// ----------------------------------------------
function generatePairs(participants: { id: string; name: string; email: string }[]) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  return shuffled.map((giver, i) => {
    const receiver = shuffled[(i + 1) % shuffled.length];
    return {
      giverId: giver.id,
      giverName: giver.name,
      giverEmail: giver.email,
      receiverId: receiver.id,
      receiverName: receiver.name,
    };
  });
}

// ----------------------------------------------
// POST: create pairing (only owner)
// ----------------------------------------------
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load exchange
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Only owner can generate pairing
    if (exchange.owner_id !== session.sub) {
      return NextResponse.json(
        { ok: false, error: "Not owner" },
        { status: 403 }
      );
    }

    // Check active pairing
    const activeRes = await PairingRepository.findActive(exchangeId);
    if (activeRes.rows.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Pairing already exists" },
        { status: 400 }
      );
    }

    // Load participants
    const pRes = await ParticipantRepository.listByExchange(exchangeId);
    const participants = pRes.rows;
    if (participants.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Need at least 2 participants" },
        { status: 400 }
      );
    }

    // Generate run
    const runRes = await PairingRepository.createRun(exchangeId);
    const run = runRes.rows[0];
    if (!run) {
      return NextResponse.json(
        { ok: false, error: "Failed to create pairing run" },
        { status: 500 }
      );
    }

    // Generate pairs
    const pairs = generatePairs(
      participants.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
      }))
    );

    // Persist pairs
    await PairingRepository.savePairs(
      run.id,
      pairs.map((p) => ({
        giverId: p.giverId,
        receiverId: p.receiverId,
      }))
    );

    // Queue emails in background
    for (const p of pairs) {
      await queueEmail({
        to: p.giverEmail,
        subject: `Tu pareja del intercambio ${exchange.name}`,
        html: pairingCreatedTemplate({
          giverName: p.giverName,
          receiverName: p.receiverName,
          exchangeName: exchange.name,
        }),
      });
    }

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("PAIRING_POST_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------
// DELETE: delete active pairing (only owner)
// ----------------------------------------------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load exchange
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Only owner
    if (exchange.owner_id !== session.sub) {
      return NextResponse.json(
        { ok: false, error: "Not owner" },
        { status: 403 }
      );
    }

    // Mark runs as inactive (soft delete)
    await PairingRepository.deleteActive(exchangeId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PAIRING_DELETE_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------
// GET: view pairing (owner sees all; participant sees only own pair)
// ----------------------------------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exchangeId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load exchange
    const exRes = await ExchangeRepository.findById(exchangeId);
    const exchange = exRes.rows[0];
    if (!exchange) {
      return NextResponse.json(
        { ok: false, error: "Exchange not found" },
        { status: 404 }
      );
    }

    const isOwner = exchange.owner_id === session.sub;

    // Load current pairing view
    const pairingRes = await PairingRepository.getActiveView(exchangeId);
    const pairs = pairingRes.rows;

    if (pairs.length === 0) {
      return NextResponse.json({
        ok: true,
        owner: isOwner,
        pairs: [],
        myPair: null,
      });
    }

    if (isOwner) {
      return NextResponse.json({
        ok: true,
        owner: true,
        pairs,
      });
    }

    const myPair = pairs.find((p) => p.giverId === session.sub) ?? null;

    return NextResponse.json({
      ok: true,
      owner: false,
      myPair,
    });
  } catch (err: any) {
    console.error("PAIRING_GET_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
