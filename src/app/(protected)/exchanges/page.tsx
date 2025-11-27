import { getSession } from "@/lib/get-session";
import ExchangeList from "./ExchangeList";

export default async function ExchangesPage() {
  const session = await getSession();
  // ProtectedLayout ya fuerza redirect, pero mantenemos seguridad
  if (!session) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-magenta-600 text-center">
        Mis Intercambios
      </h1>

      {/* Client Component */}
      <ExchangeList />
    </div>
  );
}
