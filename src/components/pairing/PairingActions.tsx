"use client";

import { useState } from "react";

export function usePairingActions(exchangeId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function generatePairing() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/exchanges/${exchangeId}/pairing`, {
      method: "POST",
    });

    const data = await res.json();

    if (!data.ok) {
      setError(data.error || "Error generating pairing");
      setLoading(false);
      return false;
    }

    setSuccess("Pairing generated! Emails sent in background.");
    setLoading(false);
    return true;
  }

  async function deletePairing() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/exchanges/${exchangeId}/pairing`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.ok) {
      setError(data.error || "Error deleting pairing");
      setLoading(false);
      return false;
    }

    setSuccess("Pairing deleted.");
    setLoading(false);
    return true;
  }

  return {
    loading,
    error,
    success,
    generatePairing,
    deletePairing,
    setError,
    setSuccess
  };
}
