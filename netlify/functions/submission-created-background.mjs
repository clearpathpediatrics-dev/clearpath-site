/**
 * Fires on every roadmap request from /free-care-roadmap/.
 *
 *   1. Triage the family (coordination load, strain, trigger, urgency)
 *   2. Build their personalised Care Navigation Starter Plan PDF
 *   3. Email it to them within minutes, with the free RN call as the next step
 *   4. Alert Dean, ranked, with who to call first and why
 *   5. Store the lead and queue the follow-up sequence
 *
 * Background function: 15-minute ceiling, so PDF generation is safe here.
 * If the PDF fails for any reason the email still goes out with the plan
 * inline — a broken attachment must never cost us the lead.
 */
import { triage, NEEDS } from "../lib/triage.mjs";
import { buildPlan } from "../lib/plan-content.mjs";
import { buildStarterPlan } from "../lib/starter-plan.mjs";
import {
  SITE, CAL, PHONE, ALERT_TO, leadStore, emailKey, sendEmail, layout, ctaBand,
  unsubUrlFor, toText, esc, isSuppressed,
} from "../lib/shared.mjs";

const phoenixDate = () => new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Phoenix", day: "numeric", month: "long", year: "numeric",
}).format(new Date());

export default async function handler(req) {
  let payload;
  try { const b = await req.json(); payload = b?.payload ?? b; }
  catch { return new Response("bad payload", { status: 400 }); }

  const d = payload?.data || {};
  if (payload?.form_name && payload.form_name !== "care-roadmap") {
    return new Response("ignored", { status: 200 });
  }
  if (d["bot-field"]) return new Response("bot", { status: 200 });

  const lead = {
    parentName: (d.parent_name || "").trim(),
    childName:  (d.child_name || "").trim(),
    email:      emailKey(d.email),
    phone:      (d.phone || "").trim(),
    city:       (d.city || "").trim(),
    state:      (d.state || "").trim(),
    providers:  d.providers, coping: d.coping, trigger: d.trigger,
    need:       d.need, timing: d.timing,
    notes:      (d.notes || "").trim(),
    submittedAt: new Date().toISOString(),
  };
  if (!lead.email) return new Response("no email", { status: 200 });

  const t = triage(lead);
  const plan = buildPlan(lead);
  const first = (lead.parentName || "").split(/\s+/)[0] || "there";
  const child = lead.childName || "your child";

  // ---- personalised PDF (never fatal) ------------------------------------
  let attachments, pdfNote = "attached to this email";
  try {
    const pdf = await buildStarterPlan({
      ...lead, ...plan, dateLabel: phoenixDate(),
    });
    attachments = [{
      filename: `ClearPath-Starter-Plan-${(lead.parentName || "family").split(/\s+/)[0]}.pdf`,
      content: pdf.toString("base64"),
    }];
  } catch (e) {
    console.error("[plan-pdf]", e);
    pdfNote = "below";
  }

  const record = {
    ...lead, score: t.score, band: t.band, priority: t.priority, why: t.why,
    drivers: t.drivers, flags: t.flags,
    firstMove: plan.firstMove.step, needLabel: (NEEDS[lead.need] || {}).label,
    pdfAttached: Boolean(attachments),
    source: "inbound:care-roadmap", stage: 0,
    nextTouchAt: new Date(Date.now() + 2 * 864e5).toISOString(),
    closed: false,
    history: [{ at: lead.submittedAt, event: "requested-roadmap" }],
  };
  try { await leadStore().set(lead.email, JSON.stringify(record)); } catch {}

  // ---- the family's email -------------------------------------------------
  if (!(await isSuppressed(lead.email))) {
    const body = `
<h1>${esc(first)}, here is your starter plan</h1>
<p>Thank you for telling us where things stand. Your personalised Care Navigation Starter Plan is ${esc(pdfNote)} — it is yours to keep, and there is nothing you need to do to receive it.</p>
<p>${esc(plan.situationLine)}</p>
<h2>Start here</h2>
<div class="step"><b>${esc(plan.firstMove.step)}</b>${esc(plan.firstMove.detail)}</div>
<h2>Then, in this order</h2>
<ul>${plan.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
<h2>Worth knowing</h2>
<ul>${plan.watchouts.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
<p>If it would help to have someone walk through this with you, the first thirty minutes with one of our RNs is free. No pitch — if we are not the right fit for ${esc(child)}, we will say so.</p>
<p>And if a call is too much this week, just reply to this email. A real person reads it.</p>
<p class="sig">— The ClearPath Pediatrics team<br>${PHONE}</p>`;

    const html = layout({
      body, unsubUrl: unsubUrlFor(lead.email),
      preheader: plan.firstMove.step,
      band: ctaBand("Thirty minutes with an RN, free. No pitch, no commitment.", CAL, "Book my free call"),
    });
    const r = await sendEmail({
      to: lead.email, subject: `${first} — your care navigation starter plan`,
      html, text: toText(html), replyTo: ALERT_TO, attachments, tag: "roadmap-delivery",
    });
    record.history.push({ at: new Date().toISOString(), event: r.sent ? "plan-sent" : `plan-failed:${r.error}` });
  }

  // ---- Dean's alert -------------------------------------------------------
  const list = (label, items) => items.length
    ? `<p style="margin:0 0 6px"><strong>${label}</strong></p><ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";

  const alertBody = `
<h1>${t.band} · ${t.score}/100 — ${esc(lead.parentName || lead.email)}</h1>
<div class="step"><b>${esc(t.priority)}</b>${esc(t.why)}</div>
<p><strong>Child:</strong> ${esc(child)}<br>
<strong>Where:</strong> ${esc([lead.city, lead.state].filter(Boolean).join(", ") || "not given")}<br>
<strong>Email:</strong> ${esc(lead.email)}${lead.phone ? `<br><strong>Phone:</strong> ${esc(lead.phone)}` : ""}<br>
<strong>Wants help with:</strong> ${esc((NEEDS[lead.need] || {}).label || "—")}</p>
${lead.notes ? `<h2>In their words</h2><p style="font-style:italic">${esc(lead.notes)}</p>` : ""}
${list("Why they rank here", t.drivers)}
${list("Before you call", t.flags)}
<p style="font-size:14px;color:#7a6a55">Their starter plan${record.pdfAttached ? " (with PDF)" : ""} has already gone out. Follow-up 1 is queued for two days from now and stops the moment they book or unsubscribe.</p>`;

  await sendEmail({
    to: ALERT_TO,
    subject: `[${t.band} ${t.score}] ${lead.parentName || "New family"} — ${(NEEDS[lead.need] || {}).label || "roadmap request"}`,
    html: layout({ body: alertBody }), text: toText(alertBody),
    replyTo: lead.email, tag: "internal-alert",
  });

  try { await leadStore().set(lead.email, JSON.stringify(record)); } catch {}
  return new Response("ok", { status: 200 });
}
