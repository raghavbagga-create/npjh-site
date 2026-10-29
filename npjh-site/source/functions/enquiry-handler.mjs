import {createHash} from 'node:crypto';

export const CONSENT_VERSION = 'enquiry-contact-2026-10-21';
const origins = new Set(['https://nupunjabjewelleryhouse.com', 'https://www.nupunjabjewelleryhouse.com', 'https://lovely-duckanoo-1ed5e7.netlify.app']);
const choices = {
  type: ['Ring', 'Earrings', 'Necklace', 'Bracelet', 'Bangles', 'Pendant', 'Help me choose'],
  metal: ['Yellow gold', 'White gold', 'Rose gold', 'Platinum', 'Please guide me'],
  purity: ['', '14kt', '18kt', '22kt', 'Please guide me'],
  diamond: ['Natural diamonds', 'Lab-grown diamonds', 'No diamonds', 'Please guide me'],
  occasion: ['Not decided yet', 'Wedding / Bridal', 'Engagement', 'Anniversary', 'A gift', 'Everyday wear', 'Another occasion', 'Birthday', 'Festive celebration'],
  budget: ['', 'Under ₹50,000', '₹50,000–₹1 lakh', '₹1–2 lakh', '₹2–5 lakh', '₹5–10 lakh', 'Above ₹10 lakh', '₹1–3 lakh', '₹3–5 lakh', '₹5 lakh and above']
};
class InvalidEnquiry extends Error {}
function invalid(message) { throw new InvalidEnquiry(message); }
function text(data, key, limit, required = false) {
  if (typeof data[key] !== 'string') { if (!required && data[key] == null) return ''; invalid(`Please check ${key}.`); }
  const value = data[key].trim();
  if (value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) || (required && !value)) invalid(`Please check ${key}.`);
  return value;
}
export function validateEnquiry(data) {
  if (!data || Array.isArray(data) || typeof data !== 'object') invalid('Please check your enquiry.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId || '')) invalid('Please refresh and try again.');
  if (data.consent !== true || data.consentVersion !== CONSENT_VERSION) invalid('Please agree to saving your details for this enquiry.');
  if (data.website) invalid('Unable to accept this enquiry.');
  const clean = {
    customerName: text(data, 'customerName', 80, true),
    customerMobile: text(data, 'customerMobile', 24, true),
    customerEmail: text(data, 'customerEmail', 254),
    neededBy: text(data, 'neededBy', 10), inspiration: text(data, 'inspiration', 500), notes: text(data, 'notes', 1000)
  };
  if (/[\r\n]/.test(clean.customerName)) invalid('Please enter your name on one line.');
  if (!/^\+?[\d\s().-]+$/.test(clean.customerMobile)) invalid('Please enter a valid mobile number.');
  clean.customerMobile = clean.customerMobile.replace(/[\s().-]/g, '');
  if (!/^\+?\d{8,15}$/.test(clean.customerMobile)) invalid('Please enter a mobile number with 8 to 15 digits.');
  if (clean.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.customerEmail)) invalid('Please enter a valid email address.');
  for (const [key, allowed] of Object.entries(choices)) {
    const v = text(data, key, 60);
    if (!allowed.includes(v)) invalid(`Please choose your ${key}.`);
    clean[key] = v;
  }
  if (!clean.metal.toLowerCase().includes('gold')) clean.purity = '';
  if (clean.neededBy) {
    const date = new Date(`${clean.neededBy}T12:00:00Z`);
    const indiaToday = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.neededBy) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== clean.neededBy || clean.neededBy < indiaToday) invalid('Please choose today or a future date.');
  }
  if (clean.inspiration) {
    try { const url = new URL(clean.inspiration); if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) invalid('Please check your inspiration link.'); }
    catch { invalid('Please check your inspiration link.'); }
  }
  return clean;
}
function response(status, value) {
  return Response.json(value, {status, headers:{'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
}
// Storage is supplied by the server runtime. No public record-reading endpoint exists.
export function createEnquiryHandler(openStore) {
  return async request => {
    if (request.method !== 'POST') return response(405, {error:'Use POST to submit an enquiry.'});
    if (!origins.has(request.headers.get('origin'))) return response(403, {error:'Please submit through our website.'});
    if (!request.headers.get('content-type')?.startsWith('application/json')) return response(415, {error:'Please submit your enquiry as JSON.'});
    if (Number(request.headers.get('content-length')) > 12000) return response(413, {error:'This enquiry is too long.'});
    let data, clean;
    try {
      const body = await request.text();
      if (Buffer.byteLength(body) > 12000) return response(413, {error:'This enquiry is too long.'});
      data = JSON.parse(body);
      clean = validateEnquiry(data);
    } catch (error) {
      return response(400, {error:error instanceof InvalidEnquiry ? error.message : 'Please check your enquiry and try again.'});
    }
    try {
      const store = openStore();
      const id = data.submissionId.toLowerCase();
      const fingerprint = createHash('sha256').update(JSON.stringify(clean)).digest('hex');
      const key = `${id}.json`;
      const record = {id, createdAt:new Date().toISOString(), source:'website-enquiry-studio', ...clean, consent:{accepted:true, version:CONSENT_VERSION, purpose:'Save contact details and jewellery preferences; contact customer about this enquiry.'}, fingerprint};
      await store.setJSON(key, record, {onlyIfNew:true, metadata:{createdAt:record.createdAt}});
      // Confirm persistence with a strongly consistent read, including retry deduplication.
      const stored = await store.get(key, {type:'json', consistency:'strong'});
      if (!stored || stored.id !== id) throw new Error('Unable to confirm storage');
      if (stored.fingerprint !== fingerprint) return response(409, {error:'This enquiry has changed. Please refresh and try again.'});
      return response(201, {saved:true, reference:id, createdAt:stored.createdAt});
    } catch {
      // Deliberately omit payloads and personal details from logs and error responses.
      return response(503, {error:'We could not confirm your enquiry was saved. Please retry, or send your WhatsApp draft directly.'});
    }
  };
}
