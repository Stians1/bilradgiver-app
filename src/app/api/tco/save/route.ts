import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/supabaseServer"; // bruk relativ import

export const runtime = "nodejs";

type Inputs = Record<string, any>;
type TcoOutput = { perMonth: number; perKm: number } | Record<string, any>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const inputs: Inputs | null = body?.inputs ?? null;
    if (!inputs || typeof inputs !== "object") {
      return NextResponse.json({ ok: false, message: "Body must be { inputs: {...} }" }, { status: 400 });
    }

    // 1) kall /api/calc-tco
    const origin = req.nextUrl.origin;
    const calcRes = await fetch(`${origin}/api/calc-tco`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inputs }),
    });
    if (!calcRes.ok) {
      const text = await calcRes.text();
      throw new Error(`calc-tco failed (${calcRes.status}): ${text}`);
    }
    const outputs: TcoOutput = await calcRes.json();

    // 2) lagre i DB
    const supabase = getServiceClient();
    const { data: reqRow, error: reqErr } = await supabase
      .from("requests")
      .insert({ inputs }) // forutsetter default på id/created_at
      .select("id")
      .single();
    if (reqErr) throw reqErr;

    const { error: resErr } = await supabase
      .from("tco_results")
      .insert({ request_id: reqRow.id, outputs });
    if (resErr) throw resErr;

    return NextResponse.json({ ok: true, request_id: reqRow.id, outputs });
  } catch (e: any) {
    console.error("[/api/tco/save] error:", e?.message);
    return NextResponse.json({ ok: false, message: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
