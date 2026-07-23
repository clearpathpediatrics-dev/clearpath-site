#!/usr/bin/env node
/**
 * ClearPath Pediatrics — build SEO landing pages
 * -------------------------------------------------------------
 * Renders every page in landing-pages.data.mjs to /<slug>/index.html and
 * rebuilds sitemap.xml (home + legal + blog + landing pages + posts).
 * No API key needed — content is hand-authored in the data file.
 *
 * Run: node scripts/build-landing-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANDING_PAGES } from "./landing-pages.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://clearpathpediatrics.com";
const CAL = "https://calendly.com/clearpathpediatrics/30min";

const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const CSS = `
:root{--navy:#0b2240;--navy2:#16335f;--gold:#e3a458;--gold2:#d6913e;--cream:#faf7f2;--paper:#fff;--ink:#1d2b3a;--soft:#4a5a6b;--line:#e7ded2;--green:#3f9d6d;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--cream);line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:var(--gold2);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1000px;margin:0 auto;padding:0 24px}
.lp-header{background:var(--navy);padding:12px 0;position:sticky;top:0;z-index:10}
.lp-header .wrap{max-width:1180px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.lp-brand img{height:54px;width:auto;display:block}
.lp-nav{display:flex;gap:20px;align-items:center}
.lp-nav a{color:rgba(255,255,255,.82);font-size:.9rem;font-weight:500}
.lp-nav a:hover{color:#fff;text-decoration:none}
.lp-nav .cta{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;padding:9px 18px;border-radius:999px}
.eyebrow{font-weight:700;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
.hero{background:radial-gradient(900px 420px at 82% -10%,rgba(227,164,88,.15),transparent 60%),linear-gradient(160deg,var(--navy),var(--navy2));color:#fff;padding:66px 0 58px}
.hero .eyebrow{display:inline-block;margin-bottom:12px}
.hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.1rem,4.6vw,3.1rem);line-height:1.12;margin-bottom:16px;max-width:820px}
.hero p{color:rgba(255,255,255,.85);font-size:1.08rem;max-width:680px;margin-bottom:14px}
.btn{display:inline-flex;align-items:center;gap:.5em;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;font-weight:600;padding:15px 30px;border-radius:999px;margin-top:14px;box-shadow:0 12px 30px rgba(214,145,62,.4)}
.btn:hover{text-decoration:none;transform:translateY(-2px)}
.sec{padding:52px 0}
.sec h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.6rem,3vw,2.1rem);color:var(--navy2);margin-bottom:20px}
.who{list-style:none;display:grid;gap:12px;max-width:760px}
.who li{display:flex;gap:12px;align-items:flex-start;color:var(--ink);font-size:1.03rem}
.who li::before{content:"✓";flex:none;width:26px;height:26px;border-radius:50%;background:rgba(63,157,109,.14);color:var(--green);font-weight:800;font-size:.85rem;display:grid;place-items:center;margin-top:2px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
.card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:28px 26px;box-shadow:0 4px 16px rgba(11,34,64,.06)}
.card .ico{font-size:1.6rem;margin-bottom:12px}
.card h3{font-family:'Playfair Display',Georgia,serif;font-size:1.22rem;color:var(--navy2);margin-bottom:8px}
.card p{color:var(--soft);font-size:.98rem}
.faq{max-width:820px}
.faq .qa{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:20px 24px;margin-bottom:14px}
.faq h3{font-family:'Playfair Display',Georgia,serif;font-size:1.1rem;color:var(--navy2);margin-bottom:6px}
.faq p{color:var(--soft)}
.disclaimer{background:rgba(214,145,62,.1);border:1px solid rgba(214,145,62,.32);border-radius:14px;padding:16px 20px;font-size:.92rem;color:var(--ink);margin:8px 0}
.disclaimer strong{color:var(--gold2)}
.cta-band{background:linear-gradient(160deg,var(--navy2),var(--navy));color:#fff;border-radius:22px;padding:44px 34px;text-align:center;margin:10px auto 0}
.cta-band h2{color:#fff;margin-bottom:10px}
.cta-band p{color:rgba(255,255,255,.82);max-width:560px;margin:0 auto 6px}
.bg-cream{background:var(--cream)}.bg-paper{background:var(--paper)}
.lp-footer{background:var(--navy);color:rgba(255,255,255,.6);padding:34px 0;margin-top:10px;font-size:.85rem}
.lp-footer .wrap{max-width:1180px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;align-items:center}
.lp-footer a{color:rgba(255,255,255,.7)}.lp-footer a:hover{color:var(--gold)}
.lp-footer nav{display:flex;gap:18px;flex-wrap:wrap}
@media(max-width:720px){.grid{grid-template-columns:1fr}.lp-footer .wrap{flex-direction:column;text-align:center}.lp-nav{gap:14px}}
`;

const HEADER = `
<header class="lp-header"><div class="wrap">
  <a href="/" class="lp-brand" aria-label="ClearPath Pediatrics home"><img src="/assets/clearpath-logo-white.png" alt="ClearPath Pediatrics" /></a>
  <nav class="lp-nav"><a href="/">Home</a><a href="/blog/">Blog</a><a href="/#services">Services</a>
    <a href="${CAL}" target="_blank" rel="noopener" class="cta">Book a Free Call</a></nav>
</div></header>`;

const FOOTER = `
<footer class="lp-footer"><div class="wrap">
  <span>Copyright © 2025 ClearPath Pediatrics, LLC. — All Rights Reserved.</span>
  <nav><a href="/">Home</a><a href="/blog/">Blog</a><a href="/privacy-policy">Privacy</a><a href="/terms-of-use">Terms</a><a href="/#contact">Contact</a></nav>
</div></footer>`;

function renderPage(p) {
  const url = `${SITE}/${p.slug}`;
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: p.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const serviceLd = {
    "@context": "https://schema.org", "@type": "MedicalWebPage",
    name: p.h1, description: p.metaDescription, url,
    about: { "@type": "Organization", name: "ClearPath Pediatrics" },
    publisher: { "@type": "Organization", name: "ClearPath Pediatrics", logo: { "@type": "ImageObject", url: `${SITE}/assets/clearpath-logo.png` } },
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.metaDescription)}" />
<meta name="keywords" content="${esc((p.keywords || []).join(", "))}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/png" href="/assets/clearpath-logo.png" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(p.metaDescription)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/assets/clearpath-logo.png" />
<meta name="geo.region" content="US-AZ" /><meta name="geo.placename" content="Phoenix, Arizona" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify(serviceLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<style>${CSS}</style>
</head>
<body>
${HEADER}
<section class="hero"><div class="wrap">
  <span class="eyebrow">${esc(p.eyebrow)}</span>
  <h1>${esc(p.h1)}</h1>
  ${p.intro.map(t => `<p>${esc(t)}</p>`).join("\n  ")}
  <a href="${CAL}" target="_blank" rel="noopener" class="btn">Book a Free 30-Minute Call →</a>
</div></section>

<section class="sec bg-cream"><div class="wrap">
  <h2>Is this you?</h2>
  <ul class="who">${p.who.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
</div></section>

<section class="sec bg-paper"><div class="wrap">
  <h2>How ClearPath helps</h2>
  <div class="grid">${p.help.map(h => `
    <div class="card"><div class="ico">${h.icon}</div><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>`).join("")}
  </div>
</div></section>

<section class="sec bg-cream"><div class="wrap faq">
  <h2>Common questions</h2>
  ${p.faq.map(f => `<div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("\n  ")}
  <div class="disclaimer"><strong>Important:</strong> ClearPath Pediatrics does not provide medical care, diagnosis, treatment, or emergency services. All medical decisions remain with your child's licensed healthcare providers. In an emergency, call 911.</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="cta-band">
    <span class="eyebrow" style="color:var(--gold)">Take the first step</span>
    <h2>You don't have to navigate this alone.</h2>
    <p>Book a free 30-minute call with a ClearPath RN and see if we're the right fit for your family. No sales pitch, no commitment.</p>
    <a href="${CAL}" target="_blank" rel="noopener" class="btn">Book My Free Call →</a>
  </div>
</div></section>
${FOOTER}
<script src="/assets/analytics.js" defer></script>
<script src="/assets/email-popup.js" defer></script>
</body>
</html>`;
}

function readPosts() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "blog", "posts.json"), "utf8")); }
  catch { return []; }
}

function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function buildSitemap(posts) {
  const today = todayISO();
  const urls = [
    { loc: `${SITE}/`, pri: "1.0", freq: "weekly", mod: today },
    { loc: `${SITE}/blog`, pri: "0.8", freq: "daily", mod: today },
    ...LANDING_PAGES.map(p => ({ loc: `${SITE}/${p.slug}`, pri: "0.8", freq: "monthly", mod: today })),
    { loc: `${SITE}/privacy-policy`, pri: "0.3", freq: "yearly", mod: today },
    { loc: `${SITE}/terms-of-use`, pri: "0.3", freq: "yearly", mod: today },
    ...posts.map(p => ({ loc: `${SITE}/blog/${p.slug}`, pri: "0.6", freq: "monthly", mod: p.iso })),
  ];
  const rows = urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.mod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

// ---- run ----
let count = 0;
for (const p of LANDING_PAGES) {
  const dir = path.join(ROOT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPage(p));
  count++;
  console.log(`  ✓ /${p.slug}`);
}
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap(readPosts()));
console.log(`[landing] built ${count} pages + sitemap.`);
