"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExchangePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/exchanges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Error creating exchange");
        setLoading(false);
        return;
      }

      router.push(`/exchanges/${data.exchange.id}`);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full p-8 rounded-xl shadow-lg border border-gray-200 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center" style={{ color: "#d63384" }}>
          Create New Exchange
        </h1>

        {/* Name */}
        <div>
          <label className="text-sm text-gray-700">Exchange Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full border rounded-lg p-3 mt-1"
            style={{ borderColor: "#d63384" }}
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="text-sm text-gray-700">Event Date</label>
          <input
            type="date"
            required
            value={form.eventDate}
            onChange={(e) => setField("eventDate", e.target.value)}
            className="w-full border rounded-lg p-3 mt-1"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-bold"
          style={{ backgroundColor: "#d63384" }}
        >
          {loading ? "Creating..." : "Create Exchange"}
        </button>
      </form>

    </div>
  );
}
