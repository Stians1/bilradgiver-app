'use client'
import { useState } from 'react'

export default function Page() {
  const [result, setResult] = useState<{perMonth:number; perKm:number}|null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as any
    const payload = Object.fromEntries(Object.entries(raw).map(([k,v])=>[k, Number(v)]))
    const r = await fetch('/api/calc-tco', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    const j = await r.json()
    if (!r.ok) { alert(j.error ?? 'Feil'); return }
    setResult(j.result)
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">TCO-kalkulator</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input name="kmPerYear" placeholder="Km per år" required className="border p-2 rounded" />
        <input name="fuelPrice" placeholder="Drivstoffpris (kr/L, tom = default)" className="border p-2 rounded" />
        <input name="electricityHome" placeholder="Strøm hjemme (kr/kWh, tom = default)" className="border p-2 rounded" />
        <input name="electricityPublic" placeholder="Strøm offentlig (kr/kWh, tom = default)" className="border p-2 rounded" />
        <input name="fuelConsumption" placeholder="Forbruk (L/100 km)" className="border p-2 rounded" />
        <input name="kwhConsumption" placeholder="El-forbruk (kWh/100 km)" className="border p-2 rounded" />
        <input name="maintenance" placeholder="Service/år (kr)" className="border p-2 rounded" />
        <input name="insurance" placeholder="Forsikring/år (kr)" className="border p-2 rounded" />
        <input name="misc" placeholder="Andre kostnader (kr)" className="border p-2 rounded" />
        <button className="bg-blue-600 text-white py-2 rounded mt-2">Beregn</button>
      </form>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p><strong>TCO pr mnd:</strong> {result.perMonth.toFixed(0)} kr</p>
          <p><strong>TCO pr km:</strong> {result.perKm.toFixed(2)} kr</p>
        </div>
      )}
    </main>
  )
}
