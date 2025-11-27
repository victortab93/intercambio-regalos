// src/app/exchanges/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExchangeDetailPage({
  params
}: {
  params: { id: string };
}) {
  const exchangeId = params.id;

  // Session check
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect(`/login?redirect=/exchanges/${exchangeId}`);
  }

  // Fetch combined details
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/exchanges/${exchangeId}/details`,
    { cache: "no-cache" }
  );

  const data = await res.json();
  if (!data.ok) {
    return (
      <div className="p-6 text-center text-gray-600">Error loading exchange</div>
    );
  }

  const { exchange, participants, pairing } = data;
  const hasPairing = pairing.length > 0;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-3xl font-bold" style={{ color: "#d63384" }}>
        {exchange.name}
      </h1>

      {/* Event Date */}
      <p className="text-gray-700">
        <span className="font-medium">Event date:</span> {exchange.event_date}
      </p>

      {/* Invite code */}
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">Invite code:</span>
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
          {exchange.invite_code}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(exchange.invite_code)}
          className="text-sm text-magenta-600 underline"
        >
          Copy
        </button>
      </div>

      {/* Participants */}
      <div className="bg-white border p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Participants</h2>

        {participants.length === 0 && (
          <p className="text-gray-500">No participants yet.</p>
        )}

        <ul className="space-y-2">
          {participants.map((p: any) => (
            <li
              key={p.id}
              className="border rounded-lg px-3 py-2 bg-gray-50"
            >
              {p.name} —{" "}
              <span className="text-sm text-gray-600">{p.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pairing Section */}
      <div className="bg-white border p-4 rounded-xl shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Pairing</h2>

        {!hasPairing && (
          <div className="space-y-3">
            <p className="text-gray-600">No pairing generated yet.</p>

            <form action={`/api/exchanges/${exchangeId}/pairing`} method="POST">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: "#d63384" }}
              >
                Generate Pairing
              </button>
            </form>
          </div>
        )}

        {hasPairing && (
          <div className="space-y-3">
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

            <form
              action={`/api/exchanges/${exchangeId}/pairing`}
              method="DELETE"
            >
              <button
                type="submit"
                className="px-4 py-2 text-red-600 font-semibold border border-red-600 rounded-lg"
              >
                Delete Pairing
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Wishlist actions */}
      <div className="bg-white border p-4 rounded-xl shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Wishlist</h2>

        <Link
          href={`/wishlist/${exchangeId}/me`}
          className="inline-block px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: "#d63384" }}
        >
          Edit my wishlist
        </Link>

        {hasPairing && (
          <Link
            href={`/wishlist/${exchangeId}/partner`}
            className="inline-block px-4 py-2 rounded-lg font-semibold border border-magenta-600 text-magenta-600"
          >
            View partner's wishlist
          </Link>
        )}
      </div>
    </div>
  );
}
