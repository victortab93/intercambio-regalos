// src/app/exchanges/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Link from "next/link";

export default async function ExchangesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login?redirect=/exchanges");
  }

  // Fetch exchanges
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/exchanges/list`,
    { cache: "no-cache" }
  );

  const data = await res.json();
  if (!data.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Error loading exchanges</p>
      </div>
    );
  }

  const exchanges = data.exchanges;

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: "#d63384" }}>
          Your Exchanges
        </h1>

        <Link
          href="/exchanges/new"
          className="px-4 py-2 rounded-lg text-white font-semibold"
          style={{ backgroundColor: "#d63384" }}
        >
          New Exchange
        </Link>
      </div>

      {/* Empty state */}
      {exchanges.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          <p>No exchanges yet.</p>
          <p className="text-sm mt-2">Create one to get started!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exchanges.map((ex: any) => (
          <Link
            key={ex.id}
            href={`/exchanges/${ex.id}`}
            className="block border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
          >
            <h2 className="text-lg font-semibold text-gray-900">{ex.name}</h2>

            <p className="text-sm text-gray-700 mt-1">
              Event: <span className="font-medium">{ex.eventDate}</span>
            </p>

            <p className="text-sm mt-1 text-gray-600">
              Invite code: <span className="font-mono">{ex.inviteCode}</span>
            </p>

            <p className="mt-3 text-sm text-magenta-600 font-medium">
              View details →
            </p>
          </Link>
        ))}
      </div>

    </div>
  );
}
