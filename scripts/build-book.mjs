#!/usr/bin/env node
/**
 * ClearPath Pediatrics — /book/, the one place every "book a call" button goes.
 * -------------------------------------------------------------
 * Before this, booking buttons opened Calendly cold in a new tab, and the
 * homepage asked for an email first and then sent the calendar link. A nervous
 * parent got no idea of what the call is, who is on it, or what to have ready.
 *
 * This page answers that, then puts the calendar right there. Anyone who has
 * just requested a Free Care Roadmap arrives with name and email filled in,
 * read from session storage the funnel set. Nothing personal goes in a URL.
 *
 * Calendly reports a completed booking to this page, which analytics.js records
 * as booking_scheduled: the real conversion, not just a click.
 *
 *   node scripts/build-book.mjs
 */
import path from "node:path";
import { ROOT, SITE, CAL, HEADER, HEADER_CSS, HEAD_ICONS, SCRIPTS, writePage } from "./site-chrome.mjs";

const url = `${SITE}/book/`;
const title = "Book a Free 30-Minute Call with a Pediatric RN Care Navigator | ClearPath Pediatrics";
const desc = "Book a free 30-minute call with a ClearPath Pediatrics RN care navigator. Talk through referrals, insurance, school and care coordination for your child. No sales pitch.";
const calUrl = `${CAL}?hide_gdpr_banner=1`;

const faq = [
  { q: "Is the call really free?", a: "Yes. It is a free 30-minute call with no cost and no commitment, and no one will pressure you to sign up for anything." },
  { q: "Do I need to prepare anything?", a: "No. Come as you are. If it is easy to have your child's list of doctors, any recent letters such as a denial or a referral, and your top questions nearby, the half hour goes further, but none of it is required." },
  { q: "Is this medical advice?", a: "No. ClearPath Pediatrics provides care navigation and education, never medical advice, diagnosis or treatment. Medical decisions stay with your child's licensed providers. If your child has a medical emergency, call 911." },
];

const ld = [
  { "@context": "https://schema.org", "@type": "WebPage", name: title, description: desc, url,
    isPartOf: { "@type": "WebSite", name: "ClearPath Pediatrics", url: `${SITE}/` },
    potentialAction: { "@type": "ScheduleAction", target: calUrl, name: "Book a free 30-minute call" } },
  { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
${HEAD_ICONS}
<meta property="og:type" content="website" />
<meta property="og:title" content="Book a free 30-minute call with a ClearPath RN" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/assets/clearpath-logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://assets.calendly.com" />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
<style>
:root{--navy:#0b2240;--navy2:#16335f;--gold:#e3a458;--gold2:#d6913e;--cream:#faf7f2;--ink:#1d2b3a;--soft:#4a5a6b;--line:#e7ded2}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--cream);line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--gold2)}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
${HEADER_CSS}
.intro{padding:44px 0 8px;max-width:760px}
.eyebrow{font-weight:700;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold2)}
h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.9rem,4.4vw,2.7rem);line-height:1.15;color:var(--navy2);margin:10px 0 12px}
.lede{font-size:1.06rem;color:var(--soft);max-width:62ch}
.ticks{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:16px;font-size:.92rem;font-weight:600;color:var(--navy2)}
.ticks span::before{content:"✓ ";color:var(--gold2)}
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:40px;align-items:start;padding:30px 0 60px}
.cal{grid-column:2;grid-row:1 / span 2;background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden;
  box-shadow:0 18px 50px rgba(11,34,64,.08);min-height:720px;position:sticky;top:96px}
