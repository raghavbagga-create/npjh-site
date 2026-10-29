export const WHATSAPP_NUMBER = '919818208000';
export function normaliseRawRates(raw) {
  const value=(input)=>{const n=Number(input);if(!Number.isFinite(n)||n<=0)throw new Error('Invalid rate');return Math.round(n*1.03);};
  const gold24=value(raw?.rates?.gold_rates?.gold_999),gold22=value(raw?.rates?.gold_rates?.gold_916);
  let silver=null;try{silver=value(raw?.rates?.silver_rates?.silver_999);}catch{}
  let sourceDate=null;const source=raw?.history?.[0]?.date;
  if(typeof source==='string'&&/^\d{2}\/\d{2}\/\d{4}$/.test(source)){
    const [day,month,year]=source.split('/'),iso=year+'-'+month+'-'+day,parsed=new Date(iso+'T00:00:00Z');
    if(!Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===iso)sourceDate=iso;
  }
  return {gold24,gold22,silver,sourceDate};
}
export function normalisePhone(value) {
  const raw = value.trim();
  if (!/^[+\d\s().-]+$/.test(raw) || (raw.includes('+') && !raw.startsWith('+'))) return null;
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) {
    if (!/^\+[\d\s().-]+$/.test(raw) || !/^[1-9]\d{7,14}$/.test(digits)) return null;
    if (digits.startsWith('91') && !/^91[6-9]\d{9}$/.test(digits)) return null;
    return '+' + digits;
  }
  if (/^[6-9]\d{9}$/.test(digits)) return '+91' + digits;
  if (/^91[6-9]\d{9}$/.test(digits)) return '+' + digits;
  return null;
}
export function validateContact(data) {
  const errors = {};
  if (data.customerName.trim().length < 2) errors.customerName = 'Please enter your name (at least 2 characters).';
  if (!normalisePhone(data.phone)) errors.phone = 'Enter a valid Indian mobile number, or an international number with + and country code.';
  if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Please enter a valid email address, or leave this optional field empty.';
  return errors;
}
export function buildMessage(data) {
  const lines = [
    'Hello Nu Punjab Jewellery House,',
    'I would like to discuss a jewellery enquiry.', '',
    'Jewellery: ' + data.type,
    'Metal: ' + data.metal + (data.metal.includes('gold') && data.purity ? ' · ' + data.purity : ''),
    'Diamonds: ' + data.diamonds,
    'Occasion: ' + (data.occasion || 'Prefer to discuss')
  ];
  if (data.budget) lines.push('Approximate budget: ' + data.budget);
  if (data.notes.trim()) lines.push('', 'Customisation notes:', data.notes.trim());
  if (data.inspiration.trim()) lines.push('', 'Inspiration: ' + data.inspiration.trim());
  lines.push('', 'Name: ' + data.customerName.trim(), 'Mobile: ' + normalisePhone(data.phone));
  if (data.email.trim()) lines.push('Email: ' + data.email.trim());
  lines.push('', 'Please guide me on the design, options and quotation.');
  return lines.join('\n');
}
export function whatsappUrl(message) { return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message); }

export function buildSavePayload(data, submissionId, website = '') {
  return {
    submissionId, consent:true, consentVersion:'enquiry-contact-2026-10-21', website,
    customerName:data.customerName.trim(), customerMobile:normalisePhone(data.phone), customerEmail:data.email.trim(),
    type:data.type, metal:data.metal==='Help me choose'?'Please guide me':data.metal,
    purity:data.metal.includes('gold')&&data.purity?data.purity.replace('K','kt'):'',
    diamond:data.diamonds==='Help me choose'?'Please guide me':data.diamonds,
    occasion:({'Wedding / bridal':'Wedding / Bridal',Gifting:'A gift'})[data.occasion]||data.occasion||'Not decided yet',
    budget:data.budget, neededBy:'', inspiration:data.inspiration.trim(), notes:data.notes.trim()
  };
}
