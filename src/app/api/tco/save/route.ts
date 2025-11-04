import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true, message: "POST works!" });
}
