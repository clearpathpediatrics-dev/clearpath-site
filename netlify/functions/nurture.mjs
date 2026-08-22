/**
 * Follow-up for families who requested a starter plan.
 * Four touches over three weeks, then silence. Stops instantly on unsubscribe.
 *
 * Tone rule: these people are exhausted parents, not prospects. Every touch
 * must be useful on its own even if they never reply.
 */
import { CAL, SITE, PHONE, ALERT_TO, leadStore, sendEmail, layout, ctaBand,
         unsubUrlFor, toText, esc, isSuppressed } from "../lib/shared.mjs";
import { NEEDS } from "../lib/triage.mjs";

export const config = { schedule: "0 16 * * *" }; // 9am Phoenix

const GAPS = [2, 4, 7, 10]; // days to next touch after each stage

const TOUCHES = [
  (l) => ({
    subject: `${l.first}, did the first step land?`,
    body: `
<p>${esc(l.first)} — checking in on the plan we sent.</p>
<p>The one thing worth doing first was this:</p>
<div class="step"><b>${esc(l.firstMove || "Build one care binder")}</b>Most families tell us this is the step that stops the repeating — the same history, explained again, to another new person.</div>
<p>If you have hit a wall on it, reply and tell me where. I will send you the specific next move, no charge and no call required.</p>
<p class="sig">— ClearPath Pediatrics</p>`,
  }),
  (l) => ({
    subject: `The question most families forget to ask`,
    body: `
<p>No ask in this one.</p>
<p>When several specialists are involved, the failure is almost never any single one of them. It is that each assumes someone else owns the follow-up — the referral, the authorisation, the result nobody chased.</p>
<p>So the question worth asking out loud at your next appointment is simply: <strong>who is responsible for this between now and the next visit?</strong></p>
<p>If the answer is unclear, that is the gap. And that gap is the entire reason care navigation exists.</p>
<p><a href="${SITE}/pediatric-care-navigation-guide">The full guide is here</a> if it is useful — free, no signup.</p>
<p class="sig">— ClearPath Pediatrics</p>`,
  }),
  (l) => ({
    subject: `What the free call actually is`,
    body: `
<p>${esc(l.first)} — some families hesitate to book because they assume it is a sales call. It is not, so here is exactly what happens.</p>
<ul>
  <li>Thirty minutes with a registered nurse, on the phone or video</li>
  <li>You describe what is going on. We ask questions and take notes</li>
  <li>You leave with a written roadmap — the real one, built for your situation</li>
  <li>If we are not the right fit, we tell you, and you keep the roadmap anyway</li>
</ul>
<p>No card, no commitment, no follow-up unless you ask for it.</p>
<p class="sig">— ClearPath Pediatrics<br>${PHONE}</p>`,
  }),
  (l) => ({
    subject: `Closing the loop`,
    body: `
<p>${esc(l.first)} — last note from me, I am not going to keep appearing in your inbox.</p>
<p>Your starter plan is yours to keep, and everything on the site stays free whether or not we ever speak.</p>
<p>If the timing is just wrong, reply with a month and I will get out of the way until then. And if things get harder before that, the number below reaches a real person.</p>
<p class="sig">— ClearPath Pediatrics<br>${PHONE}</p>`,
  }),
];

export default async function handler() {
  const store = leadStore();
  const now = Date.now();
  const sum = { checked: 0, sent: 0, skipped: 0, finished: 0, errors: [] };

  let list;
  try { list = await store.list(); }
  catch (e) { return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 }); }

  for (const { key } of list.blobs || []) {
    sum.checked++;
    let l;
    try { l = JSON.parse(await store.get(key)); } catch { sum.errors.push(`unreadable:${key}`); continue; }
    if (l.closed || l.stage >= TOUCHES.length) { sum.skipped++; continue; }
    if (!l.nextTouchAt || Date.parse(l.nextTouchAt) > now) { sum.skipped++; continue; }
    if (await isSuppressed(l.email)) {
      l.closed = true; l.closedReason = "suppressed";
      await store.set(key, JSON.stringify(l)); sum.skipped++; continue;
    }
    // COLD families researching quietly get the useful touches, not the pitch.
    if (l.band === "COLD" && l.stage >= 2) {
      l.closed = true; l.closedReason = "cold-short-sequence";
      await store.set(key, JSON.stringify(l)); sum.finished++; continue;
    }

    const view = { ...l, first: (l.parentName || "").split(/\s+/)[0] || "there" };
    const touch = TOUCHES[l.stage](view);
    const html = layout({
      body: touch.body, unsubUrl: unsubUrlFor(l.email), preheader: touch.subject,
      band: l.stage >= 1 ? ctaBand("Thirty minutes with an RN, free.", CAL, "Book my free call") : "",
    });
    const r = await sendEmail({ to: l.email, subject: touch.subject, html,
      text: toText(html), replyTo: ALERT_TO, tag: `nurture-${l.stage + 1}` });

    // Advance regardless of send result — a transient failure must not put the
    // family into a loop that re-sends every single day.
    l.stage += 1;
    (l.history = l.history || []).push({ at: new Date().toISOString(),
      event: r.sent ? `touch-${l.stage}` : `touch-${l.stage}-failed:${r.error}` });
    if (l.stage >= TOUCHES.length) { l.closed = true; l.closedReason = "sequence-complete"; l.nextTouchAt = null; sum.finished++; }
    else l.nextTouchAt = new Date(now + GAPS[l.stage] * 864e5).toISOString();
    await store.set(key, JSON.stringify(l));
    r.sent ? sum.sent++ : sum.errors.push(`${l.email}:${r.error}`);
  }
  console.log("[nurture]", JSON.stringify(sum));
  return Response.json({ ok: true, ...sum });
}
