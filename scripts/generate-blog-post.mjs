#!/usr/bin/env node
/**
 * ClearPath Pediatrics — daily blog generator
 * -------------------------------------------------------------
 * Writes ONE new blog post using Claude (claude-opus-4-8), renders it as a
 * standalone brand-styled page, updates the blog index + sitemap, and leaves
 * the changes on disk for the GitHub Action to commit.
 *
 * Guardrails (baked into the system prompt): education/navigation only, never
 * medical advice/diagnosis/treatment, a "not medical advice" disclaimer on
 * every post, brand voice, and SEO/GEO structure per Dean's blog spec.
 *
 * Env: ANTHROPIC_API_KEY (required, set as a GitHub secret).
 * Run: node scripts/generate-blog-post.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const POSTS_JSON = path.join(BLOG_DIR, "posts.json");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const SITE = "https://clearpathpediatrics.com";
const MODEL = process.env.CLEARPATH_BLOG_MODEL || "claude-opus-4-8";

// ---- Topic rotation (America/Phoenix weekday) --------------------------------
const TOPIC_BY_DAY = {
  Monday: "Care Navigation Tips",
  Tuesday: "Special Needs & Complex Care",
  Wednesday: "Insurance & Billing Guidance",
  Thursday: "Milestone & Wellness Topics",
  Friday: "Care Navigation Tips",
  Saturday: "Special Needs & Complex Care",
  Sunday: "Insurance & Billing Guidance",
};

function phoenixParts() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()); // YYYY-MM-DD
  return { weekday: parts.weekday, prettyDate: `${parts.month} ${parts.day}, ${parts.year}`, iso };
}

// ---- Helpers -----------------------------------------------------------------
const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const slugify = (s) => s.toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 70).replace(/^-|-$/g, "");

function readPosts() {
  try { return JSON.parse(fs.readFileSync(POSTS_JSON, "utf8")); }
  catch { return []; }
}

// Trusted-but-tidy: our own generation, but strip anything script-like just in case.
function sanitizeBodyHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}

// ---- Shared brand CSS (matches the standalone legal pages) --------------------
const BRAND_CSS = `
:root{--navy:#0b2240;--navy2:#16335f;--gold:#e3a458;--gold2:#d6913e;--cream:#faf7f2;--paper:#fff;--ink:#1d2b3a;--soft:#4a5a6b;--line:#e7ded2;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--cream);line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:var(--gold2);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:820px;margin:0 auto;padding:0 24px}
.lp-header{background:var(--navy);padding:12px 0;position:sticky;top:0;z-index:10}
.lp-header .wrap{max-width:1180px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.lp-brand img{height:54px;width:auto;display:block}
.lp-nav{display:flex;gap:20px;align-items:center}
.lp-nav a{color:rgba(255,255,255,.82);font-size:.9rem;font-weight:500}
.lp-nav a:hover{color:#fff;text-decoration:none}
.lp-nav .cta{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;padding:9px 18px;border-radius:999px}
.eyebrow{font-weight:700;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold2)}
.lp-footer{background:var(--navy);color:rgba(255,255,255,.6);padding:34px 0;margin-top:56px;font-size:.85rem}
.lp-footer .wrap{max-width:1180px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;align-items:center}
.lp-footer a{color:rgba(255,255,255,.7)}.lp-footer a:hover{color:var(--gold)}
.lp-footer nav{display:flex;gap:18px;flex-wrap:wrap}
@media(max-width:640px){.lp-footer .wrap{flex-direction:column;text-align:center}.lp-nav{gap:14px}}
`;

const HEADER_HTML = `
<header class="lp-header">
  <div class="wrap">
    <a href="/" class="lp-brand" aria-label="ClearPath Pediatrics home"><img src="/assets/clearpath-logo-white.png" alt="ClearPath Pediatrics" /></a>
    <nav class="lp-nav">
      <a href="/">Home</a>
      <a href="/blog/">Blog</a>
      <a href="/#services">Services</a>
      <a href="https://calendly.com/clearpathpediatrics/30min" target="_blank" rel="noopener" class="cta">Book a Free Call</a>
    </nav>
  </div>
</header>`;

const FOOTER_HTML = `
<footer class="lp-footer">
  <div class="wrap">
    <span>Copyright © 2025 ClearPath Pediatrics, LLC. — All Rights Reserved.</span>
    <nav>
      <a href="/">Home</a><a href="/blog/">Blog</a>
      <a href="/privacy-policy">Privacy</a><a href="/terms-of-use">Terms</a>
      <a href="/#contact">Contact</a>
    </nav>
  </div>
</footer>`;

const DISCLAIMER_HTML = `
<div class="disclaimer">
  <strong>A note from ClearPath:</strong> This article is educational and organizational in nature. ClearPath Pediatrics does not provide medical advice, diagnosis, or treatment — always consult your child's licensed healthcare providers for medical decisions. If your child is experiencing a medical emergency, call 911.
</div>`;

// ---- Page renderers -----------------------------------------------------------
function renderPost(post) {
  const url = `${SITE}/blog/${post.slug}`;
  const faqLd = post.faq && post.faq.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: post.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;
  const articleLd = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: post.title, description: post.metaDescription,
    datePublished: post.iso, dateModified: post.iso,
    author: { "@type": "Organization", name: "ClearPath Pediatrics" },
    publisher: { "@type": "Organization", name: "ClearPath Pediatrics", logo: { "@type": "ImageObject", url: `${SITE}/assets/clearpath-logo.png` } },
    mainEntityOfPage: url, image: `${SITE}/assets/clearpath-logo.png`, keywords: (post.tags || []).join(", "),
    articleSection: post.topic,
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(post.title)} | ClearPath Pediatrics</title>
<meta name="description" content="${esc(post.metaDescription)}" />
<meta name="keywords" content="${esc((post.tags || []).join(", "))}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/png" href="/assets/clearpath-logo.png" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(post.title)}" />
<meta property="og:description" content="${esc(post.metaDescription)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/assets/clearpath-logo.png" />
<meta property="article:published_time" content="${post.iso}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify(articleLd)}</script>
${faqLd ? `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>` : ""}
<style>${BRAND_CSS}
.article{padding:52px 0 20px}
.article .eyebrow{display:inline-block;margin-bottom:12px}
.article h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2rem,4.4vw,2.9rem);color:var(--navy2);line-height:1.12;margin-bottom:14px}
.meta{color:var(--soft);font-size:.85rem;margin-bottom:8px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 30px}
.tags span{font-size:.72rem;font-weight:600;color:var(--gold2);background:rgba(227,164,88,.12);border:1px solid rgba(227,164,88,.28);padding:5px 12px;border-radius:999px}
.body h2{font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;color:var(--navy2);margin:34px 0 10px}
.body h3{font-family:'Playfair Display',Georgia,serif;font-size:1.2rem;color:var(--navy2);margin:24px 0 8px}
.body p{color:var(--soft);margin-bottom:16px;font-size:1.04rem}
.body ul,.body ol{margin:0 0 18px 22px;color:var(--soft)}.body li{margin-bottom:8px}
.body strong{color:var(--ink)}
.disclaimer{background:rgba(214,145,62,.1);border:1px solid rgba(214,145,62,.32);border-radius:14px;padding:16px 20px;font-size:.92rem;color:var(--ink);margin:34px 0}
.disclaimer strong{color:var(--gold2)}
.cta-band{background:linear-gradient(160deg,var(--navy2),var(--navy));color:#fff;border-radius:20px;padding:34px 32px;text-align:center;margin-top:36px}
.cta-band h3{font-family:'Playfair Display',Georgia,serif;color:#fff;font-size:1.5rem;margin-bottom:8px}
.cta-band p{color:rgba(255,255,255,.8);margin-bottom:18px}
.cta-band a{display:inline-block;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;font-weight:600;padding:14px 28px;border-radius:999px}
.cta-band a:hover{text-decoration:none}
.backlink{display:inline-block;margin-top:8px;color:var(--gold2);font-weight:600}
</style>
</head>
<body>
${HEADER_HTML}
<main class="article">
  <div class="wrap">
    <span class="eyebrow">${esc(post.topic)}</span>
    <h1>${esc(post.title)}</h1>
    <p class="meta">${esc(post.prettyDate)}${post.readMinutes ? ` · ${post.readMinutes} min read` : ""} · ClearPath Pediatrics</p>
    <div class="tags">${(post.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
    <div class="body">
${post.html}
    </div>
    ${DISCLAIMER_HTML}
    <div class="cta-band">
      <h3>Feeling overwhelmed between visits?</h3>
      <p>ClearPath's RN care navigators help families of medically complex children stay organized and confident. Start with a free 30-minute call.</p>
      <a href="https://calendly.com/clearpathpediatrics/30min" target="_blank" rel="noopener">Book a Free Consultation →</a>
    </div>
    <a href="/blog/" class="backlink">← Back to all articles</a>
  </div>
</main>
${FOOTER_HTML}
</body>
</html>`;
}

function renderIndex(posts) {
  const cards = posts.map(p => `
      <a class="card" href="/blog/${p.slug}">
        <span class="ctag">${esc(p.topic)}</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.excerpt || p.metaDescription || "")}</p>
        <span class="meta">${esc(p.prettyDate)}${p.readMinutes ? ` · ${p.readMinutes} min read` : ""}</span>
      </a>`).join("\n");

  const blogLd = {
    "@context": "https://schema.org", "@type": "Blog",
    name: "ClearPath Pediatrics Blog", url: `${SITE}/blog`,
    publisher: { "@type": "Organization", name: "ClearPath Pediatrics" },
    blogPost: posts.slice(0, 20).map(p => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}`, datePublished: p.iso })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pediatric Care Navigation Blog | ClearPath Pediatrics</title>
<meta name="description" content="RN-written guidance for families of medically complex children — care navigation tips, complex-care support, insurance help, and milestone guidance from ClearPath Pediatrics." />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${SITE}/blog" />
<link rel="icon" type="image/png" href="/assets/clearpath-logo.png" />
<meta property="og:title" content="Pediatric Care Navigation Blog | ClearPath Pediatrics" />
<meta property="og:description" content="RN-written guidance for families of medically complex children." />
<meta property="og:url" content="${SITE}/blog" />
<meta property="og:image" content="${SITE}/assets/clearpath-logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify(blogLd)}</script>
<style>${BRAND_CSS}
.hero{background:radial-gradient(900px 400px at 80% -10%,rgba(227,164,88,.14),transparent 60%),linear-gradient(160deg,var(--navy),var(--navy2));color:#fff;padding:60px 0 54px;text-align:center}
.hero .eyebrow{color:var(--gold);display:inline-block;margin-bottom:12px}
.hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.1rem,5vw,3.1rem);margin-bottom:12px}
.hero p{color:rgba(255,255,255,.82);max-width:600px;margin:0 auto;font-size:1.05rem}
.list{padding:48px 0}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;max-width:1000px;margin:0 auto}
.card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:26px 26px;display:block;transition:transform .25s,box-shadow .25s,border-color .25s;box-shadow:0 4px 16px rgba(11,34,64,.06)}
.card:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(11,34,64,.13);border-color:var(--gold);text-decoration:none}
.card .ctag{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold2)}
.card h2{font-family:'Playfair Display',Georgia,serif;font-size:1.3rem;color:var(--navy2);margin:8px 0 8px;line-height:1.2}
.card p{color:var(--soft);font-size:.96rem;margin-bottom:14px}
.card .meta{color:var(--soft);font-size:.8rem;opacity:.8}
.empty{text-align:center;color:var(--soft);max-width:520px;margin:0 auto;padding:20px}
.wrap-wide{max-width:1000px;margin:0 auto;padding:0 24px}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
${HEADER_HTML}
<section class="hero">
  <div class="wrap">
    <span class="eyebrow">The ClearPath Blog</span>
    <h1>Clarity for families, one article at a time.</h1>
    <p>RN-written guidance on navigating complex pediatric care — organizing appointments, understanding insurance, preparing for visits, and supporting your child's journey.</p>
  </div>
</section>
<main class="list">
  <div class="wrap-wide">
    ${posts.length ? `<div class="grid">${cards}\n    </div>` : `<p class="empty">New articles are on the way — check back soon, or <a href="https://calendly.com/clearpathpediatrics/30min" target="_blank" rel="noopener">book a free call</a> in the meantime.</p>`}
  </div>
</main>
${FOOTER_HTML}
</body>
</html>`;
}

function renderSitemap(posts) {
  const today = phoenixParts().iso;
  const staticUrls = [
    { loc: `${SITE}/`, pri: "1.0", freq: "weekly", mod: today },
    { loc: `${SITE}/blog`, pri: "0.8", freq: "daily", mod: today },
    { loc: `${SITE}/privacy-policy`, pri: "0.3", freq: "yearly", mod: today },
    { loc: `${SITE}/terms-of-use`, pri: "0.3", freq: "yearly", mod: today },
  ];
  const postUrls = posts.map(p => ({ loc: `${SITE}/blog/${p.slug}`, pri: "0.6", freq: "monthly", mod: p.iso }));
  const rows = [...staticUrls, ...postUrls].map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.mod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

// ---- Prompt -------------------------------------------------------------------
function buildSystemPrompt(topic, recentTitles) {
  return `You are the content writer for ClearPath Pediatrics — a private, fee-for-service pediatric care NAVIGATION and education company in Phoenix, Arizona. RN care navigators help parents navigate specialists, referrals, insurance, and complex pediatric health. Website: clearpathpediatrics.com. Contact: admin@clearpathpediatrics.com, (949) 416-5447.

CRITICAL BOUNDARIES (never violate):
- ClearPath does NOT provide medical advice, diagnosis, treatment, or emergency services. Never give any.
- Do not tell readers what condition they have, what medication/dose to use, or what a symptom means clinically.
- Frame everything as ORGANIZATION, EDUCATION, PREPARATION, and NAVIGATION — helping parents understand and organize what their licensed providers have already told them.
- Always defer clinical decisions to the family's licensed healthcare providers.

VOICE: warm, clear, reassuring — written for stressed parents. Never cold or clinical. Second person ("you"). No fearmongering.

TODAY'S TOPIC CATEGORY: "${topic}". Choose a specific, useful, SEO-searchable angle within it.

AVOID repeating these recent titles/angles: ${recentTitles.length ? recentTitles.map(t => `"${t}"`).join(", ") : "(none yet)"}.

REQUIREMENTS:
- 650–900 words in the body.
- Title: SEO-optimized, specific, includes "pediatric" + a topic keyword naturally.
- Meta description: 150–160 characters, includes the primary keyword, ends with a benefit/hook.
- At least 3 H2 subheadings, roughly every 150–200 words.
- Include 1–2 sections written as a direct question-and-answer so AI search engines can surface them as answers (GEO).
- Mention "ClearPath Pediatrics" naturally 1–2 times.
- End with a soft, non-pushy call to action.
- 4–5 SEO keyword tags.
- No medical advice, diagnoses, or treatment recommendations anywhere.

OUTPUT: Return ONLY a single JSON object (no markdown code fences, no commentary) with EXACTLY these keys:
{
  "title": string,
  "metaDescription": string,          // 150-160 chars
  "slug": string,                     // short, kebab-case, derived from the title
  "excerpt": string,                  // 1-2 sentence teaser for the blog index card
  "readMinutes": number,              // estimated read time, integer
  "tags": string[],                   // 4-5 SEO keyword tags
  "html": string,                     // the BODY only, using ONLY these tags: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>. No <h1>, no <script>, no inline styles, no images. Include the GEO Q&A sections using <h2> for the question and <p> for the answer. Do NOT include the title, the tags, or a disclaimer (those are added automatically).
  "faq": [ { "q": string, "a": string } ]   // 1-3 entries mirroring the GEO Q&A in the body, for structured data
}`;
}

// A canned post used by dry-run mode (CLEARPATH_BLOG_DRYRUN=1) so you can
// preview the styling/pipeline without spending any API credits.
const SAMPLE_POST = {
  title: "How to Organize Your Child's Pediatric Specialist Appointments (Without Losing Your Mind)",
  metaDescription: "A calm, practical guide to organizing pediatric specialist appointments for medically complex kids — track visits, prep questions, and stay one step ahead.",
  slug: "organize-pediatric-specialist-appointments",
  excerpt: "Juggling multiple pediatric specialists? Here's a simple, RN-informed system to keep every appointment, question, and follow-up in one place.",
  readMinutes: 5,
  tags: ["pediatric care navigation", "specialist appointments", "medically complex children", "appointment organization", "parent advocacy"],
  html: `<p>When your child sees multiple specialists, the calendar can feel like a second job. Between the gastroenterologist, the neurologist, and the follow-ups in between, it's easy for a detail to slip. The good news: a little structure goes a long way, and you don't need anything fancy to build it.</p>
<h2>Start With One Master List</h2>
<p>Keep a single running list of every provider your child sees — name, specialty, phone number, and what they manage. When everything lives in one place, you stop re-explaining your child's history from scratch at each visit, and you can hand a clear summary to any new provider.</p>
<h2>How do I keep track of so many appointments?</h2>
<p>The simplest system that works is one shared calendar plus a one-page "visit sheet" for each specialist. Before each appointment, jot down your top three questions and any changes since the last visit. After, note what was decided and the next step. This turns scattered visits into a connected story you can actually follow.</p>
<h2>Prepare for Each Visit in Five Minutes</h2>
<ul>
<li>Write your top questions down before you go — the ones you'll forget in the room.</li>
<li>Bring your current medication list and note anything new.</li>
<li>Ask, "What should I watch for, and when should I call you?"</li>
</ul>
<h2>What should I do between appointments?</h2>
<p>Between visits is where organization pays off. Keep notes on anything you want to raise next time, and file any paperwork in one folder (physical or digital). If something feels urgent, contact your child's provider directly — organization supports your care team, it never replaces them.</p>
<p>At ClearPath Pediatrics, our RN care navigators help families build exactly this kind of system, so you walk into every appointment prepared and leave with clarity instead of a pile of loose notes.</p>`,
  faq: [
    { q: "How do I keep track of so many appointments?", a: "Use one shared calendar plus a one-page visit sheet per specialist. Note your top questions before each visit and the decisions and next steps after, so scattered visits become one connected story." },
    { q: "What should I do between appointments?", a: "Keep running notes for what to raise next time, file paperwork in one place, and contact your child's provider directly for anything urgent. Organization supports your care team — it never replaces them." },
  ],
};

// ---- Main --------------------------------------------------------------------
async function main() {
  const DRYRUN = process.env.CLEARPATH_BLOG_DRYRUN === "1";
  const { weekday, prettyDate, iso } = phoenixParts();
  const topic = TOPIC_BY_DAY[weekday] || "Care Navigation Tips";
  const posts = readPosts();
  const recentTitles = posts.slice(0, 12).map(p => p.title);

  console.log(`[blog] ${prettyDate} (${weekday}) — topic: ${topic} — model: ${DRYRUN ? "DRY-RUN (no API call)" : MODEL}`);

  let data;
  if (DRYRUN) {
    data = SAMPLE_POST;
  } else {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ERROR: ANTHROPIC_API_KEY is not set. (Tip: CLEARPATH_BLOG_DRYRUN=1 previews without an API key.)");
      process.exit(1);
    }
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: buildSystemPrompt(topic, recentTitles),
      messages: [{ role: "user", content: `Write today's ClearPath Pediatrics blog post for the "${topic}" category. Return only the JSON object.` }],
    });
    const raw = resp.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try { data = JSON.parse(jsonText); }
    catch (e) {
      console.error("ERROR: could not parse model JSON.\n----- raw output -----\n" + raw.slice(0, 4000));
      process.exit(1);
    }
  }

  // Normalize + guard
  let slug = slugify(data.slug || data.title || `post-${iso}`);
  if (!slug) slug = `post-${iso}`;
  const existing = new Set(posts.map(p => p.slug));
  if (existing.has(slug)) { let n = 2; while (existing.has(`${slug}-${n}`)) n++; slug = `${slug}-${n}`; }

  const post = {
    slug,
    title: String(data.title || "").trim(),
    metaDescription: String(data.metaDescription || "").trim().slice(0, 165),
    excerpt: String(data.excerpt || "").trim(),
    readMinutes: Number.isFinite(data.readMinutes) ? Math.round(data.readMinutes) : 4,
    tags: Array.isArray(data.tags) ? data.tags.slice(0, 5).map(String) : [],
    html: sanitizeBodyHtml(String(data.html || "")),
    faq: Array.isArray(data.faq) ? data.faq.filter(f => f && f.q && f.a).slice(0, 3) : [],
    topic, iso, prettyDate,
  };

  if (!post.title || post.html.length < 400) {
    console.error("ERROR: generated post looks incomplete (missing title or body).");
    process.exit(1);
  }

  // Write the post page
  const postDir = path.join(BLOG_DIR, post.slug);
  fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(path.join(postDir, "index.html"), renderPost(post));

  // Update manifest (newest first) — store only index-card fields
  const manifestEntry = {
    slug: post.slug, title: post.title, excerpt: post.excerpt || post.metaDescription,
    metaDescription: post.metaDescription, tags: post.tags, topic: post.topic,
    iso: post.iso, prettyDate: post.prettyDate, readMinutes: post.readMinutes,
  };
  const updated = [manifestEntry, ...posts];
  fs.writeFileSync(POSTS_JSON, JSON.stringify(updated, null, 2) + "\n");

  // Rebuild index + sitemap
  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderIndex(updated));
  fs.writeFileSync(SITEMAP, renderSitemap(updated));

  console.log(`[blog] ✓ published: /blog/${post.slug}  ("${post.title}")`);
  console.log(`[blog] ✓ ${updated.length} total posts · sitemap + index updated`);
}

main().catch(err => { console.error(err); process.exit(1); });
