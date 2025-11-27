"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  user: {
    name: string;
    email: string;
  };
}

export default function Navbar({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    setLoading(true);

    const res = await fetch("/api/auth/logout", { method: "POST" });

    setLoading(false);
    if (res.ok) router.push("/login");
  }

  function go(path: string) {
    router.push(path);
    setMenuOpen(false);
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left - Brand */}
        <div
          className="text-xl font-bold text-magenta-600 cursor-pointer"
          onClick={() => go("/exchanges")}
        >
          🎁 GiftExchange
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            className="text-gray-700 hover:text-magenta-600 font-medium"
            onClick={() => go("/exchanges")}
          >
            Intercambios
          </button>

          <button
            className="text-gray-700 hover:text-magenta-600 font-medium"
            onClick={() => go("/wishlist")}
          >
            Wishlist
          </button>

          <div className="text-right text-sm">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="
              bg-[#0f62fe] hover:bg-[#0d55d8]
              text-white px-4 py-2 rounded-md text-sm font-medium
              disabled:opacity-60
            "
          >
            {loading ? "..." : "Logout"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col space-y-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="w-6 h-[3px] bg-gray-700"></span>
          <span className="w-6 h-[3px] bg-gray-700"></span>
          <span className="w-6 h-[3px] bg-gray-700"></span>
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner py-4 px-4 space-y-4 animate-fade-down">
          <button
            className="block w-full text-left text-gray-700 hover:text-magenta-600 font-medium"
            onClick={() => go("/exchanges")}
          >
            Intercambios
          </button>

          <button
            className="block w-full text-left text-gray-700 hover:text-magenta-600 font-medium"
            onClick={() => go("/wishlist")}
          >
            Wishlist
          </button>

          <div className="pt-2 border-t border-gray-200">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="
              bg-[#0f62fe] hover:bg-[#0d55d8]
              text-white px-4 py-2 rounded-md text-sm font-medium w-full
              disabled:opacity-60
            "
          >
            {loading ? "..." : "Cerrar sesión"}
          </button>
        </div>
      )}
    </nav>
  );
}
