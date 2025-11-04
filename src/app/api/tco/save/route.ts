import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type Inputs = Record<string, any>;
type TcoOutput = { perMonth: number; perKm: number } | Record<string, any>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const inputs: Inputs | null = body?.inputs ?? null;

    if (!inputs || typeof inputs !== "object") {
      return NextResponse.json(
        { ok: false, message: "Body must be { inputs: {...} }" },
        { status: 400 }
      );
    }

    // 1) Kall din eksisterende /api/calc-tco – bruker samme origin i prod/preview/lokalt
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

    // 2) Lagre til DB med service role
    const supabase = getServiceClient();

    // a) requests (må ha inputs + ev. created_at hvis du ikke har default)
    const { data: reqRow, error: reqErr } = await supabase
      .from("requests")
      .insert({ inputs })               // legg evt. created_at: new Date().toISOString() dersom ingen default
      .select("id")
      .single();

    if (reqErr) throw reqErr;

    // b) tco_results med FK til requests.id
    const { error: resErr } = await supabase
      .from("tco_results")
      .insert({ request_id: reqRow.id, outputs });

    if (resErr) throw resErr;

    return NextResponse.json({
      ok: true,
      request_id: reqRow.id,
      outputs,
    });
  } catch (e: any) {
    // Logg kort i Vercel (ikke sensitive ting)
    console.error("[/api/tco/save] error:", e?.message);
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Unknown error" },
      { status: 500 }
    );
    }
}
