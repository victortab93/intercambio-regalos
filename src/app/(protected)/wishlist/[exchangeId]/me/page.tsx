"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyWishlistPage({ params }: any) {
  const exchangeId = params.exchangeId;
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/wishlist/${exchangeId}/me`, {
          cache: "no-cache"
        });
        const data = await res.json();

        if (data.ok) {
          setItems(data.items ?? []);
        } else {
          setError(data.error || "Error loading wishlist");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [exchangeId]);

  function updateItem(i: number, field: string, value: string) {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addItem() {
    setItems(prev => [...prev, { title: "", description: "", url: "", price: "" }]);
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/wishlist/${exchangeId}/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Error saving wishlist");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold" style={{ color: "#d63384" }}>
        My Wishlist
      </h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 border rounded-xl shadow-sm bg-white space-y-2">

            <div>
              <label className="text-sm">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={e => updateItem(i, "title", e.target.value)}
                className="w-full border p-2 rounded-lg mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Description</label>
              <textarea
                value={item.description}
                onChange={e => updateItem(i, "description", e.target.value)}
                className="w-full border p-2 rounded-lg mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm">URL</label>
              <input
                type="text"
                value={item.url}
                onChange={e => updateItem(i, "url", e.target.value)}
                className="w-full border p-2 rounded-lg mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Price</label>
              <input
                type="number"
                value={item.price}
                onChange={e => updateItem(i, "price", e.target.value)}
                className="w-full border p-2 rounded-lg mt-1"
              />
            </div>

            <button
              onClick={() => removeItem(i)}
              className="text-red-600 text-sm underline"
            >
              Remove item
            </button>

          </div>
        ))}

        <button
          onClick={addItem}
          className="w-full py-2 text-white rounded-lg font-semibold"
          style={{ backgroundColor: "#d63384" }}
        >
          + Add Item
        </button>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 text-white rounded-lg font-bold"
          style={{ backgroundColor: "#d63384" }}
        >
          {saving ? "Saving..." : "Save Wishlist"}
        </button>

      </div>
    </div>
  );
}
