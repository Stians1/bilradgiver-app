import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

type Inputs = {
  mileage?: number;               // km per år
  fuelPrice?: number;             // NOK per liter
  electricityPrice?: number;      // NOK per kWh
  l_per_100km?: number;           // liter/100km (bruk for bensin/diesel)
  kwh_per_100km?: number;         // kWh/100km (bruk for elbil)
  maintenance_per_km?: number;    // NOK/km vedlikehold/dekk/slitasje
  insurance_per_month?: number;   // NOK/mnd
  depreciation_per_month?: number;// NOK/mnd
  tolls_per_month?: number;       // NOK/mnd
  other_fixed_per_month?: number; // NOK/mnd
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input: Inputs = body?.inputs ?? body ?? {};

    // Fornuftige defaults — kan overstyres via inputs
    const i: Required<Inputs> = {
      mileage: input.mileage ?? 12000,
      fuelPrice: input.fuelPrice ?? 22,
      electricityPrice: input.electricityPrice ?? 1.5,
      l_per_100km: input.l_per_100km ?? 0,     // 0 = ikke brukt
      kwh_per_100km: input.kwh_per_100km ?? 18,
      maintenance_per_km: input.maintenance_per_km ?? 0.25,
      insurance_per_month: input.insurance_per_month ?? 800,
      depreciation_per_month: input.depreciation_per_month ?? 1500,
      tolls_per_month: input.tolls_per_month ?? 200,
      other_fixed_per_month: input.other_fixed_per_month ?? 0,
    };

    const monthly_km = i.mileage / 12;

    const fuel_cost_per_km = i.l_per_100km > 0 ? (i.l_per_100km / 100) * i.fuelPrice : 0;
    const elec_cost_per_km = i.kwh_per_100km > 0 ? (i.kwh_per_100km / 100) * i.electricityPrice : 0;

    const variable_per_km = fuel_cost_per_km + elec_cost_per_km + i.maintenance_per_km;
    const fixed_per_month = i.insurance_per_month + i.depreciation_per_month + i.tolls_per_month + i.other_fixed_per_month;

    const perKm = Number(variable_per_km.toFixed(2));
    const perMonth = Number((variable_per_km * monthly_km + fixed_per_month).toFixed(0));

    return NextResponse.json({
      perMonth,
      perKm,
      breakdown: {
        monthly_km,
        variable_per_km: Number(variable_per_km.toFixed(3)),
        fuel_cost_per_km: Number(fuel_cost_per_km.toFixed(3)),
        elec_cost_per_km: Number(elec_cost_per_km.toFixed(3)),
        maintenance_per_km: i.maintenance_per_km,
        fixed_per_month,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Bad request" }, { status: 400 });
  }
}
