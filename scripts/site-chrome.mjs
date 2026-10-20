/**
 * ClearPath Pediatrics — chrome shared by every generated page.
 * -------------------------------------------------------------
 * Four generators and a dozen hand-written pages each carried their own copy of
 * the header, the script tags and the logo. They drifted: articles lost the
 * Roadmap card, landing pages kept it only because someone hand-edited the HTML,
 * and the article header had no mobile menu at all. One copy now.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");

export const SITE = "https://clearpathpediatrics.com";
export const CAL = "https://calendly.com/clearpathpediatrics/30min";
// Every "book a call" button lands here first: what to expect, then the
// calendar. Calendly itself is only linked from this page.
export const BOOK = "/book/";

// 11 KB at 107x132, shown at 54-66px tall. The PNG it replaces was 502 KB.
export const LOGO_WHITE = `<img src="/assets/logo-white-132.webp" width="107" height="132" alt="ClearPath Pediatrics" />`;

export const HEAD_ICONS = `<link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon-64.png" />
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />`;

/* ------------------------------------------------------------------ header */
export const HEADER_CSS = `
.lp-header{background:var(--navy,#0b2240);padding:10px 0;position:sticky;top:0;z-index:50}
.lp-header .wrap{max-width:1180px;display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.lp-brand{display:block;margin-right:auto}
.lp-brand img{height:54px;width:auto;display:block}
.lp-nav{display:flex;gap:22px;align-items:center}
.lp-nav a{color:rgba(255,255,255,.84);font-size:.92rem;font-weight:500;white-space:nowrap;text-decoration:none}
.lp-nav a:hover{color:#fff;text-decoration:none}
.lp-cta{background:linear-gradient(135deg,#e3a458,#d6913e);color:#0b2240!important;font-weight:700;font-size:.9rem;
  padding:10px 20px;border-radius:999px;white-space:nowrap;text-decoration:none!important}
.lp-cta:hover{filter:brightness(1.05)}
.lp-nav-t{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
.lp-burger{display:none;cursor:pointer;width:42px;height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.22);
  align-items:center;justify-content:center;flex-direction:column;gap:5px}
.lp-burger span{display:block;width:18px;height:2px;background:#fff;border-radius:2px;transition:transform .2s,opacity .2s}
.lp-nav-t:focus-visible ~ .lp-burger{outline:2px solid #e3a458;outline-offset:2px}
@media (max-width:860px){
  .lp-header .wrap{gap:10px}
  .lp-brand img{height:46px}
  .lp-burger{display:flex}
  .lp-cta{padding:9px 15px;font-size:.84rem}
  .lp-nav{display:none;order:9;width:100%;flex-direction:column;align-items:stretch;gap:0;padding:6px 0 4px}
  .lp-nav a{padding:13px 4px;font-size:1rem;border-top:1px solid rgba(255,255,255,.1)}
  .lp-nav-t:checked ~ .lp-nav{display:flex}
  .lp-nav-t:checked ~ .lp-burger span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .lp-nav-t:checked ~ .lp-burger span:nth-child(2){opacity:0}
  .lp-nav-t:checked ~ .lp-burger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
}
@media (max-width:360px){.lp-cta{padding:8px 12px;font-size:.8rem}}
`;

// The checkbox drives the mobile menu with no JavaScript, so it works even if
// a script fails. It stays focusable, so keyboard users can toggle it.
export const HEADER = `
<header class="lp-header"><div class="wrap">
  <a href="/" class="lp-brand" aria-label="ClearPath Pediatrics home">${LOGO_WHITE}</a>
  <input type="checkbox" id="lp-nav-t" class="lp-nav-t" aria-label="Open menu" />
  <nav class="lp-nav" aria-label="Main">
    <a href="/blog/">Articles</a>
    <a href="/pediatric-care-navigation-guide/">Guide</a>
    <a href="/tools/">Free Tools</a>
    <a href="/free-care-roadmap/">Free Care Plan</a>
    <a href="/#services">Services</a>
  </nav>
  <a class="lp-cta" href="${BOOK}" data-cta="header">Book a free call</a>
  <label for="lp-nav-t" class="lp-burger" aria-hidden="true"><span></span><span></span><span></span></label>
</div></header>`;

