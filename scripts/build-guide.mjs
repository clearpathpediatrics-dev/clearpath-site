#!/usr/bin/env node
/**
 * ClearPath Pediatrics — pillar guide + comparison page builder
 * -------------------------------------------------------------
 * Renders two evergreen, internally-linked hub pages:
 *   /pediatric-care-navigation-guide/  — the PILLAR page. Defines the topic,
 *      explains the service, and links to EVERY blog post (grouped by topic)
 *      plus the SEO landing pages. Rebuilt daily so new posts auto-appear.
 *   /care-navigator-vs-case-manager/   — a definition/comparison page with a
 *      table (the format AI engines love to quote for "X vs Y" queries).
 *
 * No API key needed — copy is hand-authored here. Content is navigation /
 * education only (no medical advice), matching site guardrails.
 *
 * Exposed as buildGuidePages(posts) so the daily blog generator can call it,
 * and runnable standalone: `node scripts/build-guide.mjs`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANDING_PAGES } from "./landing-pages.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://clearpathpediatrics.com";
const CAL = "https://calendly.com/clearpathpediatrics/30min";

export const GUIDE_SLUG = "pediatric-care-navigation-guide";
export const COMPARE_SLUG = "care-navigator-vs-case-manager";

const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Friendly labels + display order for the topic groups used in posts.json.
const TOPIC_ORDER = [
  "Care Navigation Tips",
  "Special Needs & Complex Care",
  "Insurance & Billing Guidance",
  "Milestone & Wellness Topics",
];
const TOPIC_BLURB = {
  "Care Navigation Tips": "Practical systems for organizing appointments, records, referrals, and questions across your child's whole care team.",
  "Special Needs & Complex Care": "Preparation and organization guides for IEPs, home nursing, DME, and coordinating care for medically complex children.",
  "Insurance & Billing Guidance": "Plain-language help with EOBs, deductibles, prior authorizations, denied claims, and coverage before a specialist visit.",
  "Milestone & Wellness Topics": "Family-friendly ways to track developmental milestones and prepare for well-child visits with confidence.",
};

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
.hero{background:radial-gradient(900px 420px at 82% -10%,rgba(227,164,88,.15),transparent 60%),linear-gradient(160deg,var(--navy),var(--navy2));color:#fff;padding:60px 0 54px}
.hero .eyebrow{display:inline-block;margin-bottom:12px}
.hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.1rem,4.6vw,3.1rem);line-height:1.12;margin-bottom:16px;max-width:860px}
.hero p{color:rgba(255,255,255,.85);font-size:1.08rem;max-width:720px;margin-bottom:14px}
.btn{display:inline-flex;align-items:center;gap:.5em;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;font-weight:600;padding:15px 30px;border-radius:999px;margin-top:14px;box-shadow:0 12px 30px rgba(214,145,62,.4)}
.btn:hover{text-decoration:none;transform:translateY(-2px)}
.sec{padding:50px 0}
.sec h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.6rem,3vw,2.15rem);color:var(--navy2);margin-bottom:16px}
.sec h3{font-family:'Playfair Display',Georgia,serif;font-size:1.25rem;color:var(--navy2);margin:20px 0 8px}
.sec p{color:var(--soft);margin-bottom:14px;max-width:800px}
.sec p.lead{font-size:1.08rem;color:var(--ink)}
.toc{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:22px 26px;margin-top:8px}
.toc h2{font-size:1.1rem;margin-bottom:10px}
.toc ul{list-style:none;display:grid;grid-template-columns:repeat(2,1fr);gap:8px 22px}
.toc a{font-weight:500}
.who{list-style:none;display:grid;gap:10px;max-width:800px;margin-top:6px}
.who li{display:flex;gap:12px;align-items:flex-start;color:var(--ink);font-size:1.02rem}
.who li::before{content:"✓";flex:none;width:26px;height:26px;border-radius:50%;background:rgba(63,157,109,.14);color:var(--green);font-weight:800;font-size:.85rem;display:grid;place-items:center;margin-top:2px}
.topic{margin-bottom:30px}
.topic .tblurb{color:var(--soft);margin:2px 0 12px;max-width:800px}
.plist{list-style:none;display:grid;gap:10px}
.plist li{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px 18px;box-shadow:0 3px 12px rgba(11,34,64,.05)}
.plist a{font-weight:600;color:var(--navy2)}
.plist a:hover{color:var(--gold2)}
.plist .pex{display:block;color:var(--soft);font-size:.92rem;font-weight:400;margin-top:3px}
.cards2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:6px}
.lcard{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:22px 24px;box-shadow:0 4px 16px rgba(11,34,64,.06)}
.lcard h3{margin:0 0 6px}
.lcard p{margin-bottom:10px;font-size:.96rem}
.tablewrap{overflow-x:auto;margin:8px 0 6px}
table.cmp{border-collapse:collapse;width:100%;min-width:620px;background:var(--paper);border:1px solid var(--line);border-radius:14px;overflow:hidden}
table.cmp th,table.cmp td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top;font-size:.96rem}
table.cmp thead th{background:var(--navy);color:#fff;font-family:'Playfair Display',Georgia,serif;font-weight:700}
table.cmp tbody th{color:var(--navy2);font-weight:700;background:rgba(227,164,88,.07);width:180px}
table.cmp tr:last-child td,table.cmp tr:last-child th{border-bottom:none}
.faq{max-width:820px}
.faq .qa{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:20px 24px;margin-bottom:14px}
.faq h3{font-family:'Playfair Display',Georgia,serif;font-size:1.1rem;color:var(--navy2);margin:0 0 6px}
.faq p{color:var(--soft);margin:0}
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
@media(max-width:720px){.cards2,.toc ul{grid-template-columns:1fr}.lp-footer .wrap{flex-direction:column;text-align:center}.lp-nav{gap:14px}}
`;

const HEADER = `
<header class="lp-header"><div class="wrap">
  <a href="/" class="lp-brand" aria-label="ClearPath Pediatrics home"><img src="/assets/clearpath-logo-white.png" alt="ClearPath Pediatrics" /></a>
  <nav class="lp-nav"><a href="/">Home</a><a href="/blog/">Blog</a><a href="/${GUIDE_SLUG}">Guide</a><a href="/#services">Services</a>
    <a href="${CAL}" target="_blank" rel="noopener" class="cta">Book a Free Call</a></nav>
</div></header>`;

const FOOTER = `
<footer class="lp-footer"><div class="wrap">
  <span>Copyright © 2025 ClearPath Pediatrics, LLC. — All Rights Reserved.</span>
  <nav><a href="/">Home</a><a href="/blog/">Blog</a><a href="/${GUIDE_SLUG}">Guide</a><a href="/privacy-policy">Privacy</a><a href="/terms-of-use">Terms</a><a href="/#contact">Contact</a></nav>
</div></footer>`;

function head(title, desc, url, keywords, jsonld) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="keywords" content="${esc(keywords)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/png" href="/assets/clearpath-logo.png" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/assets/clearpath-logo.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="geo.region" content="US-AZ" /><meta name="geo.placename" content="Phoenix, Arizona" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
${jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
<style>${CSS}</style>
</head>
<body>
${HEADER}`;
}

const foot = `${FOOTER}
<script src="/assets/analytics.js" defer></script>
<script src="/assets/email-popup.js" defer></script>
</body>
</html>`;


// ---------------------------------------------------------------- PILLAR PAGE
function renderGuide(posts) {
  const url = `${SITE}/${GUIDE_SLUG}`;
  const title = "The Complete Guide to Pediatric Care Navigation for Parents | ClearPath Pediatrics";
  const desc = "A parent's complete guide to pediatric care navigation — what a care navigator does, how it helps medically complex kids, and dozens of RN-written how-to guides.";
  const keywords = "pediatric care navigation, care navigator, medically complex child, pediatric care coordination, RN care navigator, Phoenix pediatric care navigation";

  // Group posts by topic, preserving newest-first order within each group.
  const groups = TOPIC_ORDER
    .map(topic => ({ topic, items: posts.filter(p => p.topic === topic) }))
    .filter(g => g.items.length);
  const ungrouped = posts.filter(p => !TOPIC_ORDER.includes(p.topic));
  if (ungrouped.length) groups.push({ topic: "More Care Navigation Articles", items: ungrouped });

  const faq = [
    { q: "What is a pediatric care navigator?", a: "A pediatric care navigator is a professional — often a registered nurse (RN) — who helps families organize and coordinate a child's healthcare. They help you understand referrals, prepare for specialist visits, keep records in one place, and communicate with your child's care team. A care navigator does not provide medical care, diagnosis, or treatment; those decisions stay with your child's licensed providers." },
    { q: "What does a pediatric care navigator actually do?", a: "Day to day, a care navigator helps you track appointments across multiple specialists, prepare questions before visits, organize insurance paperwork and referrals, understand what providers have already told you, and keep a single up-to-date record of medications, providers, and history. The goal is to reduce the administrative load on parents so families feel prepared and in control." },
    { q: "Who benefits most from pediatric care navigation?", a: "Families of medically complex children, kids seeing several specialists, children recently discharged from the NICU or hospital, and families managing special-needs or chronic-care coordination benefit most. Any parent who feels overwhelmed by appointments, referrals, and insurance can benefit." },
    { q: "Does ClearPath Pediatrics provide medical advice?", a: "No. ClearPath Pediatrics provides care navigation and education only — never medical advice, diagnosis, treatment, or emergency services. All medical decisions remain with your child's licensed healthcare providers. In an emergency, call 911." },
    { q: "Where is ClearPath Pediatrics located?", a: "ClearPath Pediatrics is based in Phoenix, Arizona and works with families across the Phoenix metro area. Care-navigation support is delivered by phone and video, so families can get help wherever they are." },
  ];

  const jsonld = [
    {
      "@context": "https://schema.org", "@type": "MedicalWebPage",
      name: title, description: desc, url,
      about: { "@type": "Organization", name: "ClearPath Pediatrics" },
      publisher: { "@type": "Organization", name: "ClearPath Pediatrics", logo: { "@type": "ImageObject", url: `${SITE}/assets/clearpath-logo.png` } },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    {
      "@context": "https://schema.org", "@type": "ItemList",
      name: "Pediatric care navigation articles",
      itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/blog/${p.slug}`, name: p.title })),
    },
  ];

  const tocLinks = groups.map(g => `<li><a href="#${slugAnchor(g.topic)}">${esc(g.topic)}</a></li>`).join("");
  const landingLinks = LANDING_PAGES.map(p => `
      <div class="lcard"><h3><a href="/${p.slug}">${esc(p.h1)}</a></h3><p>${esc(p.metaDescription)}</p><a href="/${p.slug}">Learn more →</a></div>`).join("");

  const groupsHtml = groups.map(g => `
    <div class="topic" id="${slugAnchor(g.topic)}">
      <h2>${esc(g.topic)}</h2>
      ${TOPIC_BLURB[g.topic] ? `<p class="tblurb">${esc(TOPIC_BLURB[g.topic])}</p>` : ""}
      <ul class="plist">${g.items.map(p => `
        <li><a href="/blog/${p.slug}">${esc(p.title)}</a><span class="pex">${esc(p.excerpt || p.metaDescription || "")}</span></li>`).join("")}
      </ul>
    </div>`).join("");

  return head(title, desc, url, keywords, jsonld) + `
<section class="hero"><div class="wrap">
  <span class="eyebrow">The complete parent's guide</span>
  <h1>Pediatric Care Navigation: A Complete Guide for Parents</h1>
  <p>If your child sees multiple specialists, has complex medical needs, or you're simply drowning in referrals and insurance paperwork, you're in the right place. This guide explains what pediatric care navigation is, how it helps, and links to every how-to article our RN care navigators have written.</p>
  <a href="${CAL}" target="_blank" rel="noopener" class="btn">Book a Free 30-Minute Call →</a>
</div></section>

<section class="sec bg-paper"><div class="wrap">
  <h2>What is pediatric care navigation?</h2>
  <p class="lead">Pediatric care navigation is professional help — usually from a registered nurse (RN) — that guides families through the healthcare system so a child's care is organized, coordinated, and understood.</p>
  <p>A care navigator does not replace your child's doctors. Instead, they handle the exhausting logistics <em>around</em> care: tracking appointments across specialists, preparing you for visits, organizing records and insurance paperwork, and helping you understand what your providers have already told you. The result is less overwhelm and more confidence — so nothing important falls through the cracks.</p>
  <div class="toc">
    <h2>Jump to a section</h2>
    <ul>${tocLinks}<li><a href="#help">How ClearPath helps</a></li><li><a href="#faq">Common questions</a></li></ul>
  </div>
</div></section>

<section class="sec bg-cream"><div class="wrap">
  <h2>What does a care navigator do?</h2>
  <ul class="who">
    <li>Builds one master record of your child's providers, medications, and history.</li>
    <li>Keeps every specialist appointment and follow-up in one organized place.</li>
    <li>Helps you prepare focused questions before each visit — and capture the answers after.</li>
    <li>Organizes referrals, prior authorizations, and insurance paperwork.</li>
    <li>Helps you understand (not decide) what your licensed providers have explained.</li>
    <li>Reduces the administrative load so you can focus on being a parent.</li>
  </ul>
</div></section>

<section class="sec bg-paper"><div class="wrap">
  <h2>RN-written how-to guides by topic</h2>
  <p>Every article below is written for parents and focuses on organizing and preparing — never medical advice. New guides are published regularly.</p>
  ${groupsHtml}
</div></section>

<section class="sec bg-cream" id="help"><div class="wrap">
  <h2>How ClearPath Pediatrics helps</h2>
  <p>ClearPath Pediatrics is a Phoenix-based, RN-led care-navigation service. These focused guides show how we support specific situations:</p>
  <div class="cards2">${landingLinks}
    <div class="lcard"><h3><a href="/care-navigator-vs-case-manager">Care Navigator vs. Case Manager vs. Advocate</a></h3><p>Not sure which kind of support you need? Here's how these roles differ and overlap.</p><a href="/care-navigator-vs-case-manager">Compare the roles →</a></div>
    <div class="lcard"><h3><a href="/is-clearpath-right-for-us">Is ClearPath right for our family?</a></h3><p>Take a free 60-second check to see if care navigation fits your situation.</p><a href="/is-clearpath-right-for-us">Take the quick check →</a></div>
  </div>
</div></section>

<section class="sec bg-paper" id="faq"><div class="wrap faq">
  <h2>Frequently asked questions</h2>
  ${faq.map(f => `<div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("\n  ")}
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
${foot}`;
}

// ------------------------------------------------------------ COMPARISON PAGE
function renderCompare() {
  const url = `${SITE}/${COMPARE_SLUG}`;
  const title = "Care Navigator vs. Case Manager vs. Patient Advocate: What's the Difference? | ClearPath Pediatrics";
  const desc = "Confused by pediatric care navigator vs. case manager vs. patient advocate? A clear, side-by-side comparison of what each role does and who each one helps.";
  const keywords = "care navigator vs case manager, pediatric patient advocate, care coordinator vs case manager, what is a care navigator, pediatric care coordination roles";

  const faq = [
    { q: "What is the difference between a care navigator and a case manager?", a: "A care navigator focuses on guiding and organizing a family's experience — coordinating appointments, preparing for visits, and helping parents understand the system. A case manager is often employed by an insurer, hospital, or agency to manage a defined case, authorizations, and resources, frequently tied to a specific benefit or program. Navigators are family-centered guides; case managers typically administer a plan of care within an organization." },
    { q: "Is a care navigator the same as a patient advocate?", a: "They overlap but aren't identical. A patient advocate primarily speaks up for a patient's interests — for example, in disputes, billing appeals, or difficult decisions. A care navigator's emphasis is ongoing organization and coordination across a child's whole care team. Many navigators do advocate, and many advocates do some navigation, but the core focus differs." },
    { q: "Which one do I need for my child?", a: "If your main challenge is keeping many specialists, appointments, and records organized and feeling prepared, a care navigator is usually the best fit. If you're facing a specific dispute or benefit decision, a patient advocate may help; if your insurer or hospital assigns support tied to a program, that's likely a case manager. These roles can work together." },
    { q: "Does a care navigator give medical advice?", a: "No. A care navigator — including ClearPath Pediatrics — provides organization, education, and coordination only, never medical advice, diagnosis, or treatment. All clinical decisions remain with your child's licensed healthcare providers." },
  ];

  const jsonld = [
    { "@context": "https://schema.org", "@type": "Article", headline: "Care Navigator vs. Case Manager vs. Patient Advocate", description: desc, mainEntityOfPage: url, author: { "@type": "Organization", name: "ClearPath Pediatrics" }, publisher: { "@type": "Organization", name: "ClearPath Pediatrics", logo: { "@type": "ImageObject", url: `${SITE}/assets/clearpath-logo.png` } }, image: `${SITE}/assets/clearpath-logo.png` },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];

  const rows = [
    ["Primary focus", "Organizing & coordinating a child's whole care experience", "Managing a defined case, benefits, or program", "Speaking up for the patient's interests & rights"],
    ["Who they usually work for", "The family (independent or fee-for-service)", "An insurer, hospital, or agency", "The family, or an advocacy organization"],
    ["Typical background", "Registered nurse (RN) or clinical professional", "Nurse or social worker within a system", "Varies — nurse, social worker, or trained advocate"],
    ["Best when you need…", "Help staying organized & prepared across many providers", "A benefit, authorization, or program administered", "Support in a dispute, appeal, or tough decision"],
    ["Gives medical advice?", "No — organization & education only", "No — administers a plan of care", "No — represents your interests"],
  ];

  return head(title, desc, url, keywords, jsonld) + `
<section class="hero"><div class="wrap">
  <span class="eyebrow">Understanding your options</span>
  <h1>Care Navigator vs. Case Manager vs. Patient Advocate</h1>
  <p>These three roles all help families through the healthcare system — but they're not the same. Here's a clear, side-by-side look at what each one does, so you can find the right kind of support for your child.</p>
  <a href="${CAL}" target="_blank" rel="noopener" class="btn">Talk to an RN — Free Call →</a>
</div></section>

<section class="sec bg-paper"><div class="wrap">
  <h2>Quick comparison</h2>
  <div class="tablewrap">
    <table class="cmp">
      <thead><tr><th scope="col"></th><th scope="col">Care Navigator</th><th scope="col">Case Manager</th><th scope="col">Patient Advocate</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join("\n        ")}
      </tbody>
    </table>
  </div>
  <p style="margin-top:14px">The lines blur in practice — a great care navigator often advocates for your family and helps with benefit questions too. The difference is where each role puts its energy first.</p>
</div></section>

<section class="sec bg-cream"><div class="wrap">
  <h2>Care navigator</h2>
  <p>A <strong>pediatric care navigator</strong> is a guide for the whole journey. Often an RN, they keep your child's appointments, records, referrals, and questions organized across every specialist — so you walk into each visit prepared and leave with clarity. This is the ongoing, day-to-day support that reduces overwhelm for families of medically complex kids.</p>
  <h2>Case manager</h2>
  <p>A <strong>case manager</strong> is typically employed by an insurer, hospital, or agency to manage a specific case — coordinating authorizations, services, and resources tied to a benefit or program. Their support is valuable but usually scoped to that organization's plan of care.</p>
  <h2>Patient advocate</h2>
  <p>A <strong>patient advocate</strong> focuses on representing your interests — for example, helping with a billing appeal, a coverage dispute, or a difficult decision. Advocacy is about making sure your voice is heard.</p>
</div></section>

<section class="sec bg-paper"><div class="wrap faq">
  <h2>Common questions</h2>
  ${faq.map(f => `<div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("\n  ")}
  <div class="disclaimer"><strong>Important:</strong> ClearPath Pediatrics provides care navigation and education only — not medical advice, diagnosis, treatment, or emergency services. In an emergency, call 911.</div>
  <p style="margin-top:16px">Want the full picture? Read our <a href="/${GUIDE_SLUG}">complete guide to pediatric care navigation</a>.</p>
</div></section>

<section class="sec"><div class="wrap">
  <div class="cta-band">
    <span class="eyebrow" style="color:var(--gold)">Not sure which you need?</span>
    <h2>Let's figure it out together.</h2>
    <p>Book a free 30-minute call with a ClearPath RN. We'll help you find the right kind of support — even if it isn't us.</p>
    <a href="${CAL}" target="_blank" rel="noopener" class="btn">Book My Free Call →</a>
  </div>
</div></section>
${foot}`;
}

function slugAnchor(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readPosts() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "blog", "posts.json"), "utf8")); }
  catch { return []; }
}

// Build both hub pages. Exported so the daily generator can rebuild them.
export function buildGuidePages(posts = readPosts()) {
  const gdir = path.join(ROOT, GUIDE_SLUG);
  const cdir = path.join(ROOT, COMPARE_SLUG);
  fs.mkdirSync(gdir, { recursive: true });
  fs.mkdirSync(cdir, { recursive: true });
  fs.writeFileSync(path.join(gdir, "index.html"), renderGuide(posts));
  fs.writeFileSync(path.join(cdir, "index.html"), renderCompare());
  return [GUIDE_SLUG, COMPARE_SLUG];
}

// Run standalone.
if (import.meta.url === `file://${process.argv[1]}`) {
  const posts = readPosts();
  const built = buildGuidePages(posts);
  built.forEach(s => console.log(`  ✓ /${s}`));
  console.log(`[guide] built ${built.length} hub pages · linked ${posts.length} posts.`);
}
