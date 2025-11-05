export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getServiceClient } from "@/lib/supabaseServer";

type PageProps = { params: { id: string } };

export default async function Page({ params }: PageProps) {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("tco_results")
    .select("request_id, outputs, requests(inputs, created_at)")
    .eq("request_id", params.id)
    .single();

  if (error) {
    console.error("[history/[id]] supabase:", error.message);
  }

  const createdAt = data?.requests?.created_at
    ? new Date(data.requests.created_at).toLocaleString("no-NO")
    : "–";

  const outputs = (data?.outputs ?? {}) as any;
  const perMonth = outputs?.perMonth ?? outputs?.result?.perMonth ?? null;
  const perKm = outputs?.perKm ?? outputs?.result?.perKm ?? null;

  return (
    <main className="p-6 space-y-6">
      <div className="text-sm"><Link href="/history" className="underline">← Tilbake</Link></div>
      <h1 className="text-2xl font-semibold">Detaljer for request</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Stat title="Request ID" value={params.id} mono />
        <Stat title="Dato" value={createdAt} />
        <Stat title="Per måned" value={perMonth!=null ? Math.round(perMonth).toLocaleString("no-NO")+" kr" : "–"} />
        <Stat title="Per km" value={perKm!=null ? Number(perKm).toFixed(2)+" kr" : "–"} />
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <Card title="Inputs">
          <pre className="text-xs bg-neutral-100 p-3 rounded overflow-auto">
            {JSON.stringify(data?.requests?.inputs ?? {}, null, 2)}
          </pre>
        </Card>
        <Card title="Outputs">
          <pre className="text-xs bg-neutral-100 p-3 rounded overflow-auto">
            {JSON.stringify(outputs, null, 2)}
          </pre>
        </Card>
      </section>
    </main>
  );
}

function Stat({ title, value, mono=false }:{title:string; value:string; mono?:boolean}) {
  return <div className="border rounded p-4">
    <div className="text-sm opacity-70">{title}</div>
    <div className={`text-lg ${mono ? "font-mono" : "font-semibold"}`}>{value}</div>
  </div>;
}

function Card({ title, children }:{title:string; children:any}) {
  return <div className="border rounded">
    <div className="px-3 py-2 border-b bg-neutral-50 text-sm font-medium">{title}</div>
    <div className="p-3">{children}</div>
  </div>;
}
