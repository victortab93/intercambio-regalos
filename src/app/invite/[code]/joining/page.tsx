// src/app/invite/[code]/joining/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoiningPage({
  params
}: {
  params: { code: string };
}) {
  const router = useRouter();
  const invite = params.code;

  useEffect(() => {
    async function join() {
      try {
        // Call join API
        window.location.href = `/api/invite/join?invite=${invite}`;
      } catch (e) {
        router.push(`/invite/${invite}?error=join_failed`);
      }
    }
    join();
  }, [invite, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full text-center border border-gray-200">
        
        <div
          className="mx-auto mb-6 w-12 h-12 border-4 border-magenta-500 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#d63384", borderTopColor: "transparent" }}
        />

        <h1 className="text-xl font-semibold mb-2" style={{ color: "#d63384" }}>
          Joining exchange…
        </h1>

        <p className="text-gray-600 text-sm">
          Please wait a moment while we add you to the exchange.
        </p>
      </div>
    </div>
  );
}
