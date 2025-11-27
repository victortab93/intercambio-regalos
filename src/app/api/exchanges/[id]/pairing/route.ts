import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { ExchangeRepository } from "@/core/exchanges/exchange.repository";
import { ParticipantRepository } from "@/core/participants/participant.repository";
import { PairingRepository } from "@/core/pairings/pairing.repository";

import { queueEmail } from "@/lib/email/queueEmail";
import { pairingCreatedTemplate } from "@/lib/email/templates/pairingCreated";

// helper to create giver→receiver pairs
function generatePairs(participants: { id: string; name: string; email: string }[]) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  const pairs = [];

  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = i === shuffled.length - 1 ? shuffled[0] : shuffled[i + 1];

    pairs.push({
      giverId: giver.id,
      giverName: giver.name,
      giverEmail: giver.email,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverEmail: receiver.email,
    });
  }

  return pairs;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const exchangeId = params.id;

    // LOAD EXCHANGE
    const exchangeQuery = await ExchangeRepository.findById(exchangeId);
    const exchange = exchangeQuery.rows[0];
    if (!exchange) {
      return NextResponse.json({ ok: false, error: "Exchange not found" }, { status: 404 });
    }

    // OWNER VALIDATION
    if (exchange.owner_id !== session.sub) {
      return NextResponse.json({ ok: false, error: "Not owner" }, { status: 403 });
    }

    // CHECK ACTIVE PAIRING
    const active = await PairingRepository.findActive(exchangeId);
    if (active.rows.length > 0) {
      return NextResponse.json({ ok: false, error: "Pairing already exists" }, { status: 400 });
    }

    // LOAD PARTICIPANTS
    const participantsQuery = await ParticipantRepository.listByExchange(exchangeId);
    const participants = participantsQuery.rows;

    if (participants.length < 2) {
      return NextResponse.json({ ok: false, error: "Need at least 2 participants" }, { status: 400 });
    }

    // CREATE PAIRING RUN
    const runQuery = await PairingRepository.createRun(exchangeId);
    const run = runQuery.rows[0];

    // GENERATE PAIRS
    const pairs = generatePairs(participants);

    // SAVE PAIRS
    await PairingRepository.savePairs(run.id, pairs);

    // SEND EMAILS IN BACKGROUND
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
    return NextResponse.json({ ok: false, error: err.message });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const exchangeId = params.id;

    const exchangeQuery = await ExchangeRepository.findById(exchangeId);
    const exchange = exchangeQuery.rows[0];

    if (!exchange) {
      return NextResponse.json({ ok: false, error: "Exchange not found" }, { status: 404 });
    }

    if (exchange.owner_id !== session.sub) {
      return NextResponse.json({ ok: false, error: "Not owner" }, { status: 403 });
    }

    await PairingRepository.deleteActive(exchangeId);

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("PAIRING_DELETE_ERROR:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const exchangeId = params.id;

    const exchangeQuery = await ExchangeRepository.findById(exchangeId);
    const exchange = exchangeQuery.rows[0];

    if (!exchange) {
      return NextResponse.json({ ok: false, error: "Exchange not found" }, { status: 404 });
    }

    const pairsQuery = await PairingRepository.getActiveView(exchangeId);
    const pairs = pairsQuery.rows;

    if (pairs.length === 0) {
      return NextResponse.json({ ok: true, pairing: null });
    }

    if (exchange.owner_id === session.sub) {
      return NextResponse.json({ ok: true, owner: true, pairs });
    }

    const myPair = pairs.find((p) => p.giverId === session.sub);

    return NextResponse.json({
      ok: true,
      owner: false,
      myPair: myPair ?? null,
    });

  } catch (err: any) {
    console.error("PAIRING_GET_ERROR:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
