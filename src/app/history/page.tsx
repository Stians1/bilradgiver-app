export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // kjør ved request, ikke under build
export const revalidate = 0;

import { getServiceClient } from "@/lib/supabaseServer";

export default async function Page() {
  const supabase = getServiceClient();

  // Hent fra tabellen du faktisk har: tco_results (ikke "history")
  const { data, error } = await supabase
    .from("tco_results")
    .select("request_id, outputs") // legg til created_at hvis kolonnen finnes
    .limit(50);

  if (error) {
    console.error("[/history] supabase error:", error.message);
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">History</h1>
        <div className="mt-4 rounded border p-4 bg-amber-50">
          Kunne ikke hente data nå.
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <ul className="space-y-2">
        {(data ?? []).map((row) => (
          <li key={row.request_id} className="rounded border p-3 text-sm">
            <div className="opacity-70">request_id: {row.request_id}</div>
            <pre className="mt-2 bg-neutral-100 p-2 rounded">
              {JSON.stringify(row.outputs, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </main>
  );
}
