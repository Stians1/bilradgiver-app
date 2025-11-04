export default function Home() {
  const Card = ({ href, title, desc }: { href: string; title: string; desc: string }) => (
    <a href={href} className="block border rounded-2xl p-5 hover:shadow-md transition">
      <h2 className="font-semibold text-lg">{title} →</h2>
      <p className="text-sm text-gray-600">{desc}</p>
    </a>
  )

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-6">Bilrådgiver</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card href="/tco" title="TCO-kalkulator" desc="Regn ut kostnad pr mnd og pr km." />
        <Card href="/history" title="Historikk" desc="Se de siste beregningene." />
        <Card href="/dashboard" title="Dashboard" desc="Graf over TCO-utvikling." />
        <Card href="/admin/market-params" title="Admin · Market params" desc="Oppdater strøm- og drivstoffpriser." />
      </div>
    </main>
  )
}
