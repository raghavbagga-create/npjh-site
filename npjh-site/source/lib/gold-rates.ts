export type GoldRates={gold24:number;gold22:number;silver:number|null;sourceDate:string|null};
export function normalizeGoldRates(data:unknown):GoldRates {
 const d=data as {rates?:{gold_rates?:{gold_999?:unknown;gold_916?:unknown};silver_rates?:{silver_999?:unknown}};history?:{date?:unknown}[]};
 const amount=(value:unknown)=>{const n=Number(value);if(!Number.isFinite(n)||n<=0)throw new Error("Invalid rate");return Math.round(n*1.03);};
 const gold24=amount(d?.rates?.gold_rates?.gold_999),gold22=amount(d?.rates?.gold_rates?.gold_916);
 let silver:number|null=null;try{silver=amount(d?.rates?.silver_rates?.silver_999);}catch{}
 let sourceDate:string|null=null;const date=d?.history?.[0]?.date;
 if(typeof date==="string"&&/^\d{2}\/\d{2}\/\d{4}$/.test(date)){
  const[day,month,year]=date.split("/");const iso=`${year}-${month}-${day}`;const parsed=new Date(iso+"T00:00:00Z");
  if(!Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===iso)sourceDate=iso;
 }
 return{gold24,gold22,silver,sourceDate};
}
export function formatRate(value:number){return `₹${value.toLocaleString("en-IN")}/g`;}
