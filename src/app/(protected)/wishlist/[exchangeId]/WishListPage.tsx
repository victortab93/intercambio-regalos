"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";

interface WishlistItem {
  id?: string;
  text: string;
}

export default function WishlistPage({ exchangeId }: { exchangeId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------
  // LOAD EXISTING WISHLIST
  // ---------------------------------------------
  async function load() {
    const res = await api.get(`/api/wishlist/${exchangeId}`);

    if (res.ok && res.data?.items) {
      setItems(res.data.items);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [exchangeId]);

  // ---------------------------------------------
  // ACTIONS: add, remove, update, save
  // ---------------------------------------------

  function addItem() {
    setItems((prev) => [...prev, { text: "" }]);
  }

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, text: value } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setError(null);

    const res = await api.post(`/api/wishlist/${exchangeId}/save`, {
      items: items.map((i) => i.text)
    });

    if (!res.ok) {
      setError(res.error || "Error guardando la lista");
      setSaving(false);
      return;
    }

    setSaving(false);
    alert("Lista de deseos guardada.");
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  if (loading) {
    return <div className="text-center text-magenta-600 py-10">Cargando...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-magenta-600 text-center">
        Mi Lista de Deseos
      </h1>

      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 space-y-6">
        {items.length === 0 && (
          <p className="text-gray-600 text-center">Tu lista está vacía. ¡Agrega algo!</p>
        )}

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              className="
                flex-1 border border-gray-300 rounded-md px-3 py-2
                focus:ring-magenta-500 focus:border-magenta-500 outline-none
              "
              value={item.text}
              placeholder="Ej: Perfume, reloj, libro..."
              onChange={(e) => updateItem(index, e.currentTarget.value)}
            />

            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => removeItem(index)}
              type="button"
            >
              X
            </Button>
          </div>
        ))}

        <Button type="button" onClick={addItem} className="w-full">
          Añadir ítem
        </Button>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <Button
          type="button"
          className="w-full"
          loading={saving}
          onClick={save}
        >
          Guardar Lista
        </Button>
      </div>

      <div className="text-center">
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    </div>
  );
}
