'use strict';
(() => {
  const content=document.getElementById('rates-content');
  const dateLabel=document.getElementById('rates-date');
  const refresh=document.getElementById('refresh-rates');
  let loading=false;
  function unavailable(){dateLabel.textContent='';content.replaceChildren();const message=document.createElement('span');message.className='rate-unavailable';message.append('Rates temporarily unavailable. ');const link=document.createElement('a');link.href='tel:+919818208000';link.textContent='Call for today’s rates';message.append(link);content.append(message);}
  async function loadRates(){
    if(loading)return;loading=true;refresh.disabled=true;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch('/api/gold-rates',{signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw new Error('unavailable');
      const rates=await response.json();
      if(!Number.isFinite(rates.gold24)||!Number.isFinite(rates.gold22)||rates.gold24<=0||rates.gold22<=0||!/^\d{4}-\d{2}-\d{2}$/.test(rates.sourceDate||''))throw new Error('invalid');
      const date=new Date(rates.sourceDate+'T12:00:00+05:30');
      if(!Number.isFinite(date.getTime())||Date.now()-date.getTime()>7*86400000||date.getTime()-Date.now()>86400000)throw new Error('outdated');
      dateLabel.textContent='As of '+new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(date);
      const fragment=document.createDocumentFragment();
      for(const [label,value] of [['24K',rates.gold24],['22K',rates.gold22],['Silver',rates.silver]]){
        if(!Number.isFinite(value)||value<=0)continue;
        const item=document.createElement('span');item.className='rate-item';item.append(label+' ');const amount=document.createElement('b');amount.textContent=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);const unit=document.createElement('small');unit.textContent='/g';amount.append(unit);item.append(amount);fragment.append(item);
      }
      content.replaceChildren(fragment);
    }catch{unavailable();}finally{clearTimeout(timeout);loading=false;refresh.disabled=false;}
  }
  refresh.addEventListener('click',loadRates);loadRates();setInterval(()=>{if(document.visibilityState==='visible')loadRates();},300000);

  const widget=document.getElementById('instagram-widget');const status=document.getElementById('instagram-status');
  function fallback(){if(status.hidden)return;status.querySelector('p').textContent='Explore our latest pieces directly on Instagram.';}
  const observer=new MutationObserver(()=>{if(widget.childElementCount>0){status.hidden=true;observer.disconnect();}});observer.observe(widget,{childList:true,subtree:true});
  const script=document.createElement('script');script.src='https://elfsightcdn.com/platform.js';script.async=true;script.addEventListener('error',fallback);document.body.append(script);setTimeout(fallback,15000);
})();
