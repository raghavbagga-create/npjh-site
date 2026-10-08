import {normalizeGoldRates} from '../lib/gold-rates';
const {handler:fetchRawRates}=require('./gold-rate.js');
export async function handler(){
 try{
  const res=await fetchRawRates();if(res.statusCode!==200)throw new Error('Rates unavailable');
  return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=300, s-maxage=300'},body:JSON.stringify(normalizeGoldRates(JSON.parse(res.body)))};
 }catch{return {statusCode:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({error:'Rates temporarily unavailable'})};}
}
