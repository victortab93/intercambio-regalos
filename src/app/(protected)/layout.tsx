import { getSession } from "@/lib/get-session";
import Navbar from "@/components/Navbar";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="bg-magenta-50 min-h-screen">
      <Navbar user={{ name: session.name, email: session.email }} />

      {/* ToastProvider is client-side */}
      <ToastProvider>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </ToastProvider>
    </div>
  );
}
