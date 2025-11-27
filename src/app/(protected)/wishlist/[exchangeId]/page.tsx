import { getSession } from "@/lib/get-session";
import WishlistPage from "./WishListPage";

export default async function Page({ params }: { params: { exchangeId: string } }) {
  const session = await getSession();
  if (!session) return null;

  return <WishlistPage exchangeId={params.exchangeId} />;
}
