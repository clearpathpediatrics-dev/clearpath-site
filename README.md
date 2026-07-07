# ClearPath Pediatrics — Website (v1.0.0)

One-page marketing site for **ClearPath Pediatrics, LLC** — RN-led pediatric care
navigation for families of medically complex children.

Static site, no build step. Just HTML/CSS/JS + image assets.

## Contents
```
index.html              Main one-page site
privacy-policy/         Standalone /privacy-policy page
terms-of-use/           Standalone /terms-of-use page
assets/                 Logos + App Store badge
robots.txt              Crawler rules (welcomes AI bots) + sitemap ref
sitemap.xml             Sitemap (home + legal pages)
llms.txt                AI / answer-engine summary (GEO)
_redirects              Netlify/Cloudflare 301s from old GoDaddy URLs
.htaccess               Apache/GoDaddy-cPanel equivalent of the redirects
netlify.toml            Netlify config (headers + caching)
package.json            Package label / local serve script
```

## Run locally
```
npm start          # serves at http://localhost:8910
# or:  python3 -m http.server 8910
```

## Deploy (Netlify — recommended)
1. Go to app.netlify.com → "Add new site" → "Deploy manually".
2. Drag this folder (or the provided .zip) onto the drop zone.
3. Test the temporary *.netlify.app URL.
4. Domain management → add `clearpathpediatrics.com` → "Set up external DNS".
5. At GoDaddy DNS: A record `@` → `75.2.60.5`, CNAME `www` → your-site.netlify.app.
6. Set primary domain + enable Force HTTPS (auto SSL).

The `_redirects` file 301-redirects the old multi-page URLs (/about, /faqs, etc.)
to the matching sections, preserving SEO. Privacy & Terms are real pages.

## Integrations
- Booking: Calendly (calendly.com/clearpathpediatrics/30min)
- Email capture: Klaviyo client-side API → Welcome List (Website)
- iOS app: App Store id6762391088

## Update notes
The legal content lives in THREE places kept in sync: the homepage modal
templates (`#tpl-privacy` / `#tpl-terms` in index.html) and the two standalone
pages. If legal text changes, update all three + the "Last Updated" date.
