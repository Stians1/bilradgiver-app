export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getServiceClient } from "@/lib/supabaseServer";

type Row = {
  request_id: string;
  outputs: { perMonth?: number; perKm?: number } | null;
  requests: { created_at: string } | null;
};

function fmtNok(n?: number | null) {
  if (n == null || Number.isNaN(n)) return "–";
  return Math.round(n).toLocaleString("no-NO") + " kr";
}

export default async function Page() {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("tco_results")
    .select("request_id, outputs, requests(created_at)")
    .order("created_at", { referencedTable: "requests", ascending: false })
    .limit(50) as unknown as { data: Row[] | null, error: any };

  if (error) {
    console.error("[history] supabase:", error.message);
  }

  const rows = data ?? [];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">History</h1>
      <div className="text-sm opacity-70 mb-3">Siste 50 beregninger.</div>
      <div className="border rounded overflow-hidden">
        <div className="grid grid-cols-4 gap-2 p-2 bg-neutral-50 text-sm font-medium">
          <div>Dato</div>
          <div>Request ID</div>
          <div>Per måned</div>
          <div>Per km</div>
        </div>
        {rows.length === 0 ? (
          <div className="p-4 text-sm">Ingen data ennå.</div>
        ) : (
          rows.map((r) => {
            const perMonth = (r.outputs as any)?.perMonth ?? (r.outputs as any)?.result?.perMonth ?? null;
            const perKm = (r.outputs as any)?.perKm ?? (r.outputs as any)?.result?.perKm ?? null;
            const dt = r.requests?.created_at
              ? new Date(r.requests.created_at).toLocaleString("no-NO")
              : "–";
            return (
              <div key={r.request_id} className="grid grid-cols-4 gap-2 p-2 border-t text-sm">
                <div>{dt}</div>
                <div className="font-mono truncate" title={r.request_id}>
                  <Link href={`/history/${r.request_id}`} className="underline">{r.request_id}</Link>
                </div>
                <div>{fmtNok(perMonth)}</div>
                <div>{perKm != null ? Number(perKm).toFixed(2) + " kr" : "–"}</div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
