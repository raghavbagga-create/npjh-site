# Nu Punjab Jewellery House — standalone site

This is a fully independent copy of your website — plain HTML/CSS/JS, no ChatGPT or third-party platform involved. You (or I, once you connect a folder) can edit these files directly forever.

## What's in here

- `index.html` — the whole site
- `style.css` — all styling
- `favicon.svg` — browser tab icon (simple NP monogram)
- `images/` — product photos (currently placeholders — see below)

## 1. Replace the placeholder images

The four files in `images/` are temporary placeholders. Replace them with your real photos, keeping the exact same filenames:

- `images/hero-necklace.jpeg`
- `images/gold-choker.jpeg`
- `images/diamond-earring.png`
- `images/gold-jewellery.png`

Easiest way: open your current site, right-click each product photo → "Save image as," rename to match the filenames above, and drop them into this `images` folder.

## 2. Deploy it (no coding required)

**Simplest option — Netlify Drop:**

1. Go to https://app.netlify.com/drop
2. Drag the whole `npjh-site` folder onto the page
3. It publishes instantly with a temporary netlify.app URL
4. Create a free Netlify account to keep it live permanently and attach your domain (Site settings → Domain management → Add custom domain)

**Alternative — GitHub Pages / Vercel:** works the same way if you'd rather use those; just upload this folder as a new repo/project.

## 3. Point your domain at it

Once deployed, go to GoDaddy → your domain → DNS management, and update the DNS records to point to your new host (Netlify/Vercel will show you the exact records to add — usually a CNAME or A record). This replaces the current `custom-domains.chatgpt.site` record.

Until you update DNS, the current ChatGPT-hosted site keeps working as normal — there's no rush and no risk of downtime while you set this up.

## Editing going forward

Once this is deployed and you've connected a folder to me here, I can edit `index.html` / `style.css` directly and you just re-upload (or, on Netlify, changes can auto-deploy from a connected GitHub repo).
