export const enquiryTypes = ["collection", "custom", "appointment"] as const;
export type EnquiryType = typeof enquiryTypes[number];
export type RequestDraft = {type:EnquiryType;name:string;phone:string;collection:string;piece:string;metal:string;stones:string;budget:string;timing:string;notes:string;reference:string;date:string;time:string};
export const initialDraft:RequestDraft={type:"custom",name:"",phone:"",collection:"Gold Heirlooms",piece:"Ring",metal:"Guide me",stones:"Guide me",budget:"Discuss with the team",timing:"Flexible",notes:"",reference:"",date:"",time:"Flexible within showroom hours"};
export function indiaDate(now=new Date()) {
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;
}
export function validateDraft(d:RequestDraft,today=indiaDate()) {
 const errors:Record<string,string>={};
 if(d.name.trim().length<2)errors.name="Please enter your name (at least 2 characters).";
 if(d.name.trim().length>80)errors.name="Please keep your name under 80 characters.";
 if(d.phone.trim()&&!/^\+?[\d\s()-]{7,24}$/.test(d.phone.trim()))errors.phone="Enter a valid phone number.";
 const digits=d.phone.replace(/\D/g,"");if(d.phone.trim()&&(digits.length<7||digits.length>15))errors.phone="Please enter 7–15 digits.";
 if(d.notes.length>1200)errors.notes="Please keep your notes under 1,200 characters.";
 if(d.type==="custom"&&d.notes.trim().length<10)errors.notes="Tell us about your idea (at least 10 characters).";
 if(d.type==="appointment"){
  const date=new Date(d.date+"T00:00:00Z");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==d.date)errors.date="Choose a valid preferred date.";
  else if(d.date<today)errors.date="Please choose today or a future date.";
  else if(date.getUTCDay()===3)errors.date="Our showroom is closed on Wednesday. Please choose another day.";
 }
 if(d.type==="custom"&&d.reference.trim())try{const u=new URL(d.reference.trim());if(!["http:","https:"].includes(u.protocol))throw new Error();}catch{errors.reference="Use a full link beginning with https:// or http://.";}
 return errors;
}
export function prepareMessage(d:RequestDraft){
 const purpose={collection:"a collection enquiry",custom:"a custom jewellery request",appointment:"a showroom appointment request"}[d.type];
 const lines=[`Hello Nu Punjab Jewellery House, I would like to discuss ${purpose}.`,"",`Name: ${d.name.trim()}`];
 if(d.phone.trim())lines.push(`Contact: ${d.phone.trim()}`);
 if(d.type==="collection")lines.push(`Collection: ${d.collection}`,`Budget: ${d.budget}`);
 if(d.type==="custom"){lines.push(`Piece: ${d.piece}`,`Metal: ${d.metal}`,`Stones: ${d.stones}`,`Budget: ${d.budget}`,`Timing: ${d.timing}`);if(d.reference.trim())lines.push(`Inspiration link: ${d.reference.trim()}`);}
 if(d.type==="appointment")lines.push(`Preferred date: ${new Date(d.date+"T00:00:00Z").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}`,`Preferred time: ${d.time}`,`Interested in: ${d.collection}`);
 if(d.notes.trim())lines.push(`Notes: ${d.notes.trim()}`);
 if(d.type==="appointment")lines.push("Please confirm availability for my preferred visit.");return lines.join("\n");
}
export function whatsappUrl(message:string){return `https://wa.me/919818208000?text=${encodeURIComponent(message)}`;}
