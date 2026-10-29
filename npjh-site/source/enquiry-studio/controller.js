import {validateContact, buildMessage, whatsappUrl, buildSavePayload} from './model.mjs';
export function mountEnquiryStudio(root, prefix = '') {
const lifecycle=new AbortController();
const on=(element,event,listener)=>element.addEventListener(event,listener,{signal:lifecycle.signal});
const $=(id)=>root.querySelector('#'+prefix+id);
for(const id of ['type-options','metal-options','diamond-options'])$(id).replaceChildren();
function newSubmissionId(){
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}
function currentMessage(){return buildMessage(data)+(savedReference?'\n\nEnquiry reference: '+savedReference:'');}
const defaults = () => ({type:'',metal:'Help me choose',purity:'',diamonds:'Help me choose',occasion:'',notes:'',budget:'',inspiration:'',customerName:'',phone:'',email:''});
let data = defaults(), step = 0, furthest = 0, saving = false, savedReference = '', submissionId = newSubmissionId();
const paths = {
  Ring:'<circle cx="24" cy="31" r="12"/><path d="m17 10 4-5h6l4 5-7 10-7-10h14M21 5l3 15 3-15"/>',
  Earrings:'<path d="M13 7v6c0 5-8 11-8 17a8 8 0 0 0 16 0c0-6-8-12-8-17m22-6v6c0 5-8 11-8 17a8 8 0 0 0 16 0c0-6-8-12-8-17M10 31l3-6 3 6-3 4zM32 31l3-6 3 6-3 4z"/>',
  Necklace:'<path d="M7 6c0 22 6 30 17 30S41 28 41 6M13 6c0 18 3 23 11 23S35 24 35 6m-16 30 5 8 5-8M7 16l5-1m0 11 5-3m7 6v7m8-10 4 3m0-14 5 1"/>',
  Bracelet:'<ellipse cx="24" cy="25" rx="19" ry="12"/><ellipse cx="24" cy="25" rx="14" ry="8"/><path d="m24 8 5 5-5 5-5-5zM7 21l4 3-4 4m34-7-4 3 4 4M19 37l5-6 5 6"/>',
  Bangles:'<ellipse cx="20" cy="24" rx="12" ry="18"/><ellipse cx="29" cy="24" rx="12" ry="18"/><path d="M15 10c-7 7-7 20 0 28m19-28c7 7 7 20 0 28"/>',
  Pendant:'<path d="M10 5c0 16 5 21 14 21S38 21 38 5m-14 21v6m-8 4 8-7 8 7-8 10-8-10h16m-8-7v17"/>',
  'Help me choose':'<path d="m24 4 5 14 15 6-15 5-5 15-5-15-15-5 15-6zM37 5v8m-4-4h8"/>'
};
function choice(name,value,body) {
  const label=document.createElement('label'); label.className='choice';
  const input=document.createElement('input'); input.type='radio'; input.name=name; input.value=value; input.setAttribute('aria-label',value); input.checked=data[name]===value;
  const span=document.createElement('span'); span.className='choice-body'; span.innerHTML=body;
  label.append(input,span);
  on(input,'change',()=>{data[name]=value;if(name==='metal'&&!value.includes('gold')){data.purity='';$('purity').value='';}invalidateDraft();refresh();if(name==='type')clearField('type');});
  return label;
}
for(const [name,path] of Object.entries(paths)) $('type-options').append(choice('type',name,'<svg viewBox="0 0 48 48" aria-hidden="true">'+path+'</svg><span>'+name+'</span>'));
for(const [value,colour] of [['Yellow gold','yellow'],['White gold','white'],['Rose gold','rose'],['Platinum','platinum'],['Help me choose','']]) $('metal-options').append(choice('metal',value,(colour?'<i class="metal-dot '+colour+'" aria-hidden="true"></i>':'')+'<span>'+value+'</span>'));
for(const [value,hint] of [['Natural diamonds','Mined diamonds'],['Lab-grown diamonds','Laboratory-grown diamonds'],['No diamonds','Let the metal shine'],['Help me choose','Explore the options together']]) $('diamond-options').append(choice('diamonds',value,'<span>'+value+'</span><small>'+hint+'</small>'));
for(const key of ['occasion','purity','notes','budget','inspiration','customerName','phone','email']) {
  const element=$(key==='customerName'?'customer-name':key);
  on(element,'input',()=>{data[key]=element.value;invalidateDraft();refresh();clearField(key);});
  on(element,'change',()=>{data[key]=element.value;invalidateDraft();refresh();});
}
function summaryRow(label,value){const row=document.createElement('div');row.className='summary-row';const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);return row;}
function refresh(){
  $('purity-field').hidden=!data.metal.includes('gold');
  $('note-count').textContent=data.notes.length+' / 1000';
  const rows=[['Piece',data.type||'Choose your piece'],['Metal',data.metal+(data.purity?' · '+data.purity:'')],['Diamonds',data.diamonds],['Occasion',data.occasion||'Prefer to discuss']];
  if(data.budget)rows.push(['Budget',data.budget]);
  $('selection-summary').replaceChildren(...rows.map(([l,v])=>summaryRow(l,v)));
  if(step===3)$('message-preview').textContent=currentMessage();
}
function invalidateDraft(){
  savedReference='';submissionId=newSubmissionId();$('save-status').textContent='';$('save-status').removeAttribute('data-state');$('prepare').disabled=false;$('prepare').textContent='Save enquiry & prepare WhatsApp draft →';
  $('draft-ready').hidden=true;$('prepare-area').hidden=false;$('whatsapp-draft').removeAttribute('href');$('consent').checked=false;$('copy-status').textContent='You’re in control. Your message has not been sent.';clearField('consent');
}
const fieldMap={customerName:'customer-name',phone:'phone',email:'email',type:'type-field',consent:'consent'};
const errorMap={customerName:'name-error',phone:'phone-error',email:'email-error',type:'type-error',consent:'consent-error'};
function clearField(key){if(errorMap[key]){$(errorMap[key]).hidden=true;$(fieldMap[key]).removeAttribute('aria-invalid');}if(key==='inspiration')$('inspiration').removeAttribute('aria-invalid');if(!$('form-error').hidden)$('form-error').hidden=true;}
function clearErrors(){for(const key of Object.keys(errorMap))clearField(key);$('form-error').hidden=true;}
function showError(key,message){$(errorMap[key]).textContent=message;$(errorMap[key]).hidden=false;$(fieldMap[key]).setAttribute('aria-invalid','true');}
function validate(targetStep){
  clearErrors();
  if(targetStep>0&&!data.type){go(0);showError('type','Please choose a piece, or choose “Help me choose”.');root.querySelector('input[name="type"]').focus();return false;}
  if(targetStep>1&&data.inspiration.trim()){
    let valid=false;try{const link=new URL(data.inspiration.trim());valid=['https:','http:'].includes(link.protocol)&&link.hostname.includes('.');}catch{}
    if(!valid){go(1);$('inspiration').closest('details').open=true;$('form-error').textContent='Use a complete inspiration link beginning with https:// or http://, or leave it empty.';$('form-error').hidden=false;$('inspiration').setAttribute('aria-invalid','true');$('inspiration').focus();return false;}
  }
  if(targetStep>2){
    const errors=validateContact(data),keys=Object.keys(errors);
    if(keys.length){go(2);for(const key of keys)showError(key,errors[key]);$(fieldMap[keys[0]]).focus();return false;}
  }
  return true;
}
function go(next){
  if(saving)return;
  step=next;furthest=Math.max(furthest,next);
  root.querySelectorAll('[data-panel]').forEach(el=>el.hidden=Number(el.dataset.panel)!==step);
  root.querySelectorAll('[data-step]').forEach(el=>{const index=Number(el.dataset.step);el.disabled=index>furthest;el.classList.toggle('complete',index<step);if(index===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('back').hidden=step===0;$('next').hidden=step===3;$('step-count').textContent='Step '+(step+1)+' of 4';
  if(step<3)$('next').innerHTML=['Next: preferences <span>→</span>','Next: contact details <span>→</span>','Review my enquiry <span>→</span>'][step];
  refresh();
  const card=root.querySelector('.form-card');card.scrollIntoView({behavior:'instant',block:'start'});
  root.querySelector('[data-panel="'+step+'"] h2').focus({preventScroll:true});
}
on($('enquiry-form'),'submit',event=>{event.preventDefault();if(step<3&&validate(step+1))go(step+1);});
on($('back'),'click',()=>{clearErrors();go(Math.max(0,step-1));});
root.querySelectorAll('[data-step]').forEach(button=>on(button,'click',()=>{const target=Number(button.dataset.step);if(target<=step||validate(target)){clearErrors();go(target);}}));
on($('edit-enquiry'),'click',()=>go(1));
on($('consent'),'change',()=>{clearField('consent');if(!$('consent').checked){$('draft-ready').hidden=true;$('prepare-area').hidden=false;$('whatsapp-draft').removeAttribute('href');}});
on($('prepare'),'click',async()=>{
  if(saving||!validate(3))return;
  if(!$('consent').checked){showError('consent','Please agree to saving your details for this enquiry before continuing.');$('consent').focus();return;}
  const payload=buildSavePayload(data,submissionId,$('website').value);
  saving=true;$('prepare').disabled=true;$('prepare').textContent='Saving your enquiry…';$('back').disabled=true;
  root.querySelectorAll('[data-step]').forEach(el=>el.disabled=true);
  $('enquiry-form').setAttribute('aria-busy','true');$('save-status').textContent='Saving your enquiry securely…';$('save-status').removeAttribute('data-state');
  try{
    const response=await fetch('/.netlify/functions/save-enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.any([lifecycle.signal,AbortSignal.timeout(20000)])});
    let result;try{result=await response.json();}catch{throw new Error('We could not connect to enquiry storage. Please retry.');}
    if(!response.ok||!result.saved||result.reference!==submissionId)throw new Error(response.status===429?'Too many attempts. Please wait a minute and retry.':result.error||'We could not confirm your enquiry was saved. Please retry.');
    savedReference=result.reference;$('save-status').textContent='Your enquiry is saved. Reference: '+savedReference+'. Open your WhatsApp draft when you’re ready.';$('save-status').dataset.state='success';$('prepare-area').hidden=true;
  }catch(error){
    if(lifecycle.signal.aborted)return;
    $('save-status').textContent='We could not confirm your enquiry was saved. You can retry saving, or open the WhatsApp draft below. Sending in WhatsApp does not confirm website storage.';$('save-status').dataset.state='error';$('prepare').textContent='Retry saving enquiry →';$('prepare').disabled=false;
  }finally{
    saving=false;if(lifecycle.signal.aborted)return;
    $('enquiry-form').removeAttribute('aria-busy');$('back').disabled=false;
    root.querySelectorAll('[data-step]').forEach(el=>el.disabled=Number(el.dataset.step)>furthest);
    const message=currentMessage();$('message-preview').textContent=message;$('whatsapp-draft').href=whatsappUrl(message);$('draft-ready').hidden=false;$('draft-ready').scrollIntoView({behavior:'instant',block:'nearest'});
  }
});
on($('copy-message'),'click',async()=>{try{await navigator.clipboard.writeText(currentMessage());$('copy-status').textContent='Message copied. Paste it into your WhatsApp conversation.';}catch{$('copy-status').textContent='Copy is unavailable here. Select and copy the message shown above.';const selection=window.getSelection(),range=document.createRange();range.selectNodeContents($('message-preview'));selection.removeAllRanges();selection.addRange(range);}});
on($('reset'),'click',()=>{if(!saving)$('reset-dialog').showModal();});
on($('keep-enquiry'),'click',()=>$('reset-dialog').close());
on($('confirm-reset'),'click',()=>{
  data=defaults();furthest=0;$('enquiry-form').reset();
  for(const key of ['metal','diamonds'])root.querySelectorAll('input[name="'+key+'"]').forEach(el=>el.checked=el.value===data[key]);
  root.querySelector('.extra-details').open=false;invalidateDraft();clearErrors();$('inspiration').removeAttribute('aria-invalid');$('reset-dialog').close();go(0);
});

refresh();
return()=>{lifecycle.abort();if($('reset-dialog').open)$('reset-dialog').close();};
}
