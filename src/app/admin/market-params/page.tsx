'use client'

import { useState } from 'react'

export default function Page() {
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget)) as any
    const r = await fetch('/api/admin/market-params', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? 'bytt_meg',
      },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    setMsg(r.ok ? 'Lagret!' : j.error ?? 'Feil')
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin · Market params</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input name="region" placeholder="Region" defaultValue="NO" className="border p-2 rounded" />
        <input name="electricity_home_nok_per_kwh" placeholder="Strøm hjemme (kr/kWh)" className="border p-2 rounded" />
        <input name="public_charge_nok_per_kwh" placeholder="Strøm offentlig (kr/kWh)" className="border p-2 rounded" />
        <input name="fuel_nok_per_l" placeholder="Drivstoff (kr/L)" className="border p-2 rounded" />
        <button className="bg-blue-600 text-white py-2 rounded mt-2">Lagre</button>
      </form>
      {msg && <p className="mt-4">{msg}</p>}
    </main>
  )
}

