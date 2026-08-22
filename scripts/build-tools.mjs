#!/usr/bin/env node
/**
 * ClearPath Pediatrics — free parent tools.
 * -------------------------------------------------------------
 * WHY TOOLS AND NOT MORE ARTICLES
 *
 * A young domain's bottleneck is authority, not volume. Nobody links to a blog
 * post; people link to a thing that does work for them. These three are the
 * jobs parents in this niche actually ask about in groups and forums, and each
 * ranks for high-intent queries while feeding the roadmap funnel.
 *
 * Rules every tool follows:
 *   - Runs entirely in the browser. No health information is ever transmitted,
 *     which is both the right thing and the strongest trust signal on the page.
 *   - Formats what the family already has. It never advises, never suggests a
 *     dose, never interprets a result.
 *   - Prints cleanly, because the point is walking in holding it.
 *
 * Run: node scripts/build-tools.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://clearpathpediatrics.com";
const CAL = "https://calendly.com/clearpathpediatrics/30min";

const head = ({ slug, title, desc, keywords, howto }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${keywords.join(", ")}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${SITE}/tools/${slug}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}/tools/${slug}/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/tools.css">
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "WebApplication",
  name: howto.name, url: `${SITE}/tools/${slug}/`,
  applicationCategory: "HealthApplication", operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: desc,
  publisher: { "@type": "Organization", name: "ClearPath Pediatrics", url: SITE },
})}</script>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "HowTo",
  name: howto.name, description: desc,
  totalTime: howto.time,
  step: howto.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s })),
})}</script>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: howto.faq.map(f => ({ "@type": "Question", name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a } })),
})}</script>
</head>
<body>
<header class="top"><div class="top-in">
  <a href="/" aria-label="ClearPath Pediatrics home"><img src="/assets/logo-420.png" alt="ClearPath Pediatrics" width="90" height="60"></a>
  <a class="ph" href="tel:+19494165447">(949) 416-5447</a>
</div></header>
<main class="wrap">`;

const faqBlock = (faq) => `
<div class="card">
  <h2>Common questions</h2>
  ${faq.map(f => `<p style="margin-bottom:14px"><strong style="color:var(--navy)">${f.q}</strong><br><span style="color:var(--muted);font-size:15px">${f.a}</span></p>`).join("")}
</div>`;

const tail = (related) => `
<div class="cta">
  <h2>Want an RN to go through this with you?</h2>
  <p>Answer six questions and we'll send a personalized care navigation plan for your child — free, in your inbox in minutes, no call required.</p>
  <a class="btn gold" href="/free-care-roadmap/">Get my child's free plan →</a>
</div>
<div class="more">${related.map(r => `<a href="${r.href}">${r.label} →</a>`).join("")}</div>
<p class="legal">
  ClearPath Pediatrics provides care navigation and health education only — not medical advice, diagnosis, or treatment.<br>
  This tool formats information you already have. It does not review, verify, or advise on your child's care. For emergencies, call 911.<br>
  <a href="/privacy-policy/">Privacy</a> · <a href="/terms-of-use/">Terms</a>
</p>
</main>
<footer><div class="wrap">ClearPath Pediatrics, LLC · Phoenix, AZ &amp; nationwide · <a href="tel:+19494165447">(949) 416-5447</a></div></footer>
<script src="/assets/roadmap-cta.js" defer></script>
</body>
</html>`;

/* ============================================================ 1. APPEAL LETTER */
const appeal = () => head({
  slug: "insurance-appeal-letter",
  title: "Free Pediatric Insurance Appeal Letter Builder | ClearPath Pediatrics",
  desc: "Build a formatted appeal letter for a denied pediatric claim in a few minutes. Free, private, and it calculates your appeal deadline. Nothing leaves your browser.",
  keywords: ["pediatric insurance appeal letter", "appeal denied claim child", "insurance denial appeal template", "prior authorization appeal letter", "medical necessity appeal"],
  howto: {
    name: "How to write a pediatric insurance appeal letter",
    time: "PT10M",
    steps: ["Enter the details from your denial letter", "Describe the service that was denied and why it is needed",
            "Generate the formatted appeal letter", "Print or copy it, attach your documents, and send it before the deadline"],
    faq: [
      { q: "How long do I have to appeal?", a: "Most plans allow 180 days from the date printed on the denial letter, but your plan documents govern. The date on the letter is what counts, not the day you opened it — check it first." },
      { q: "Does this send anything to ClearPath?", a: "No. The tool runs entirely in your browser. Nothing you type is transmitted, stored, or seen by us." },
      { q: "Will this guarantee my appeal succeeds?", a: "No tool can. What it does is make sure the letter is complete, addresses the stated denial reason, and reaches the right place before the deadline — which is where most appeals fail." },
      { q: "What should I attach?", a: "The denial letter, a letter of medical necessity from the ordering provider addressing the specific denial reason, and the relevant visit notes. The tool lists these for you." },
    ],
  },
}) + `
<section class="hero">
  <span class="pill">Free · Private · No signup</span>
  <h1>Pediatric insurance appeal letter builder</h1>
  <p class="lede">A denial is a deadline. This builds a complete, properly formatted appeal letter that argues against the specific reason you were given — and tells you the date it has to be sent by.</p>
  <div class="privacy">🔒 Everything stays in your browser. Nothing is sent to us.</div>
</section>

<div class="card">
  <h2>Your details</h2>
  <p class="sub">Copy these straight off the denial letter and your insurance card.</p>
  <div class="grid g2">
    <div><label class="f" for="pn">Your full name</label><input id="pn" placeholder="Jane Smith"></div>
    <div><label class="f" for="cn">Child's full name</label><input id="cn" placeholder="Sam Smith"></div>
    <div><label class="f" for="dob">Child's date of birth</label><input id="dob" type="date"></div>
    <div><label class="f" for="mid">Member / policy ID</label><input id="mid" placeholder="From the insurance card"></div>
    <div><label class="f" for="ins">Insurance company</label><input id="ins" placeholder="e.g. Blue Cross Blue Shield"></div>
    <div><label class="f" for="clm">Claim or reference number</label><input id="clm" placeholder="From the denial letter"></div>
    <div><label class="f" for="dd">Date on the denial letter</label><input id="dd" type="date">
      <p class="hint">Your deadline is counted from this date, not the day it arrived.</p></div>
    <div><label class="f" for="win">Appeal window</label>
      <select id="win"><option value="180">180 days (most common)</option><option value="60">60 days</option>
      <option value="90">90 days</option><option value="120">120 days</option><option value="365">365 days</option></select>
      <p class="hint">Check your plan documents — this varies.</p></div>
  </div>
</div>

<div class="card">
  <h2>What was denied</h2>
  <p class="sub">Be specific. An appeal that argues against the exact stated reason is far stronger than one that restates the diagnosis.</p>
  <div class="grid">
    <div><label class="f" for="svc">Service, therapy, medication or equipment denied</label>
      <input id="svc" placeholder="e.g. 24 sessions of outpatient feeding therapy"></div>
    <div><label class="f" for="rsn">The reason they gave for the denial</label>
      <input id="rsn" placeholder="Copy the wording from the letter, e.g. &quot;not medically necessary&quot;"></div>
    <div><label class="f" for="prov">Ordering provider</label><input id="prov" placeholder="Dr. Chen, Pediatric GI"></div>
    <div><label class="f" for="why">Why your child needs it</label>
      <textarea id="why" placeholder="What happens without it. What has already been tried. What the provider has said. Plain language is fine — write it the way you would say it."></textarea></div>
  </div>
  <div class="row">
    <button class="btn" id="go">Build my appeal letter</button>
    <button class="btn ghost" id="print" style="display:none">Print</button>
    <button class="btn ghost" id="copy" style="display:none">Copy text</button>
  </div>
  <div id="dl"></div>
</div>

<div id="out" class="out" style="display:none"></div>
${faqBlock([
  { q: "How long do I have to appeal?", a: "Most plans allow 180 days from the date on the denial letter, but your plan documents govern. The letter date is what counts." },
  { q: "Does anything I type get sent to ClearPath?", a: "No. This runs entirely in your browser. Nothing is transmitted or stored." },
  { q: "What should I attach to the letter?", a: "The denial letter itself, a letter of medical necessity from the ordering provider that addresses the specific denial reason, and the relevant visit notes." },
  { q: "What if the appeal is denied too?", a: "Most plans have a second internal level, and after that an external review by an independent body. Ask your insurer in writing what levels remain and the deadline for each." },
])}
${tail([
  { href: "/blog/appeal-denied-pediatric-insurance-claim/", label: "Guide: appealing a denied claim" },
  { href: "/tools/medication-schedule/", label: "Medication schedule builder" },
  { href: "/pediatric-care-navigation-guide/", label: "The full care navigation guide" },
])}
<script>
(function(){
  var $=function(id){return document.getElementById(id)};
  var v=function(id){return ($(id).value||"").trim()};
  var fmt=function(d){ if(!d) return ""; var p=d.split("-");
    return new Date(p[0],p[1]-1,p[2]).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}); };

  $("dd").addEventListener("change",deadline);
  $("win").addEventListener("change",deadline);
  function deadline(){
    var d=v("dd"); if(!d){$("dl").innerHTML="";return;}
    var days=parseInt(v("win"),10)||180;
    // Parse at local noon. new Date("2026-08-01") is UTC midnight, which renders
    // a day earlier west of Greenwich — unacceptable on an appeal deadline.
    var p=d.split("-"), due=new Date(+p[0], +p[1]-1, +p[2], 12, 0, 0);
    due.setDate(due.getDate()+days);
    var left=Math.ceil((due-new Date())/86400000);
    var s=left<0 ? "<b>That window has passed.</b> Ask your insurer in writing whether a late appeal or an external review is still available — sometimes it is."
      : "<b>Your appeal is due by "+due.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+"</b> — that is "+left+" day"+(left===1?"":"s")+" from today. Send it well before then; delivery time counts against you.";
    $("dl").innerHTML='<div class="deadline">'+s+"</div>";
  }

  $("go").addEventListener("click",function(){
    var today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    var L=[];
    L.push(today);L.push("");
    L.push(v("ins")||"[Insurance company]");L.push("Appeals Department");L.push("");
    L.push("RE: Formal appeal of denied claim");
    L.push("Member: "+(v("cn")||"[Child's name]")+"   DOB: "+(fmt(v("dob"))||"[Date of birth]"));
    L.push("Member ID: "+(v("mid")||"[Member ID]"));
    L.push("Claim / reference: "+(v("clm")||"[Claim number]"));
    L.push("Denial letter dated: "+(fmt(v("dd"))||"[Date of denial]"));
    L.push("");L.push("To whom it may concern,");L.push("");
    L.push("I am the parent and legal guardian of "+(v("cn")||"[Child's name]")+", and I am formally appealing your denial of "+(v("svc")||"[service denied]")+".");
    L.push("");
    L.push("Your letter dated "+(fmt(v("dd"))||"[date]")+" states the reason for denial as: \\""+(v("rsn")||"[reason given]")+"\\". I am appealing that determination on the following grounds.");
    L.push("");
    L.push(v("why")||"[Describe what happens without this service, what has already been tried, and what the ordering provider has advised.]");
    L.push("");
    L.push("This service was ordered by "+(v("prov")||"[ordering provider]")+", who is treating my child and is best placed to assess medical necessity. I have requested a letter of medical necessity addressing your stated reason directly, and it is enclosed.");
    L.push("");
    L.push("I am requesting that you:");
    L.push("  1. Overturn the denial and authorise the requested service.");
    L.push("  2. Provide the specific plan language and clinical criteria relied on, in writing, if the denial is upheld.");
    L.push("  3. Confirm what further levels of appeal are available to me, including external review, and the deadline for each.");
    L.push("");
    L.push("Please confirm receipt of this appeal in writing. I can be reached at the contact details below.");
    L.push("");L.push("Enclosed:");
    L.push("  - Copy of your denial letter dated "+(fmt(v("dd"))||"[date]"));
    L.push("  - Letter of medical necessity from "+(v("prov")||"[ordering provider]"));
    L.push("  - Relevant clinical notes supporting the request");
    L.push("");L.push("Sincerely,");L.push("");L.push("");
    L.push(v("pn")||"[Your name]");
    L.push("Parent / legal guardian of "+(v("cn")||"[Child's name]"));
    L.push("[Your address]");L.push("[Your phone]   [Your email]");
    $("out").textContent=L.join("\\n");
    $("out").style.display="block"; $("out").classList.add("print-show");
    $("print").style.display=""; $("copy").style.display="";
    $("out").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("print").addEventListener("click",function(){window.print()});
  $("copy").addEventListener("click",function(){
    navigator.clipboard.writeText($("out").textContent).then(function(){
      var b=$("copy"); b.textContent="Copied"; setTimeout(function(){b.textContent="Copy text"},1800);
    });
  });
})();
</script>`;