.cal-load{padding:40px 28px;text-align:center;color:var(--soft)}
.cal-load a{font-weight:700}
.calendly-inline-widget{min-width:300px;height:720px}
.info{grid-column:1}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px 24px;margin-bottom:16px}
.card h2{font-family:'Playfair Display',Georgia,serif;font-size:1.22rem;color:var(--navy2);margin-bottom:10px}
.card ul{list-style:none;display:grid;gap:9px}
.card li{position:relative;padding-left:22px;color:var(--soft);font-size:.97rem}
.card li::before{content:"";position:absolute;left:2px;top:.62em;width:8px;height:8px;border-radius:50%;background:var(--gold)}
.card li b{color:var(--ink)}
.card p{color:var(--soft);font-size:.95rem}
.note{background:rgba(214,145,62,.1);border-color:rgba(214,145,62,.32)}
.phone{font-size:.95rem;color:var(--soft);margin-top:4px}
.phone a{font-weight:700;color:var(--navy2);text-decoration:none}
.faq h2{margin-bottom:6px}
.faq details{border-top:1px solid var(--line);padding:12px 0}
.faq details:first-of-type{border-top:0}
.faq summary{cursor:pointer;font-weight:600;color:var(--navy2);list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";float:right;color:var(--gold2);font-weight:700}
.faq details[open] summary::after{content:"–"}
.faq details p{margin-top:8px}
.lp-footer{background:var(--navy);color:rgba(255,255,255,.6);padding:30px 0;font-size:.85rem}
.lp-footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.lp-footer a{color:rgba(255,255,255,.7);text-decoration:none}
@media (max-width:900px){
  .grid{grid-template-columns:minmax(0,1fr);gap:18px;padding-top:20px}
  .cal{grid-column:1;grid-row:auto;position:static;min-height:0}
  .info{grid-column:1}
}
</style>
</head>
<body>
${HEADER}
<main class="wrap">
  <section class="intro">
    <span class="eyebrow">Free 30-minute call</span>
    <h1>Talk it through with a pediatric RN care navigator</h1>
    <p class="lede">Pick a time below. We'll look at where things stand with your child's care, what's stuck, and the next few steps. You'll leave with a plan whether or not you work with us.</p>
    <div class="ticks"><span>No sales pitch</span><span>No commitment</span><span>Online video call</span></div>
  </section>

  <div class="grid">
    <section class="cal" aria-label="Booking calendar">
      <div id="cal" class="cal-load">
        Loading the calendar…<br><br>
        <a href="${calUrl}" target="_blank" rel="noopener" data-cta="book-fallback">Open the booking calendar in a new tab →</a>
      </div>
    </section>

    <div class="info">
      <section class="card">
        <h2>What we'll cover</h2>
        <ul>
          <li><b>Where things stand.</b> The doctors, appointments and paperwork involved right now.</li>
          <li><b>What's stuck.</b> A denial, a referral that's gone quiet, an IEP meeting, a discharge, or just too much at once.</li>
          <li><b>Your next steps.</b> Two or three concrete actions, in order, that you can take this week.</li>
          <li><b>Whether we're a fit.</b> If ClearPath isn't the right help, we'll say so.</li>
        </ul>
      </section>
      <section class="card">
        <h2>Helpful to have nearby</h2>
        <ul>
          <li>Your child's list of doctors and specialists</li>
          <li>Any recent letters: a denial, a referral, a school notice</li>
          <li>The two or three questions on your mind</li>
        </ul>
        <p style="margin-top:12px">None of it is required. Come as you are.</p>
      </section>
      <section class="card faq">
        <h2>Questions</h2>
        ${faq.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n        ")}
      </section>
      <section class="card note">
        <p><strong>This call is not medical advice.</strong> ClearPath Pediatrics provides care navigation and education only. If your child is having a medical emergency, call 911.</p>
      </section>
      <p class="phone">Prefer to call? <a href="tel:+19494165447">(949) 416-5447</a></p>
    </div>
  </div>
</main>
<footer class="lp-footer"><div class="wrap">
  <span>Copyright © 2025 ClearPath Pediatrics, LLC. — All Rights Reserved.</span>
  <span><a href="/privacy-policy/">Privacy</a> · <a href="/terms-of-use/">Terms</a></span>
</div></footer>
${SCRIPTS}
<script>
(function () {
  var holder = document.getElementById("cal");
  var prefill = {};
  try { prefill = JSON.parse(sessionStorage.getItem("cpp_prefill") || "{}") || {}; } catch (e) {}
  var from = "";
  try { var r = document.referrer && new URL(document.referrer); if (r && r.origin === location.origin) from = r.pathname; } catch (e) {}
  function mount() {
    if (!window.Calendly) return;
    holder.className = "calendly-inline-widget";
    holder.innerHTML = "";
    // Calendly's own prefill option did not fill the form in testing, so use its
    // documented URL parameters. They go only to Calendly, the service receiving
    // the details anyway, and never appear in this page's URL or analytics.
    var url = ${JSON.stringify(calUrl)};
    if (prefill.name) url += "&name=" + encodeURIComponent(prefill.name);
    if (prefill.email) url += "&email=" + encodeURIComponent(prefill.email);
    window.Calendly.initInlineWidget({
      url: url,
      parentElement: holder,
      // Shows Dean, inside Calendly, which page led to the booking.
      utm: { utmSource: "clearpathpediatrics.com", utmMedium: "book-page", utmContent: from || "direct" },
    });
    var frame = holder.querySelector("iframe");
    if (frame) frame.title = "Book a free 30-minute call";
  }
  var s = document.createElement("script");
  s.src = "https://assets.calendly.com/assets/external/widget.js";
  s.async = true;
  s.onload = mount;
  document.head.appendChild(s);
})();
</script>
</body>
</html>`;

writePage(path.join(ROOT, "book", "index.html"), html);
console.log("[book] ✓ /book/");
