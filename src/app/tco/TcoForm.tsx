"use client";
import { useState } from "react";

type Out = { ok: boolean; request_id?: string; outputs?: any; message?: string };

export default function TcoForm() {
  const [powertrain, setPowertrain] = useState<"ev"|"ice">("ev");
  const [form, setForm] = useState({
    mileage: 12000,
    fuelPrice: 22,
    electricityPrice: 1.5,
    kwh_per_100km: 18,
    l_per_100km: 0,
    maintenance_per_km: 0.25,
    insurance_per_month: 800,
    depreciation_per_month: 1500,
    tolls_per_month: 200,
    other_fixed_per_month: 0,
  });
  const [loading,setLoading]=useState(false);
  const [res,setRes]=useState<Out|null>(null);
  const [err,setErr]=useState<string | null>(null);

  function onNum<K extends keyof typeof form>(k: K, v: string) {
    setForm(s => ({ ...s, [k]: v === "" ? 0 : Number(v) }));
  }

  async function onSubmit() {
    setLoading(true); setErr(null); setRes(null);
    try {
      const r = await fetch("/api/tco/save", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body: JSON.stringify({ inputs: { ...form, ...(powertrain === "ev" ? { l_per_100km: 0 } : { kwh_per_100km: 0 }) }})
      });
      const j: Out = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.message || "Ukjent feil");
      setRes(j);
    } catch(e:any){ setErr(e.message || "Noe gikk galt"); }
    finally{ setLoading(false); }
  }

  const perMonth = res?.outputs?.perMonth ?? res?.outputs?.result?.perMonth ?? null;
  const perKm = res?.outputs?.perKm ?? res?.outputs?.result?.perKm ?? null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={()=>setPowertrain("ev")}
          className={`px-3 py-1 rounded border ${powertrain==="ev"?"bg-black text-white":""}`}
          type="button"
        >Elbil</button>
        <button
          onClick={()=>setPowertrain("ice")}
          className={`px-3 py-1 rounded border ${powertrain==="ice"?"bg-black text-white":""}`}
          type="button"
        >Bensin/Diesel</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <L label="Km/år">
          <I v={form.mileage} onChange={v=>onNum("mileage",v)} />
        </L>

        {powertrain==="ice" && (
          <>
            <L label="Liter/100km">
              <I v={form.l_per_100km} onChange={v=>onNum("l_per_100km",v)} />
            </L>
            <L label="Drivstoffpris (NOK/l)">
              <I v={form.fuelPrice} onChange={v=>onNum("fuelPrice",v)} />
            </L>
          </>
        )}

        {powertrain==="ev" && (
          <>
            <L label="kWh/100km">
              <I v={form.kwh_per_100km} onChange={v=>onNum("kwh_per_100km",v)} />
            </L>
            <L label="Strømpris (NOK/kWh)">
              <I v={form.electricityPrice} onChange={v=>onNum("electricityPrice",v)} />
            </L>
          </>
        )}

        <L label="Vedlikehold (NOK/km)">
          <I v={form.maintenance_per_km} onChange={v=>onNum("maintenance_per_km",v)} step="0.01" />
        </L>
        <L label="Forsikring (NOK/mnd)">
          <I v={form.insurance_per_month} onChange={v=>onNum("insurance_per_month",v)} />
        </L>
        <L label="Verditap (NOK/mnd)">
          <I v={form.depreciation_per_month} onChange={v=>onNum("depreciation_per_month",v)} />
        </L>
        <L label="Bompenger (NOK/mnd)">
          <I v={form.tolls_per_month} onChange={v=>onNum("tolls_per_month",v)} />
        </L>
        <L label="Andre faste (NOK/mnd)">
          <I v={form.other_fixed_per_month} onChange={v=>onNum("other_fixed_per_month",v)} />
        </L>
      </div>

      <button disabled={loading} onClick={onSubmit} className="px-4 py-2 rounded border">
        {loading ? "Regner…" : "Beregn & lagre"}
      </button>

      {err && <div className="p-3 bg-amber-50 border rounded">{err}</div>}

      {perMonth!=null && perKm!=null && (
        <div className="grid md:grid-cols-2 gap-4">
          <Stat title="Per måned" value={`${Math.round(perMonth).toLocaleString("no-NO")} kr`} />
          <Stat title="Per km" value={`${Number(perKm).toFixed(2)} kr`} />
        </div>
      )}

      {res?.request_id && (
        <div className="text-sm">
          Lagret som <span className="font-mono">{res.request_id}</span> – se <a href="/history" className="underline">History</a>.
        </div>
      )}
    </div>
  );
}

function L({label, children}:{label:string; children:any}) {
  return <label className="text-sm grid gap-1">
    <span className="opacity-70">{label}</span>
    {children}
  </label>;
}

function I({v,onChange,step}:{v:number|string; onChange:(s:string)=>void; step?:string}) {
  return <input
    type="number"
    step={step||"any"}
    className="border rounded px-2 py-1"
    value={v}
    onChange={e=>onChange(e.target.value)}
  />;
}

function Stat({title, value}:{title:string; value:string}) {
  return <div className="border rounded p-4">
    <div className="text-sm opacity-70">{title}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>;
}
