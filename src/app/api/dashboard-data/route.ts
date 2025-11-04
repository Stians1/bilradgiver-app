import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('tco_results')
    .select('created_at, outputs')
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const points = (data ?? []).map(d => ({
    date: new Date(d.created_at).toLocaleDateString('no-NO'),
    perKm: d.outputs?.perKm ?? 0,
  }))

  return NextResponse.json({ points })
}
