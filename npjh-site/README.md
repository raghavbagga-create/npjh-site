# Nu Punjab Jewellery House

The live website is deployed from the `main` branch to the existing Netlify project.

## Edit and build

From `npjh-site`, run `npm ci` and `npm run build`. The build creates a prerendered page, a hydrated React bundle, CSS and the approved image assets in `dist`. Netlify publishes `dist` and separately deploys `netlify/functions`.

- `source/app/page.tsx`: website content and interactions
- `source/app/globals.css`: responsive styling
- `source/components/gold-rate-ticker.tsx`: rate display
- `source/lib/enquiry.ts`: validation and message preparation
- `source/head.html`: domain metadata, existing analytics and structured business information
- `source/functions/site-gold-rates.ts`: normalized rates for the ticker
- `netlify/functions/gold-rate.js`: preserved original gold-rate service

The existing gold-rate endpoint remains available. `/api/gold-rates` is rewritten to the normalized Netlify function. Enquiries prepare messages for customers to review and send themselves in WhatsApp; appointments require confirmation by the showroom.
