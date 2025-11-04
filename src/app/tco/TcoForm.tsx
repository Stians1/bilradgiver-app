"use client";
import { useState } from "react";
export default function TcoForm(){
  const [out,setOut]=useState<any>(null);
  async function run(){
    const r=await fetch("/api/tco/save",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({inputs:{mileage:12000,fuelPrice:22,electricityPrice:1.5}})});
    setOut(await r.json());
  }
  return <div><button onClick={run} className="border px-3 py-2 rounded">Beregn & lagre</button>
  {out&&<pre className="mt-3 bg-neutral-100 p-2 rounded">{JSON.stringify(out,null,2)}</pre>}</div>;
}
