"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import CreateExchangeModal from "./CreateExchangeModal";
import { Button } from "@/components/Button";

interface Exchange {
  id: string;
  name: string;
  eventDate: string;
}

export default function ExchangeList() {
  const router = useRouter();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);

    const res = await api.get("/api/exchanges");

    if (res.ok && res.data?.exchanges) {
      setExchanges(res.data.exchanges);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-magenta-500 text-lg">Cargando...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Tus intercambios</h2>
        <Button onClick={() => setShowModal(true)}>Nuevo intercambio</Button>
      </div>

      {/* List */}
      {exchanges.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          Aún no has creado intercambios.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {exchanges.map((e) => (
            <div
              key={e.id}
              className="bg-white shadow-md border border-gray-200 p-6 rounded-xl
                         hover:shadow-lg transition cursor-pointer
                         bg-gradient-to-br from-magenta-50 to-white"
              onClick={() => router.push(`/exchanges/${e.id}`)}
            >
              <h3 className="text-xl font-bold text-magenta-600">{e.name}</h3>
              <p className="text-gray-700 mt-2">
                Fecha del evento:{" "}
                <span className="font-medium">
                  {new Date(e.eventDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateExchangeModal
          close={() => setShowModal(false)}
          refresh={load}
        />
      )}
    </div>
  );
}