/* ================================================================ 2. IEP PREP */
const iep = () => head({
  slug: "iep-meeting-prep",
  title: "Free IEP Meeting Prep Pack for Parents | ClearPath Pediatrics",
  desc: "Build a printable parent input statement, question list and meeting agenda before your child's IEP meeting. Free, private, takes about ten minutes.",
  keywords: ["IEP meeting preparation", "parent input statement IEP", "IEP questions to ask", "IEP meeting checklist", "504 plan preparation"],
  howto: {
    name: "How to prepare for an IEP meeting",
    time: "PT10M",
    steps: ["Note what is working and what is not", "List the accommodations you are requesting",
            "Add the medical context the school may not have", "Print your parent input statement and take it to the meeting"],
    faq: [
      { q: "Can I get the draft IEP before the meeting?", a: "Yes. Request it in writing, in advance. Asking in writing also creates a record that you did." },
      { q: "Does a parent input statement have to be formal?", a: "No. It has to be specific. Concrete examples of what happens on a bad day carry more weight than adjectives." },
      { q: "Is anything I write here sent anywhere?", a: "No. It stays in your browser. Nothing is transmitted to us or anyone else." },
      { q: "What if they agree to something verbally?", a: "Verbal agreements are not binding. Ask for it to be written into the document before the meeting ends." },
    ],
  },
}) + `
<section class="hero">
  <span class="pill">Free · Private · No signup</span>
  <h1>IEP meeting prep pack</h1>
  <p class="lede">Walking in with this changes the dynamic of the room. Ten minutes now produces a parent input statement, your questions, and an agenda — printable, and part of the official record if you send it ahead.</p>
  <div class="privacy">🔒 Everything stays in your browser. Nothing is sent to us.</div>
</section>

<div class="card">
  <h2>The basics</h2>
  <div class="grid g2">
    <div><label class="f" for="cn">Child's name</label><input id="cn" placeholder="Sam Smith"></div>
    <div><label class="f" for="gr">Grade / school</label><input id="gr" placeholder="2nd grade, Lincoln Elementary"></div>
    <div><label class="f" for="md">Meeting date</label><input id="md" type="date"></div>
    <div><label class="f" for="pn">Your name</label><input id="pn" placeholder="Jane Smith"></div>
  </div>
</div>

<div class="card">
  <h2>What you want them to understand</h2>
  <p class="sub">Be concrete. "Needs three prompts to start written work" lands; "struggles with focus" does not.</p>
  <div class="grid">
    <div><label class="f" for="work">What <em>is</em> working right now</label>
      <textarea id="work" placeholder="Naming what works protects it from being removed, and it makes the rest of your input easier to hear."></textarea></div>
    <div><label class="f" for="not">What is not working</label>
      <textarea id="not" placeholder="What a hard day looks like. Be specific about what you see at home afterwards."></textarea></div>
    <div><label class="f" for="ask">Accommodations or services you are requesting</label>
      <textarea id="ask" placeholder="One per line. e.g. Extended time on written assessments"></textarea></div>
    <div><label class="f" for="med">Medical context the school may not have</label>
      <textarea id="med" placeholder="Diagnoses relevant to school, medication timing, fatigue patterns, absence reasons, equipment. Only what the school needs to do their job."></textarea></div>
    <div><label class="f" for="abs">Absences this year, and why</label>
      <input id="abs" placeholder="e.g. 14 days, all medical — appointments and two admissions"></div>
  </div>
  <div class="row">
    <button class="btn" id="go">Build my prep pack</button>
    <button class="btn ghost" id="print" style="display:none">Print</button>
    <button class="btn ghost" id="copy" style="display:none">Copy text</button>
  </div>
</div>

<div id="out" class="out" style="display:none"></div>
${faqBlock([
  { q: "Can I see the draft IEP before the meeting?", a: "Yes — request it in writing, in advance. Reading it first changes the entire dynamic of the conversation." },
  { q: "Should I send this to the school beforehand?", a: "Usually yes. Sent in advance it becomes part of the record and frames the meeting before it starts." },
  { q: "They agreed to something but it is not in the document.", a: "Verbal agreements are not binding. Ask for it to be written in before the meeting ends." },
  { q: "Is anything I type here stored?", a: "No. It never leaves your browser." },
])}
${tail([
  { href: "/blog/prepare-pediatric-iep-meeting-organizing-guide/", label: "Guide: preparing for an IEP meeting" },
  { href: "/autism-care-coordination/", label: "Autism care coordination" },
  { href: "/tools/insurance-appeal-letter/", label: "Appeal letter builder" },
])}
<script>
(function(){
  var $=function(i){return document.getElementById(i)}, v=function(i){return ($(i).value||"").trim()};
  var lines=function(t){return t.split("\\n").map(function(x){return x.trim()}).filter(Boolean)};
  $("go").addEventListener("click",function(){
    var d=v("md")?new Date(v("md")+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"[meeting date]";
    var L=[];
    L.push("PARENT INPUT STATEMENT");
    L.push("Student: "+(v("cn")||"[Child]")+"    "+(v("gr")||""));
    L.push("IEP meeting: "+d);
    L.push("Submitted by: "+(v("pn")||"[Parent]")+"  (parent / legal guardian)");
    L.push("");L.push("----------------------------------------------------------");L.push("");
    L.push("WHAT IS WORKING");
    L.push(v("work")||"[What is going well — naming it protects it.]");L.push("");
    L.push("WHAT IS NOT WORKING");
    L.push(v("not")||"[What a hard day looks like, and what you see at home afterwards.]");L.push("");
    if(v("med")){ L.push("MEDICAL CONTEXT RELEVANT TO SCHOOL"); L.push(v("med")); L.push(""); }
    if(v("abs")){ L.push("ATTENDANCE"); L.push(v("abs")); L.push(""); }
    L.push("WHAT WE ARE REQUESTING");
    var a=lines(v("ask"));
    if(a.length) a.forEach(function(x,i){L.push("  "+(i+1)+". "+x)});
    else L.push("  [List each accommodation or service, one per line.]");
    L.push("");L.push("----------------------------------------------------------");L.push("");
    L.push("QUESTIONS I WILL ASK");
    ["How will each goal be measured, and how often will I get progress reports?",
     "What happens to instruction when my child is absent for medical reasons?",
     "Who on staff is responsible for the medical accommodations day to day?",
     "What training have staff had on my child's specific needs?",
     "What does the plan do if things get worse rather than better?",
     "How will the school and my child's medical team share information?"
    ].forEach(function(q,i){L.push("  "+(i+1)+". "+q)});
    L.push("");L.push("----------------------------------------------------------");L.push("");
    L.push("BEFORE THE MEETING ENDS, CHECK");
    ["Everything agreed is written into the document, not just discussed",
     "Each goal has a measure and a reporting frequency",
     "I have a copy or know exactly when one arrives",
     "I know who to contact if the plan is not being followed",
     "The next review date is set"
    ].forEach(function(x){L.push("  [ ] "+x)});
    L.push("");
    L.push("Note: anything agreed verbally is not binding. If it matters, it goes in the document before you leave.");
    $("out").textContent=L.join("\\n");
    $("out").style.display="block"; $("out").classList.add("print-show");
    $("print").style.display=""; $("copy").style.display="";
    $("out").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("print").addEventListener("click",function(){window.print()});
  $("copy").addEventListener("click",function(){navigator.clipboard.writeText($("out").textContent).then(function(){
    var b=$("copy");b.textContent="Copied";setTimeout(function(){b.textContent="Copy text"},1800)})});
})();
</script>`;

