export const revalidate = 0

import { createClient } from '@supabase/supabase-js'

type ResultRow = {
  id: string
  request_id: string
  created_at: string
  outputs: { perMonth: number; perKm: number }
}

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: results, error } = await supabase
    .from('tco_results')
    .select('id, request_id, created_at, outputs')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return <main style={{ padding: 16 }}>Feil: {error.message}</main>
  }

  const ids = Array.from(new Set((results ?? []).map(r => r.request_id)))
  const { data: reqs } = ids.length
    ? await supabase.from('requests').select('id, inputs').in('id', ids)
    : { data: [] as { id: string; inputs: any }[] }

  const map = new Map(reqs?.map(r => [r.id, r.inputs]) ?? [])

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Historikk (siste 50)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Tid</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>TCO/mnd (kr)</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>TCO/km (kr)</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Km/år</th>
          </tr>
        </thead>
        <tbody>
          {(results as ResultRow[] | null)?.map(r => {
            const inp = map.get(r.request_id) || {}
            const d = new Date(r.created_at)
            const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
            return (
              <tr key={r.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{ts}</td>
                <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #eee' }}>{Math.round(r.outputs?.perMonth ?? 0)}</td>
                <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #eee' }}>{(r.outputs?.perKm ?? 0).toFixed(2)}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{inp?.kmPerYear ?? '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
