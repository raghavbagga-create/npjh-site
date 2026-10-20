export function mountEnquiryStudio(root, prefix = '') {
  const lifecycle = new AbortController();
  const on = (target, event, listener) => target.addEventListener(event, listener, {signal: lifecycle.signal});
  const $ = (id) => root.querySelector(`#${prefix}${id}`);
  const form = $('enquiry-form');
  let activeStage = 1;
  function newSubmissionId(){
    if(crypto.randomUUID)return crypto.randomUUID();
    const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  let submissionId = newSubmissionId();
  let savedReference = '';
  let saving = false;
  const saveButton = $('save-enquiry');
  const saveStatus = $('save-status');
  const svg = (inner) => `<svg viewBox="0 0 72 64" aria-hidden="true">${inner}</svg>`;
  const diamond = '<path d="M26 14h20l7 9-17 18-17-18zM19 23h34M26 14l4 9 6 18 6-18 4-9M30 23l6-9 6 9"/>';
  const icons = {
    Ring: svg('<ellipse cx="36" cy="39" rx="18" ry="19"/><path d="M19 31c6-7 28-7 34 0M28 18l-5-7 5-7h16l5 7-5 7zM23 11h26M28 4l8 14 8-14M36 4v14"/>'),
    Earrings: svg('<path d="M22 7v9m28-9v9M22 13c-10 8-13 17-13 23a13 13 0 0 0 26 0c0-6-3-15-13-23zM50 13c-10 8-13 17-13 23a13 13 0 0 0 26 0c0-6-3-15-13-23zM22 23c-5 5-7 9-7 13a7 7 0 0 0 14 0c0-4-2-8-7-13zM50 23c-5 5-7 9-7 13a7 7 0 0 0 14 0c0-4-2-8-7-13z"/>'),
    Necklace: svg('<path d="M13 8c-3 26 1 43 23 49C58 51 62 34 59 8M19 12c-2 21 1 33 17 38 16-5 19-17 17-38"/><path d="m36 45 7 7-7 10-7-10z"/><circle cx="17" cy="27" r="3"/><circle cx="22" cy="39" r="3"/><circle cx="55" cy="27" r="3"/><circle cx="50" cy="39" r="3"/>'),
    Bracelet: svg('<ellipse cx="36" cy="32" rx="27" ry="19"/><ellipse cx="36" cy="32" rx="21" ry="13"/><path d="m36 8 6 6-6 7-6-7zM14 18l5 7M9 32h6M14 45l5-7M30 50v-5M42 50v-5M58 45l-5-7M63 32h-6M58 18l-5 7"/>'),
    Bangles: svg('<ellipse cx="31" cy="34" rx="20" ry="24"/><ellipse cx="40" cy="31" rx="20" ry="24"/><path d="M27 12c22 1 27 35 6 44M39 7c23 2 28 34 6 47M11 34h8M43 35h8M21 14l5 6M22 54l5-6"/>'),
    Pendant: svg('<path d="M20 4c1 11 5 19 16 24C47 23 51 15 52 4"/><ellipse cx="36" cy="29" rx="3" ry="5"/><path d="m36 32 14 12-14 17-14-17zM22 44h28M29 38l7 23 7-23M29 38h14"/>'),
    default: svg(diamond+'<path d="m13 7 2-5 2 5 5 2-5 2-2 5-2-5-5-2zM57 42l2-5 2 5 5 2-5 2-2 5-2-5-5-2z"/>')
  };
  const typeDescriptions = {Ring:'A little circle. A world of meaning.',Earrings:'Brilliance, beautifully paired.',Necklace:'A statement that feels like you.',Bracelet:'Something beautiful by your side.',Bangles:'Tradition with your personal touch.',Pendant:'A little story, close to your heart.'};
  const options = {
    type:['Ring','Earrings','Necklace','Bracelet','Bangles','Pendant'],
    metal:[['Yellow gold','yellow'],['White gold','white'],['Rose gold','rose'],['Platinum','platinum'],['Please guide me','unsure']],
    purity:['14kt','18kt','22kt','Please guide me'],
    diamond:[['Natural diamonds','Classic, enduring brilliance'],['Lab-grown diamonds','A considered diamond choice'],['No diamonds','Let the metal do the talking'],['Please guide me','Explore the possibilities']],
    occasion:['Wedding / Bridal','Engagement','Anniversary','A gift','Everyday wear','Another occasion']
  };
  function radio(name,value,index,labelHtml,labelClass,required=false) {
    const inputId=`${prefix}${name}-${index}`;
    const option=document.createElement('div');
    option.className='option';
    const input=document.createElement('input');
    input.type='radio';input.name=name;input.value=value;input.id=inputId;input.required=required;
    const label=document.createElement('label');label.htmlFor=inputId;label.className=labelClass;label.innerHTML=labelHtml;
    option.append(input,label);return option;
  }
  for (const id of ['type-options','metal-options','purity-options','diamond-options','occasion-options']) $(id).replaceChildren();
  options.type.forEach((v,i)=>$('type-options').append(radio('type',v,i,icons[v]+`<span>${v}</span>`,'piece-card',true)));
  options.metal.forEach(([v,swatch],i)=>$('metal-options').append(radio('metal',v,i,`<span class="metal-swatch ${swatch}" aria-hidden="true"></span><span>${v==='Please guide me'?'Guide me':v}</span>`,'metal-card',true)));
  options.purity.forEach((v,i)=>$('purity-options').append(radio('purity',v,i,v==='Please guide me'?'Guide me':v,'pill')));
  options.diamond.forEach(([v,help],i)=>$('diamond-options').append(radio('diamond',v,i,`<strong>${v==='Please guide me'?'Guide me':v}</strong><small>${help}</small>`,'stone-card',true)));
  options.occasion.forEach((v,i)=>$('occasion-options').append(radio('occasion',v,i,v,'pill',true)));
  function value(name){return (new FormData(form).get(name)||'').toString().trim();}
  function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function formatDate(raw){return new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${raw}T12:00:00`));}
  function metalDescription(){const metal=value('metal');const purity=value('purity');return metal+(metal.toLowerCase().includes('gold')&&purity?` · ${purity==='Please guide me'?'purity to discuss':purity}`:'');}
  function getMessage(){
    const lines=[`Hello Nu Punjab Jewellery House,`,``, `My name is ${value('customerName')}. I would like to discuss a jewellery enquiry.`,``, `Jewellery: ${value('type')}`,`Metal: ${metalDescription()}`,`Diamond preference: ${value('diamond')}`,`Occasion: ${value('occasion')}`];
    lines.push(`Mobile: ${value('customerMobile')}`);
    if(value('customerEmail'))lines.push(`Email: ${value('customerEmail')}`);
    if(savedReference)lines.push(`Enquiry reference: ${savedReference}`);
    if(value('budget'))lines.push(`Approximate budget: ${value('budget')}`);
    if(value('neededBy'))lines.push(`Preferred date: ${formatDate(value('neededBy'))}`);
    if(value('inspiration'))lines.push(`Inspiration: ${value('inspiration')}`);
    if(value('notes'))lines.push('',`Personalisation / design notes:`,value('notes'));
    lines.push('',`Please guide me on the design, options and quotation. Thank you.`);
    return lines.join('\n');
  }
  function updateSummary(){
    const type=value('type'),metal=value('metal');
    const isGold=metal.toLowerCase().includes('gold');
    $('purity-group').hidden=!isGold;
    $('purity-group').disabled=!isGold;
    $('summary-type').textContent=type||'Yet to be imagined';
    $('summary-metal').textContent=metal?metalDescription():'Your choice';
    $('summary-diamond').textContent=value('diamond')||'Your choice';
    $('summary-occasion').textContent=value('occasion')||'Your moment';
    $('summary-icon').innerHTML=icons[type]||icons.default;
    $('summary-description').textContent=typeDescriptions[type]||'Your choices, beautifully brought together.';
    $('summary-budget-row').hidden=!value('budget');
    $('summary-budget').textContent=value('budget');
    $('summary-date-row').hidden=!value('neededBy');
    $('summary-date').textContent=value('neededBy')?formatDate(value('neededBy')):'';
    $('summary-notes-wrap').hidden=!value('notes');
    $('summary-notes').textContent=value('notes');
    $('notes-count').textContent=`${$('notes').value.length} / 1000`;
    if(activeStage===3){$('message-preview').value=getMessage();$('whatsapp-link').href=`https://wa.me/919818208000?text=${encodeURIComponent(getMessage())}`;}
  }
  function clearError(){
    $('form-error').hidden=true;
    root.querySelectorAll('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));
  }
  function showError(message,control){
    $('form-error').textContent=message;$('form-error').hidden=false;
    if(control){control.setAttribute('aria-invalid','true');control.focus({preventScroll:true});}
    $('form-error').scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    return false;
  }
  function displayStage(stage,scroll=true){
    activeStage=stage;
    root.querySelectorAll('[data-stage]').forEach(el=>el.hidden=Number(el.dataset.stage)!==stage);
    root.querySelectorAll('[data-step]').forEach(el=>{const n=Number(el.dataset.step);el.classList.toggle('active',n===stage);el.classList.toggle('complete',n<stage);if(n===stage)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    $('copy-status').textContent='';
    updateSummary();
    if(scroll){root.querySelector('.steps').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});root.querySelector(`.step[data-step="${stage}"]`).focus({preventScroll:true});}
  }
  function validatePiece(){
    for(const [name,label] of [['type','jewellery type'],['metal','preferred metal'],['diamond','diamond preference']]){
      if(!value(name)){if(activeStage!==1)displayStage(1,false);return showError(`Please choose your ${label}.${name==='type'?'':' “Guide me” is available if you’re unsure.'}`,form.querySelector(`input[name="${name}"]`));}
    }return true;
  }
  function validateDetails(){
    if(!value('occasion'))return showError('Please choose an occasion for your piece.',form.querySelector('input[name="occasion"]'));
    if(!value('customerName'))return showError('Please enter your name so we can make the conversation personal.',$('customer-name'));
    const mobile=value('customerMobile');
    if(!/^\+?[\d\s().-]+$/.test(mobile)||!/^\+?\d{8,15}$/.test(mobile.replace(/[\s().-]/g,'')))return showError('Please enter a mobile number with 8 to 15 digits.',$('customer-mobile'));
    if(value('customerEmail')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('customerEmail')))return showError('Please enter a valid email address, or leave it empty.',$('customer-email'));
    const date=value('neededBy');
    if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<today()))return showError('Please choose today or a future date.',$('needed-by'));
    const inspiration=value('inspiration');
    if(inspiration){try{const link=new URL(inspiration);if(!['https:','http:'].includes(link.protocol)||!link.hostname.includes('.'))throw new Error('invalid');}catch{return showError('Please enter a complete inspiration link beginning with https:// or http://.',$('inspiration'));}}
    return true;
  }
  function goTo(stage){
    if(saving)return;
    clearError();
    if(stage>1&&!validatePiece())return;
    if(stage===3){if(activeStage!==2)displayStage(2,false);if(!validateDetails())return;}
    displayStage(stage);
  }
  on(form,'submit',e=>{e.preventDefault();goTo(activeStage===1?2:3);});
  function detailsChanged(event){
    clearError();
    if(!['consent','website'].includes(event.target.name)){
      submissionId=newSubmissionId();savedReference='';saveStatus.textContent='';saveStatus.removeAttribute('data-state');
      saveButton.disabled=false;saveButton.textContent='Save enquiry & prepare WhatsApp →';$('whatsapp-actions').hidden=true;
    }
    updateSummary();
  }
  on(form,'input',detailsChanged);
  on(form,'change',detailsChanged);
  on($('to-details'),'click',()=>goTo(2));
  on($('to-review'),'click',()=>goTo(3));
  root.querySelectorAll('[data-step]').forEach(el=>on(el,'click',()=>goTo(Number(el.dataset.step))));
  root.querySelectorAll('[data-back]').forEach(el=>on(el,'click',()=>goTo(Number(el.dataset.back))));
  on($('edit-details'),'click',()=>goTo(2));
  on(saveButton,'click',async()=>{
    if(saving||savedReference)return;
    clearError();
    if(!validatePiece())return;
    if(!validateDetails()){displayStage(2,false);return;}
    if(!$('contact-consent').checked)return showError('Please agree to saving your details before submitting this enquiry.',$('contact-consent'));
    const payload={submissionId,consent:true,consentVersion:'enquiry-contact-2026-10-21',website:value('website')};
    for(const name of ['customerName','customerMobile','customerEmail','type','metal','purity','diamond','occasion','budget','neededBy','inspiration','notes'])payload[name]=value(name);
    saving=true;saveButton.disabled=true;saveButton.textContent='Saving your enquiry…';saveStatus.textContent='Please wait while we save your enquiry.';saveStatus.removeAttribute('data-state');form.setAttribute('aria-busy','true');
    try{
      const response=await fetch('/.netlify/functions/save-enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.any([lifecycle.signal,AbortSignal.timeout(20000)])});
      let result;
      try{result=await response.json();}catch{throw new Error('We could not connect to enquiry storage. Please retry.');}
      if(!response.ok||!result.saved||result.reference!==submissionId)throw new Error(response.status===429?'Too many attempts. Please wait a minute and retry.':result.error||'We could not confirm your enquiry was saved. Please retry.');
      savedReference=result.reference;
      saveStatus.textContent=`Thank you. Your enquiry is saved. Reference: ${savedReference}. You can now open your WhatsApp draft whenever you’re ready.`;saveStatus.dataset.state='success';saveButton.textContent='Enquiry saved ✓';
    }catch(error){
      if(lifecycle.signal.aborted)return;
      saveStatus.textContent=(error.name==='TimeoutError'?'Saving took too long. Please retry to confirm; retries will not create a duplicate.':error.message==='Failed to fetch'?'We could not connect to save your enquiry. Please retry.':error.message)+' You can also use the WhatsApp draft below; sending it does not confirm website storage.';
      saveStatus.dataset.state='error';saveButton.disabled=false;saveButton.textContent='Retry saving enquiry →';
    }finally{
      saving=false;form.removeAttribute('aria-busy');
      if(!lifecycle.signal.aborted){$('whatsapp-actions').hidden=false;updateSummary();}
    }
  });
  on($('copy-message'),'click',async()=>{
    try{await navigator.clipboard.writeText(getMessage());$('copy-status').textContent='Message copied. You can paste it into WhatsApp.';}
    catch{$('message-preview').focus();$('message-preview').select();$('copy-status').textContent='Select and copy the highlighted message using your device’s Copy command.';}
  });
  on($('whatsapp-link'),'click',()=>{$('copy-status').textContent='Your draft will open in WhatsApp. Tap Send there when you’re ready.';});
  on($('reset-enquiry'),'click',()=>{if(!saving)$('reset-dialog').showModal();});
  on($('cancel-reset'),'click',()=>$('reset-dialog').close());
  on($('confirm-reset'),'click',()=>{form.reset();submissionId=newSubmissionId();savedReference='';saveStatus.textContent='';saveStatus.removeAttribute('data-state');saveButton.disabled=false;saveButton.textContent='Save enquiry & prepare WhatsApp →';$('whatsapp-actions').hidden=true;clearError();$('message-preview').value='';$('whatsapp-link').href='#';$('reset-dialog').close();displayStage(1);});
  $('needed-by').min=today();
  if ($('year')) $('year').textContent=new Date().getFullYear();
  displayStage(1,false);
  return () => { lifecycle.abort(); if ($('reset-dialog').open) $('reset-dialog').close(); };
}
