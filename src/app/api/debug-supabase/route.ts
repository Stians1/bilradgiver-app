import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing env");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getServiceClient();
    // Lett HEAD-spørring: teller rader uten å hente dem
    const { count, error } = await supabase
      .from("market_params")
      .select("*", { count: "exact", head: true });
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      using_secret_key: true,
      market_params_count: count ?? 0,
      env: process.env.NODE_ENV,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message }, { status: 500 });
  }
}
