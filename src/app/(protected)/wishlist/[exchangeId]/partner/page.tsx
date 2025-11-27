// src/app/wishlist/[exchangeId]/partner/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function PartnerWishlistPage({ params }: any) {
  const exchangeId = params.exchangeId;

  const [items, setItems] = useState<any[]>([]);
  const [partner, setPartner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/wishlist/${exchangeId}/partner`);
      const data = await res.json();
      setLoading(false);

      if (data.ok) {
        setItems(data.items);
        setPartner(data.partnerName);
      }
    }

    load();
  }, [exchangeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading partner wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold" style={{ color: "#d63384" }}>
        {partner ? `${partner}'s Wishlist` : "Partner Wishlist"}
      </h1>

      {items.length === 0 && (
        <p className="text-gray-600">Your partner has not added items yet.</p>
      )}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="border p-4 rounded-xl bg-white shadow-sm space-y-1"
          >
            <p className="font-medium">{item.title}</p>
            {item.description && (
              <p className="text-sm text-gray-700">{item.description}</p>
            )}

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                className="text-magenta-600 underline text-sm"
              >
                View item
              </a>
            )}

            {item.price && (
              <p className="text-sm text-gray-600">
                Price: <span className="font-medium">${item.price}</span>
              </p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
