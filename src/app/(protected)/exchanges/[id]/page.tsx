import { getSession } from "@/lib/get-session";
import ExchangeDetail from "./ExchangeDetail";

export default async function ExchangeDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return null;

  return <ExchangeDetail exchangeId={params.id} session={session} />;
}
