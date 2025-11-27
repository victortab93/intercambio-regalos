"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ParticipantList({
  participants,
  ownerId,
  currentUserId
}: {
  participants: any[];
  ownerId: string;
  currentUserId: string;
}) {

  const [list] = useState(participants);

  const count = list.length;
  const missing = count < 2 ? 2 - count : 0;

  function initials(name: string) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return (
    <div className="bg-white border p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">
        Participants ({count})
      </h2>

      {missing > 0 && (
        <p className="text-sm text-magenta-600 font-medium mb-3">
          At least {missing} more participant{missing > 1 ? "s" : ""} required to generate pairing.
        </p>
      )}

      <ul className="space-y-3">
        {list.map((p) => {
          const isOwner = p.id === ownerId;
          const isYou = p.id === currentUserId;

          return (
            <li
              key={p.id}
              className="flex items-center justify-between p-3 border rounded-xl bg-gray-50"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#d63384" }}
                >
                  {initials(p.name)}
                </div>

                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.email}</p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                {isOwner && (
                  <span className="text-xs bg-magenta-600 text-white px-2 py-1 rounded-lg inline-block mb-1">
                    Owner
                  </span>
                )}

                {isYou && (
                  <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-lg inline-block mb-1">
                    You
                  </span>
                )}

                <p className="text-xs text-gray-500">
                  Joined:{" "}
                  {p.joined_at
                    ? format(new Date(p.joined_at), "d MMM yyyy", { locale: es })
                    : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
