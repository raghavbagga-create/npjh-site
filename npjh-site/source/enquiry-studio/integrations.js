import {normaliseRawRates} from './model.mjs';
const $=(id)=>document.getElementById(id);
async function refreshRates(){
  try{
    let rates;
    try{
      const res=await fetch('https://nupunjabjewelleryhouse.com/.netlify/functions/gold-rate',{signal:AbortSignal.timeout(8000)});
      if(!res.ok)throw new Error();rates=normaliseRawRates(await res.json());
    }catch{
      const res=await fetch('/api/gold-rates',{signal:AbortSignal.timeout(6000)});if(!res.ok)throw new Error();rates=await res.json();
    }
    if(![rates.gold24,rates.gold22].every(n=>Number.isFinite(n)&&n>0))throw new Error();
    for(const [id,value]of[['rate24',rates.gold24],['rate22',rates.gold22],['rateSilver',rates.silver]])$(id).textContent=Number.isFinite(value)&&value>0?'₹'+value.toLocaleString('en-IN'):'—';
    const sourceDate=rates.sourceDate&&/^\d{4}-\d{2}-\d{2}$/.test(rates.sourceDate)?new Date(rates.sourceDate+'T00:00:00Z'):null;
    $('rate-date').textContent=sourceDate&&!Number.isNaN(sourceDate.valueOf())?'Source date: '+sourceDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Indicative rates · Confirm with our team';
  }catch{
    for(const id of ['rate24','rate22','rateSilver'])$(id).textContent='—';
    $('rate-date').textContent='Rates unavailable · Call +91 98182 08000';
  }
}
void refreshRates();setInterval(()=>{if(document.visibilityState!=='hidden')void refreshRates();},300000);
const instagram=$('instagram-widget'),instagramStatus=$('instagram-status');
const observer=new MutationObserver(()=>{if(instagram.querySelector('iframe,img,[class*="Feed"],[class*="Carousel"],[class*="eapps-instagram"]'))instagramStatus.hidden=true;});
observer.observe(instagram,{childList:true,subtree:true});
const widgetScript=document.createElement('script');widgetScript.src='https://elfsightcdn.com/platform.js';widgetScript.async=true;widgetScript.onerror=()=>{instagramStatus.textContent='Explore our latest pieces directly on Instagram using the link above.';};document.body.append(widgetScript);
setTimeout(()=>{if(!instagramStatus.hidden)instagramStatus.textContent='Explore our latest pieces directly on Instagram using the link above.';},15000);