/* ========================================================= 3. MED SCHEDULE */
const meds = () => head({
  slug: "medication-schedule",
  title: "Free Pediatric Medication Schedule Builder | ClearPath Pediatrics",
  desc: "Turn your child's medication list into a printable daily schedule and a one-page summary for the care binder. Free, private, nothing leaves your browser.",
  keywords: ["pediatric medication schedule", "child medication chart printable", "medication list template", "medication schedule builder", "care binder medication list"],
  howto: {
    name: "How to build a pediatric medication schedule",
    time: "PT8M",
    steps: ["Add each medication exactly as prescribed", "Enter the times of day it is given",
            "Generate the daily schedule and one-page list", "Print one for the fridge and one for the care binder"],
    faq: [
      { q: "Does this tell me what to give my child?", a: "No, and it never will. It formats what your child's prescriber has already ordered. Every dose and timing comes from you." },
      { q: "Is my child's medication list sent anywhere?", a: "No. Everything runs in your browser and nothing is transmitted." },
      { q: "Why print two copies?", a: "One on the fridge for whoever is with your child, one in the care binder for appointments and the ER." },
      { q: "How often should this be updated?", a: "Any time a prescriber changes something, and worth a full check against the chart twice a year — lists drift as teams add and stop things without seeing each other's changes." },
    ],
  },
}) + `
<section class="hero">
  <span class="pill">Free · Private · No signup</span>
  <h1>Medication schedule builder</h1>
  <p class="lede">Turn a scattered medication list into one printable daily schedule and a one-page summary for the care binder — the page you hand someone at 2am instead of reciting from memory.</p>
  <div class="privacy">🔒 Everything stays in your browser. Nothing is sent to us.</div>
</section>

<div class="card" style="background:#fdf3e7;border-color:#f0dcc0">
  <p style="font-size:15px;color:#7a5418;margin:0">
    <strong>This tool formats, it does not advise.</strong> Enter exactly what your child's prescriber has ordered.
    ClearPath does not review, verify, or change anything you type, and nothing here is medical advice.
    Always confirm doses and timings with your prescriber or pharmacist.</p>
</div>

<div class="card">
  <h2>Your child</h2>
  <div class="grid g3">
    <div><label class="f" for="cn">Child's name</label><input id="cn" placeholder="Sam Smith"></div>
    <div><label class="f" for="dob">Date of birth</label><input id="dob" type="date"></div>
    <div><label class="f" for="wt">Weight <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="wt" placeholder="e.g. 14 kg"></div>
    <div><label class="f" for="alg">Allergies</label><input id="alg" placeholder="e.g. penicillin — or None known"></div>
    <div><label class="f" for="ph">Pharmacy</label><input id="ph" placeholder="Name and phone"></div>
    <div><label class="f" for="doc">Prescriber to call</label><input id="doc" placeholder="Dr. Chen — (555) 555-5555"></div>
  </div>
</div>

<div class="card">
  <h2>Medications</h2>
  <p class="sub">Add each one exactly as it appears on the label or in the plan.</p>
  <div id="list"></div>
  <button class="btn ghost" id="add" style="font-size:15px;padding:11px 22px">+ Add a medication</button>
  <div class="row">
    <button class="btn" id="go">Build my schedule</button>
    <button class="btn ghost" id="print" style="display:none">Print</button>
  </div>
</div>

<div id="out" class="out" style="display:none"></div>
${faqBlock([
  { q: "Does this tell me what to give my child?", a: "No. It formats what your prescriber has already ordered. Every dose and time comes from you, and we never review or change it." },
  { q: "Is my child's medication list stored anywhere?", a: "No. It runs entirely in your browser and nothing is transmitted." },
  { q: "Why print two copies?", a: "One for the fridge, one for the care binder. The binder copy is what an ER or a new specialist needs." },
  { q: "How often should I update it?", a: "Whenever a prescriber changes something, plus a full check against the chart twice a year. Lists drift when several teams prescribe." },
])}
${tail([
  { href: "/blog/organize-pediatric-medication-list/", label: "Guide: organising a medication list" },
  { href: "/blog/pediatric-care-binder-complex-child/", label: "Guide: building a care binder" },
  { href: "/complex-medical-needs-care-navigation/", label: "Complex medical needs support" },
])}
<script>
(function(){
  var $=function(i){return document.getElementById(i)}, v=function(i){return ($(i).value||"").trim()};
  var list=$("list"), n=0;
  function row(){
    n++; var d=document.createElement("div"); d.className="med"; d.dataset.i=n;
    d.innerHTML='<div class="grid g2">'+
      '<div><label class="f">Medication</label><input class="m-name" placeholder="e.g. Baclofen"></div>'+
      '<div><label class="f">Dose</label><input class="m-dose" placeholder="e.g. 5 mg"></div>'+
      '<div><label class="f">Times of day</label><input class="m-times" placeholder="e.g. 8am, 2pm, 8pm">'+
        '<p class="hint">Comma separated — these become the schedule rows.</p></div>'+
      '<div><label class="f">Route / notes</label><input class="m-note" placeholder="e.g. via G-tube, with food"></div>'+
      '<div><label class="f">Prescriber</label><input class="m-doc" placeholder="Dr. Chen"></div>'+
      '<div><label class="f">Purpose <span style="font-weight:400;color:var(--muted)">(as told to you)</span></label><input class="m-for" placeholder="e.g. muscle tone"></div>'+
      '</div><button type="button" class="del">Remove</button>';
    d.querySelector(".del").addEventListener("click",function(){d.remove()});
    list.appendChild(d);
  }
  $("add").addEventListener("click",row); row(); row();

  function norm(t){ // "8am" -> minutes, for sorting
    var m=String(t).trim().toLowerCase().match(/^(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?$/);
    if(!m) return 9999; var h=parseInt(m[1],10), mi=parseInt(m[2]||"0",10);
    if(m[3]==="pm"&&h<12)h+=12; if(m[3]==="am"&&h===12)h=0; return h*60+mi;
  }
  $("go").addEventListener("click",function(){
    var meds=[].slice.call(document.querySelectorAll(".med")).map(function(d){
      var g=function(c){return (d.querySelector(c).value||"").trim()};
      return {name:g(".m-name"),dose:g(".m-dose"),times:g(".m-times"),note:g(".m-note"),doc:g(".m-doc"),fr:g(".m-for")};
    }).filter(function(m){return m.name});
    if(!meds.length){ alert("Add at least one medication first."); return; }

    var slots={};
    meds.forEach(function(m){
      (m.times?m.times.split(","):["(time not set)"]).forEach(function(t){
        t=t.trim()||"(time not set)"; (slots[t]=slots[t]||[]).push(m);
      });
    });
    var keys=Object.keys(slots).sort(function(a,b){return norm(a)-norm(b)});
    var esc=function(s){return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})};

    var h='<h3>'+esc(v("cn")||"Child")+" — daily medication schedule</h3>";
    h+='<p style="font-size:13.5px;color:#5c6b7f;margin-bottom:4px">'+
       (v("dob")?"DOB "+esc(v("dob"))+"  ·  ":"")+(v("wt")?"Weight "+esc(v("wt"))+"  ·  ":"")+
       "Allergies: "+esc(v("alg")||"not recorded")+"</p>";
    h+='<p style="font-size:13.5px;color:#5c6b7f;margin-bottom:16px">'+
       (v("doc")?"Prescriber: "+esc(v("doc"))+"  ·  ":"")+(v("ph")?"Pharmacy: "+esc(v("ph")):"")+"</p>";
    h+='<table class="sched"><thead><tr><th>Time</th><th>Give</th></tr></thead><tbody>';
    keys.forEach(function(k){
      h+='<tr><td class="t">'+esc(k)+"</td><td>"+slots[k].map(function(m){
        return "<strong>"+esc(m.name)+"</strong> "+esc(m.dose)+(m.note?" — "+esc(m.note):"");
      }).join("<br>")+"</td></tr>";
    });
    h+="</tbody></table>";
    h+='<h3 style="margin-top:26px">Full medication list</h3><table class="sched"><thead><tr>'+
       "<th>Medication</th><th>Dose</th><th>When</th><th>For</th><th>Prescriber</th></tr></thead><tbody>";
    meds.forEach(function(m){
      h+="<tr><td><strong>"+esc(m.name)+"</strong>"+(m.note?'<br><span style="color:#5c6b7f;font-size:12.5px">'+esc(m.note)+"</span>":"")+
         "</td><td>"+esc(m.dose)+"</td><td>"+esc(m.times)+"</td><td>"+esc(m.fr)+"</td><td>"+esc(m.doc)+"</td></tr>";
    });
    h+="</tbody></table>";
    h+='<p style="font-size:12px;color:#5c6b7f;margin-top:18px">Prepared '+new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+
       ". Confirm all doses and timings with your prescriber or pharmacist. ClearPath Pediatrics does not review or verify this list.</p>";
    $("out").innerHTML=h; $("out").style.display="block"; $("out").classList.add("print-show");
    $("out").style.whiteSpace="normal";
    $("print").style.display="";
    $("out").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("print").addEventListener("click",function(){window.print()});
})();
</script>`;

