import { redirect } from "next/navigation";
import { getAllShorts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ShortsPage() {
  const allShorts = await getAllShorts();

  if (allShorts.length > 0) {
    redirect(`/shorts/${allShorts[0].slug}`);
  }

  redirect("/");
}
