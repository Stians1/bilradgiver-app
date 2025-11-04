export const revalidate = 300; // 5 min cache

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/dashboard-data`, {
    next: { revalidate: 300 },
    // Når du kjører på Vercel er SITE_URL satt; lokalt vil '' funke med relative URLer
  });
  if (!res.ok) throw new Error('Kunne ikke hente dashboard-data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  // data forventes å inneholde market params/TCO-inputs fra din route
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">TCO</h1>
      <pre className="bg-neutral-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
      {/* Bytt ut <pre> med faktisk UI når du vil */}
    </main>
  );
}
