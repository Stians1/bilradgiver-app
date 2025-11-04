// src/app/history/page.tsx
export const runtime = "nodejs";
export const revalidate = 300;

import { getServiceClient } from "@/lib/supabaseServer";

type ResultRow = {
  id: string;
  request_id: string;
  created_at: string;
  outputs: { perMonth: number; perKm: number };
};

export default async function Page() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("history") // ← tilpass tabellnavn
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  // Viktig: ikke send sensitive felter videre til klienten via props/JSX
  return (
    <main className="p-6">
      {/* render data uten hemmeligheter */}
    </main>
  );
}
