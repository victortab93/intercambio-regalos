"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PairingSection } from "./PairingSection";
import { ParticipantList } from "./ParticipantsList";

export default function ExchangeDetail({
  exchangeId,
  session
}: {
  exchangeId: string;
  session: any;
}) {

  const [exchange, setExchange] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [pairing, setPairing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/details`, {
        cache: "no-cache"
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Error loading exchange");
        return;
      }

      setExchange(data.exchange);
      setParticipants(data.participants);
      setPairing(data.pairing);

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [exchangeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading exchange...
      </div>
    );
  }

  if (error || !exchange) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Exchange not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-8">

      {/* TITLE */}
      <h1 className="text-3xl font-bold" style={{ color: "#d63384" }}>
        {exchange.name}
      </h1>

      {/* DATE */}
      <p className="text-gray-700">
        <span className="font-medium">Event Date:</span> {exchange.event_date}
      </p>

      {/* INVITE */}
      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium">Invite Code:</span>

        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
          {exchange.invite_code}
        </span>

        <button
          onClick={() => navigator.clipboard.writeText(exchange.invite_code)}
          className="text-sm text-magenta-600 underline"
        >
          Copy
        </button>
      </div>

      {/* PARTICIPANTS — (Replaces your old list) */}
      <ParticipantList
        participants={participants}
        ownerId={exchange.owner_id}
        currentUserId={session.sub}
      />

      {/* PAIRING SECTION */}
      <PairingSection exchangeId={exchangeId} pairing={pairing} />

      {/* WISHLIST SECTION */}
      <div className="bg-white border p-4 rounded-xl shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Wishlist</h2>

        <Link
          href={`/wishlist/${exchangeId}/me`}
          className="inline-block px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: "#d63384" }}
        >
          Edit my wishlist
        </Link>

        {pairing.length > 0 && (
          <Link
            href={`/wishlist/${exchangeId}/partner`}
            className="inline-block px-4 py-2 rounded-lg font-semibold border border-magenta-600 text-magenta-600"
          >
            View partner's wishlist
          </Link>
        )}
      </div>
    </div>
  );
}
