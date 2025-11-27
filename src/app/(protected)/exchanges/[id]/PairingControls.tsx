"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import PairingModal from "@/components/PairingModal";
import { useToast } from "@/components/useToast";

interface PairingItem {
  giverId: string;
  receiverId: string;
  giverName: string;
  receiverName: string;
  receiverEmail: string;
}

export default function PairingControls({ exchangeId }: { exchangeId: string }) {
  const [pairing, setPairing] = useState<PairingItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [myMatch, setMyMatch] = useState<null | PairingItem>(null);

  const { addToast } = useToast();

  async function load() {
    const res = await api.get(`/api/exchanges/${exchangeId}/pairing`);

    if (res.ok) {
      setPairing(res.data.pairing || null);
    }

    setLoading(false);
  }

  async function generate() {
    setWorking(true);

    const res = await api.post(`/api/exchanges/${exchangeId}/pairing`);

    setWorking(false);

    if (!res.ok) {
      addToast({ type: "error", message: res.error || "Error generando pairing" });
      return;
    }

    addToast({ type: "success", message: "Emparejamiento generado" });
    await load();
  }

  async function remove() {
    setWorking(true);

    const res = await api.delete(`/api/exchanges/${exchangeId}/pairing`);

    setWorking(false);

    if (!res.ok) {
      addToast({ type: "error", message: res.error || "Error eliminando" });
      return;
    }

    addToast({ type: "success", message: "Emparejamiento eliminado" });
    setPairing(null);
  }

  function viewMyMatch() {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    const myId = session?.sub;

    if (!myId || !pairing) return;

    const match = pairing.find((p) => p.giverId === myId);
    if (match) {
      setMyMatch(match);
      setModalOpen(true);
    }
  }

  useEffect(() => {
    load();
  }, [exchangeId]);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-magenta-600">
        Emparejamiento
      </h2>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : pairing ? (
        <>
          <div className="flex flex-col gap-3">
            <Button onClick={viewMyMatch}>Ver mi pareja</Button>

            <Button
              className="bg-red-500 hover:bg-red-600"
              disabled={working}
              onClick={remove}
            >
              Eliminar emparejamiento
            </Button>
          </div>
        </>
      ) : (
        <Button disabled={working} onClick={generate}>
          Generar emparejamiento
        </Button>
      )}

      {modalOpen && myMatch && (
        <PairingModal
          pairing={myMatch}
          exchangeId={exchangeId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
