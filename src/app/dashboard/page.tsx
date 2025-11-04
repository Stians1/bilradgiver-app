'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Point = { date: string; perKm: number }

export default function Page() {
  const [data, setData] = useState<Point[]>([])

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/dashboard-data')
      const j = await res.json()
      setData(j.points || [])
    })()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">TCO-utvikling</h1>
      {data.length === 0 ? (
        <p>Ingen data ennå …</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="perKm" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </main>
  )
}
