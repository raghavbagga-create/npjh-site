"use client";
import{useEffect,useState}from"react";
import{formatRate,type GoldRates}from"@/lib/gold-rates";
export default function GoldRateTicker(){
 const[rates,setRates]=useState<GoldRates|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{
  const lifecycle=new AbortController();
  async function refresh(){
   try{
    const res=await fetch("/api/gold-rates",{signal:lifecycle.signal});
    if(!res.ok)throw new Error();const data=await res.json() as GoldRates;
    if(!Number.isFinite(data.gold24)||!Number.isFinite(data.gold22)||data.gold24<=0||data.gold22<=0)throw new Error();
    if(!lifecycle.signal.aborted){setRates(data);setLoading(false);}
   }catch{if(!lifecycle.signal.aborted){setRates(null);setLoading(false);}}
  }
  void refresh();const interval=setInterval(()=>{if(document.visibilityState!=="hidden")void refresh();},300000);
  return()=>{lifecycle.abort();clearInterval(interval);};
 },[]);
 const date=rates?.sourceDate?new Date(rates.sourceDate+"T00:00:00Z").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}):null;
 return <div id="gold-ticker" className="gold-ticker" aria-label="Indicative gold and silver rates per gram" aria-live="polite">
  <div className="ticker-heading"><strong>GOLD RATES</strong>{date&&<span>As of {date}</span>}</div>
  {rates?<div className="ticker-rates"><span>24K <b>{formatRate(rates.gold24)}</b></span><span>22K <b>{formatRate(rates.gold22)}</b></span>{rates.silver!==null&&<span>Silver <b>{formatRate(rates.silver)}</b></span>}</div>:<span className="ticker-fallback">{loading?"Loading latest rates…":<>Rates temporarily unavailable. <a href="tel:+919818208000">Call for the latest rates</a></>}</span>}
 </div>;
}
