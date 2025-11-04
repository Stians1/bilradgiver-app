import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { count, error } = await supabase
      .from("market_params")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      market_params_count: count ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
