"use client";
import {useEffect,useRef,useState} from "react";
import {Camera} from "lucide-react";
const platform="https://elfsightcdn.com/platform.js";
export default function InstagramFeed(){
 const container=useRef<HTMLDivElement>(null);
 const [status,setStatus]=useState<"loading"|"ready"|"unavailable">("loading");
 useEffect(()=>{
  const element=container.current;if(!element)return;
  const observe=()=>{if(element.childElementCount>0)setStatus("ready");};
  const observer=new MutationObserver(observe);observer.observe(element,{childList:true,subtree:true});
  let script=document.querySelector<HTMLScriptElement>(`script[src="${platform}"]`);
  const fail=()=>setStatus("unavailable");
  if(!script){script=document.createElement("script");script.src=platform;script.async=true;script.addEventListener("error",fail);document.body.appendChild(script);}
  else script.addEventListener("error",fail);
  const timeout=setTimeout(()=>{if(!element.childElementCount)setStatus("unavailable");},15000);
  observe();return()=>{observer.disconnect();clearTimeout(timeout);script?.removeEventListener("error",fail);};
 },[]);
 return <section id="instagram" className="section instagram-section">
  <div className="section-heading"><div><p className="eyebrow">From our jewellery counter</p><h2>Follow the sparkle.</h2></div><p>New arrivals, personal creations and jewellery stories from our Instagram.</p></div>
  <div className="instagram-feed">
   {status!=="ready"&&<p className="instagram-status" role="status">{status==="loading"?"Loading our latest jewellery stories…":"Explore our latest pieces directly on Instagram."}</p>}
   <div ref={container} className="elfsight-app-d2ec5c91-73b5-4d11-b5ee-3f505b7df6fd" data-elfsight-app-lazy/>
  </div>
  <a href="https://www.instagram.com/nupunjabjewelleryhouse/" target="_blank" rel="noreferrer" className="button outline-button instagram-profile"><Camera/>@nupunjabjewelleryhouse</a>
 </section>;
}
