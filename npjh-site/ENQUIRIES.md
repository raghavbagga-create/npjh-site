# Saved enquiry records

The homepage enquiry studio and `/enquiry-studio/` save an enquiry only after the customer reviews it, checks the consent box and selects **Save enquiry & prepare WhatsApp**. Name and mobile are required; email is optional. WhatsApp remains a separate, deliberate action.

## Owner access

Sign in to the existing Netlify account and select the `lovely-duckanoo-1ed5e7` project. Go to **Data & Storage → Blobs → customer-enquiries**. Each UUID-named `.json` blob is one enquiry; download it to see the customer's details, preferences, timestamp and consent record. The store persists across deployments. Access is restricted to the existing project team. There is no public list/read endpoint or customer data in this repository.

Treat downloaded records as customer information. Remove records through the Netlify dashboard when no longer needed, or when handling a customer's deletion request. The visible form directs correction/deletion requests to the business telephone number.

## Implementation

`POST /.netlify/functions/save-enquiry` invokes the save function directly. It validates contacts and allowed selections on the server, requires the current explicit consent version, checks request origin, limits body size, rejects the honeypot and applies a platform rate limit. A client UUID and conditional write deduplicate retries without overwriting records. The function confirms a strongly consistent read before showing success and returns only a reference and timestamp. Storage errors do not report a successful save; customers can retry or open their WhatsApp draft directly.

Records contain contact details, chosen jewellery options, optional budget/date/link/notes, server timestamp, consent purpose/version and a fingerprint for retry matching. IP addresses and user-agent strings are not added to saved enquiry records. Hosting infrastructure may retain its normal request logs.

Run `node --test tests/enquiry-handler.test.mjs` and `npm run build` to validate changes. Do not add tokens or customer records to source control.
