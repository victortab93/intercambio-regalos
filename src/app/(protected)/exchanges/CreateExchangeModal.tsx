"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";

export default function CreateExchangeModal({
  close,
  refresh
}: {
  close: () => void;
  refresh: () => void;
}) {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.post("/api/exchanges", {
      name,
      eventDate
    });

    if (!res.ok) {
      setError(res.error || "Error al crear intercambio");
      setLoading(false);
      return;
    }

    setLoading(false);
    close();
    refresh();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-magenta-600 text-center">
          Crear nuevo intercambio
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-magenta-500 focus:border-magenta-500"
              placeholder="Ej: Navidad 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha del evento</label>
            <input
              type="date"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-magenta-500 focus:border-magenta-500"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex justify-between">
            <Button type="button" className="bg-gray-400 hover:bg-gray-500" onClick={close}>
              Cancelar
            </Button>

            <Button loading={loading} type="submit">
              Crear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
