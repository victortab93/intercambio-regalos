"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { usePairingActions } from "@/components/pairing/PairingActions";

export function PairingSection({ exchangeId, pairing }: any) {
  const {
    loading,
    error,
    success,
    generatePairing,
    deletePairing,
    setError,
    setSuccess
  } = usePairingActions(exchangeId);

  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasPairing = pairing.length > 0;

  return (
    <div className="bg-white border p-4 rounded-xl shadow-sm space-y-4">

      <h2 className="text-lg font-semibold">Pairing</h2>

      {/* ------------ NO PAIRING YET ------------- */}
      {!hasPairing && (
        <>
          <p className="text-gray-600">No pairing generated yet.</p>

          <button
            onClick={() => setConfirmCreate(true)}
            className="px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: "#d63384" }}
          >
            Generate Pairing
          </button>
        </>
      )}

      {/* ------------ PAIRING EXISTS ------------- */}
      {hasPairing && (
        <>
          <ul className="space-y-2">
            {pairing.map((pair: any) => (
              <li
                key={pair.giverId}
                className="border rounded-lg px-3 py-2 bg-gray-50"
              >
                <span className="font-medium">{pair.giverName}</span>
                {" → "}
                <span>{pair.receiverName}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 text-red-600 font-semibold border border-red-600 rounded-lg"
          >
            Delete Pairing
          </button>
        </>
      )}

      {/* ------------ ERROR MESSAGE ------------- */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* ------------ SUCCESS MESSAGE ------------- */}
      {success && (
        <p className="text-sm text-green-600">{success}</p>
      )}

      {/* ------------ CONFIRM CREATE SHEET --------- */}
      <BottomSheet open={confirmCreate} onClose={() => setConfirmCreate(false)}>
        <h3 className="text-xl font-bold mb-4">Generate Pairing?</h3>
        <p className="text-gray-700 mb-4">
          This will randomly assign gift partners and notify all participants by email.
        </p>

        <button
          disabled={loading}
          onClick={async () => {
            const ok = await generatePairing();
            if (ok) setConfirmCreate(false);
          }}
          className="w-full py-3 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "#d63384" }}
        >
          {loading ? "Generating..." : "Generate Pairing"}
        </button>

        <button
          onClick={() => setConfirmCreate(false)}
          className="mt-3 w-full py-3 text-gray-700 border rounded-lg font-semibold"
        >
          Cancel
        </button>
      </BottomSheet>

      {/* ------------ CONFIRM DELETE SHEET --------- */}
      <BottomSheet open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <h3 className="text-xl font-bold mb-4 text-red-600">Delete Pairing?</h3>

        <p className="text-gray-700 mb-4">
          Participants will lose access to their assigned partner.  
          You may create a new pairing later.
        </p>

        <button
          disabled={loading}
          onClick={async () => {
            const ok = await deletePairing();
            if (ok) setConfirmDelete(false);
          }}
          className="w-full py-3 text-white font-semibold bg-red-600 rounded-lg"
        >
          {loading ? "Deleting..." : "Delete Pairing"}
        </button>

        <button
          onClick={() => setConfirmDelete(false)}
          className="mt-3 w-full py-3 text-gray-700 border rounded-lg font-semibold"
        >
          Cancel
        </button>
      </BottomSheet>
    </div>
  );
}
