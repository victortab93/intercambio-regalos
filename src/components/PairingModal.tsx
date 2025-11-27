"use client";

import Avatar from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PairingModal({
  pairing,
  exchangeId,
  onClose,
}: {
  pairing: {
    receiverId: string;
    receiverName: string;
    receiverEmail: string;
  };
  exchangeId: string;
  onClose: () => void;
}) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [closing, setClosing] = useState(false);

  async function loadWishlist() {
    const res = await api.get(`/api/wishlist/${exchangeId}/user/${pairing.receiverId}`);
    if (res.ok && res.data?.items) {
      setWishlist(res.data.items);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  function animateClose() {
    setClosing(true);
    setTimeout(onClose, 250);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={animateClose}
      />

      {/* BOTTOM SHEET */}
      <div
        className={`
          w-full max-w-md mx-auto
          bg-white p-6 rounded-t-2xl shadow-xl 
          ${closing ? "animate-slide-down" : "animate-slide-up"}
        `}
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        <h2 className="text-xl font-bold text-center text-magenta-600">
          Tu Pareja 🎁
        </h2>

        <div className="flex flex-col items-center mt-4 space-y-2">
          <Avatar name={pairing.receiverName} size={70} />

          <p className="text-lg font-medium">{pairing.receiverName}</p>
          <p className="text-gray-600 text-sm">{pairing.receiverEmail}</p>

          <Button
            className="mt-2"
            onClick={() => copy(pairing.receiverEmail)}
          >
            Copiar Email
          </Button>
        </div>

        {/* Wishlist */}
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            Lista de deseos
          </h3>

          {wishlist.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No tiene aún una lista de deseos.
            </p>
          ) : (
            <ul className="space-y-2">
              {wishlist.map((item, i) => (
                <li
                  key={i}
                  className="bg-magenta-50 border border-magenta-200 rounded-md p-2 text-gray-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          {wishlist.length > 0 && (
            <Button
              className="mt-3 w-full"
              onClick={() => copy(wishlist.join(", "))}
            >
              Copiar Wishlist
            </Button>
          )}
        </div>

        {/* Close */}
        <Button
          className="mt-6 w-full bg-gray-300 text-gray-900 hover:bg-gray-400"
          onClick={animateClose}
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
}
