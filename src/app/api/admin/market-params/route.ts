import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { region = 'NO', electricity_home_nok_per_kwh, public_charge_nok_per_kwh, fuel_nok_per_l } = await req.json()

  const { error } = await supabase.from('market_params').insert({
    region,
    electricity_home_nok_per_kwh: Number(electricity_home_nok_per_kwh),
    public_charge_nok_per_kwh: Number(public_charge_nok_per_kwh),
    fuel_nok_per_l: Number(fuel_nok_per_l),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
