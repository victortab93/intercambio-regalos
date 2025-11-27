// src/app/invite/[code]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Link from "next/link";

export default async function InvitePage({
  params
}: {
  params: { code: string };
}) {
  const invite = params.code;

  // ------------------------------------------------------
  // 1. Check if user already has a valid session (SSR)
  // ------------------------------------------------------
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  // If logged in → join instantly
  if (session?.value) {
    redirect(`/invite/${invite}/joining`);
  }
  


  // ------------------------------------------------------
  // 2. Load the exchange data
  // ------------------------------------------------------
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/invite/${invite}`,
    { cache: "no-cache" }
  );

  const data = await res.json();

  if (!data.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is not valid or has expired.
          </p>
          <Link
            href="/"
            className="text-magenta-600 font-medium underline"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const exchange = data.exchange;

  // ------------------------------------------------------
  // RENDER UI
  // ------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full border border-gray-200 space-y-6">

        <h1 className="text-3xl font-bold text-center" style={{ color: "#d63384" }}>
          You're Invited! 🎁
        </h1>

        <p className="text-center text-gray-700 text-sm">
          You’ve been invited to join the exchange:
        </p>

        <p className="text-center text-xl font-semibold text-gray-900">
          {exchange.name}
        </p>

        {exchange.eventDate && (
          <p className="text-center text-gray-600 text-sm">
            Event date: <span className="font-medium">{exchange.eventDate}</span>
          </p>
        )}

        {exchange.ownerName && (
          <p className="text-center text-gray-600 text-sm">
            Hosted by <span className="font-medium">{exchange.ownerName}</span>
          </p>
        )}

        <div className="h-px bg-gray-300 my-3" />

        <p className="text-center text-gray-700">
          To join this exchange, please log in or create an account.
        </p>

        <div className="flex flex-col gap-3 mt-4">

          <Link
            href={`/login?invite=${invite}&redirect=/exchanges`}
            className="w-full text-center py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: "#d63384" }}
          >
            Login
          </Link>

          <Link
            href={`/signup?invite=${invite}&redirect=/exchanges`}
            className="w-full text-center py-2 rounded-lg border border-magenta-600 text-magenta-600 font-semibold"
          >
            Create Account
          </Link>

        </div>

      </div>
    </div>
  );
}
