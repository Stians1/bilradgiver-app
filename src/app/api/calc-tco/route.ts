import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function calcTCO(i:{
  kmPerYear:number; fuelPrice:number; electricityHome:number; electricityPublic:number;
  fuelConsumption:number; kwhConsumption:number; maintenance:number; insurance:number; misc:number
}) {
  const fuelCost = (i.fuelConsumption/100)*i.fuelPrice*i.kmPerYear
  const electricCost = (i.kwhConsumption/100)*((i.electricityHome+i.electricityPublic)/2)*i.kmPerYear
  const fixedCost = i.maintenance+i.insurance+i.misc
  const tcoYear = fuelCost+electricCost+fixedCost
  return { perMonth: tcoYear/12, perKm: tcoYear/i.kmPerYear }
}

export async function POST(req: Request) {
  const b = await req.json()

  const { data: mp, error: mpErr } = await supabase
    .from('market_params').select('*')
    .order('updated_at', { ascending: false })
    .limit(1).single()
  if (mpErr) return NextResponse.json({ error: mpErr.message }, { status: 500 })

  const input = {
    kmPerYear: Number(b.kmPerYear),
    fuelPrice: Number(b.fuelPrice ?? mp.fuel_nok_per_l),
    electricityHome: Number(b.electricityHome ?? mp.electricity_home_nok_per_kwh),
    electricityPublic: Number(b.electricityPublic ?? mp.public_charge_nok_per_kwh),
    fuelConsumption: Number(b.fuelConsumption ?? 0),
    kwhConsumption: Number(b.kwhConsumption ?? 0),
    maintenance: Number(b.maintenance ?? 0),
    insurance: Number(b.insurance ?? 0),
    misc: Number(b.misc ?? 0),
  }

  const result = calcTCO(input)

  const { data: reqRow, error: rErr } = await supabase
    .from('requests').insert({ inputs: input, user_id: null })
    .select('id').single()
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

  const { error: tErr } = await supabase
    .from('tco_results').insert({ request_id: reqRow.id, user_id: null, outputs: result })
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })

  return NextResponse.json({ result, requestId: reqRow.id })
}

