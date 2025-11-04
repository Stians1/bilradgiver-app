// src/app/tco/page.tsx
export const runtime = "nodejs";
export const revalidate = 300; // cache 5 min

type TcoOut = { perMonth: number; perKm: number };

async function getTco(): Promise<TcoOut> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/calc-tco`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Kunne ikke hente TCO");
  return res.json();
}

export default async function Page() {
  let tco: TcoOut | null = null;
  try {
    tco = await getTco();
  } catch (e) {
    // fallback – ikke krasj UI
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">TCO</h1>
      {tco ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded p-4 border">
            <div className="text-sm opacity-70">Per måned</div>
            <div className="text-2xl font-bold">{Math.round(tco.perMonth).toLocaleString("no-NO")} kr</div>
          </div>
          <div className="rounded p-4 border">
            <div className="text-sm opacity-70">Per km</div>
            <div className="text-2xl font-bold">{tco.perKm.toFixed(2)} kr</div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded border bg-amber-50">Kunne ikke hente TCO akkurat nå. Prøv igjen om litt.</div>
      )}
      <div className="text-xs opacity-60">Oppdateres hver 5. min (ISR).</div>
    </main>
  );
}