/* --------------------------------------------------------- scripts + card */
// capture.js replaced email-popup.js (a 2-second email wall with no close
// button) and roadmap-cta.js. Both old files now just load it.
export const SCRIPTS = `<script src="/assets/analytics.js" defer></script>
<script src="/assets/capture.js" defer></script>`;

export const ROADMAP_CSS = `
.cpp-inline{background:#0b2240;border-radius:20px;padding:28px 26px;margin:34px 0;color:#fff}
.cpp-inline .k{font-size:.74rem;letter-spacing:.09em;text-transform:uppercase;color:#e3a458;font-weight:700;margin-bottom:9px}
.cpp-inline h3{font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;line-height:1.25;margin:0 0 10px;color:#fff}
.cpp-inline p{font-size:.98rem;color:#c9d6e6!important;margin:0 0 18px;line-height:1.6}
.cpp-inline a{display:inline-block;background:#e3a458;color:#0b2240;font-weight:700;font-size:.97rem;
  padding:13px 26px;border-radius:999px;text-decoration:none}
.cpp-inline a:hover{text-decoration:none;filter:brightness(1.05)}
.cpp-inline .fine{display:block;margin-top:12px;font-size:.8rem;color:#8fa3bd}
`;

const escA = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * The Free Care Roadmap offer, matched to a hub. Rendered into the page rather
 * than injected by script, so search engines see it and nothing shifts while
 * the reader is mid-paragraph. `data-inj` lets a re-render strip and replace it.
 */
export function roadmapCard(hub, placement = "inline") {
  const c = hub && hub.card ? hub.card : {
    k: "Free · built from your answers",
    h: "Get a care plan built for your child",
    p: "Answer six quick questions and we email you a personalized plan: the first thing to do, the next three steps, and what to watch for.",
  };
  const href = `/free-care-roadmap/${hub && hub.need ? `?need=${hub.need}` : ""}`;
  return `
    <aside class="cpp-inline" data-inj="roadmap">
      <div class="k">${escA(c.k)}</div>
      <h3>${escA(c.h)}</h3>
      <p>${escA(c.p)}</p>
      <a href="${escA(href)}" data-cta="roadmap-${placement}">Get my free plan →</a>
      <span class="fine">Takes about two minutes. Yours to keep, no call required.</span>
    </aside>`;
}

/* ------------------------------------------------------------ link hygiene */
/**
 * Netlify serves every directory page at its trailing-slash URL and 301s the
 * bare form to it. The site linked, canonicalised and sitemapped the bare form
 * everywhere, so 241 of 242 sitemap URLs redirected and every canonical pointed
 * at a URL that redirected back to the page declaring it.
 *
 * This rewrites internal links, canonicals, og:url and JSON-LD urls to the form
 * the server actually answers with 200. Only paths that are real directories
 * are touched, so redirect-only paths in _redirects (/about, /faq ...) and files
 * (/llms.txt, /assets/...) are left exactly as they are.
 */
const known = new Set();
function isDir(p) {
  if (p.startsWith("/blog/")) return true;
  if (known.has(p)) return true;
  const ok = fs.existsSync(path.join(ROOT, p, "index.html"));
  if (ok) known.add(p);
  return ok;
}
const fix = (pre, host, p, frag) =>
  (p === "/" || p.endsWith("/") || p.startsWith("/assets/") || p.startsWith("/.netlify") || !isDir(p))
    ? null : `${pre}${host || ""}${p}/${frag || ""}"`;

export function normalizeLinks(html) {
  return html
    .replace(/((?:href|content)=")(https:\/\/clearpathpediatrics\.com)?(\/[a-z0-9\/-]*?)(#[^"]*)?"/gi,
      (m, pre, host, p, frag) => fix(pre, host, p, frag) || m)
    .replace(/("(?:url|@id|item|mainEntityOfPage)"\s*:\s*")(https:\/\/clearpathpediatrics\.com)(\/[a-z0-9\/-]*?)(#[^"]*)?"/g,
      (m, pre, host, p, frag) => fix(pre, host, p, frag) || m);
}

/** Write an HTML page with links normalized. Registers its own directory first. */
export function writePage(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const rel = "/" + path.relative(ROOT, path.dirname(file)).split(path.sep).join("/");
  if (rel !== "/") known.add(rel);
  fs.writeFileSync(file, normalizeLinks(html));
}