/* ------------------------------------------------------------------- index */
const TOOLS = [
  { slug: "insurance-appeal-letter", build: appeal, name: "Insurance appeal letter builder",
    blurb: "Build a complete, properly formatted appeal for a denied pediatric claim — and find out the date it has to be sent by." },
  { slug: "iep-meeting-prep", build: iep, name: "IEP meeting prep pack",
    blurb: "A parent input statement, your questions and a pre-meeting checklist. Printable, and part of the record if you send it ahead." },
  { slug: "medication-schedule", build: meds, name: "Medication schedule builder",
    blurb: "Turn a scattered medication list into a daily schedule and a one-page summary for the care binder." },
];

const index = () => head({
  slug: "", title: "Free Tools for Parents of Medically Complex Children | ClearPath Pediatrics",
  desc: "Free, private tools built by pediatric RNs: an insurance appeal letter builder, an IEP meeting prep pack, and a medication schedule builder. Nothing leaves your browser.",
  keywords: ["free tools parents medically complex children", "pediatric insurance appeal tool", "IEP prep tool", "medication schedule tool"],
  howto: { name: "Free parent tools", time: "PT10M",
    steps: ["Choose the tool that matches what you are dealing with", "Fill it in", "Print or copy what it produces"],
    faq: [{ q: "Are these really free?", a: "Yes. No signup, no card, no email required." },
          { q: "Is my information private?", a: "Completely. Every tool runs in your browser and nothing is transmitted to us." }] },
}).replace("/tools//", "/tools/") + `
<section class="hero">
  <span class="pill">Free · Private · No signup</span>
  <h1>Free tools for families managing complex care</h1>
  <p class="lede">Built by pediatric RNs for the paperwork nobody warns you about. No signup, no card, and nothing you type ever leaves your browser.</p>
</section>
${TOOLS.map(t => `
<div class="card">
  <h2>${t.name}</h2>
  <p class="sub" style="margin-bottom:16px">${t.blurb}</p>
  <a class="btn" href="/tools/${t.slug}/">Open the tool →</a>
</div>`).join("")}
${tail([
  { href: "/free-care-roadmap/", label: "Get a free care plan" },
  { href: "/pediatric-care-navigation-guide/", label: "The care navigation guide" },
  { href: "/blog/", label: "All guides" },
])}`;

// ---- run ----
let n = 0;
for (const t of TOOLS) {
  const dir = path.join(ROOT, "tools", t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), t.build());
  console.log(`  ✓ /tools/${t.slug}`); n++;
}
fs.mkdirSync(path.join(ROOT, "tools"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "tools", "index.html"), index());
console.log("  ✓ /tools"); n++;
console.log(`[tools] built ${n} pages.`);
