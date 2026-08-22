/**
 * ClearPath Pediatrics — lead triage.
 * -------------------------------------------------------------
 * Ranks families by how much a care navigator would actually change their
 * week, and how soon. This is NOT clinical triage and says nothing about the
 * child's medical acuity — it is about coordination load and timing.
 *
 * Four signals, multiplied so a zero on any one pulls the score down:
 *
 *   LOAD      How many moving parts the parent is holding. Specialist count is
 *             the single best proxy for coordination burden.
 *   STRAIN    How the parent says they are coping. Self-reported overwhelm is
 *             the strongest predictor that someone will actually accept help.
 *   TRIGGER   Something changed recently. New diagnosis, discharge, a move, a
 *             denial. Families act during transitions and drift the rest of
 *             the time.
 *   URGENCY   What they told us they need, and how soon.
 *
 * Score 0-100. NOW means call today.
 */

export const BANDS = { NOW: 74, SOON: 56, NURTURE: 36 };

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/* ---- answer → weight maps. Keys must match the form's option values. ---- */

export const PROVIDERS = {
  "1":      { w: 0.25, label: "Just our pediatrician" },
  "2-3":    { w: 0.62, label: "2–3 providers" },
  "4-6":    { w: 0.88, label: "4–6 providers" },
  "7+":     { w: 1.00, label: "7 or more providers" },
};

export const COPING = {
  "steady":      { w: 0.20, label: "Managing okay" },
  "stretched":   { w: 0.60, label: "Stretched thin" },
  "overwhelmed": { w: 0.90, label: "Often overwhelmed" },
  "drowning":    { w: 1.00, label: "Barely keeping up" },
};

export const TRIGGERS = {
  "new-diagnosis":   { w: 1.00, label: "A new diagnosis" },
  "discharge":       { w: 1.00, label: "Recent hospital discharge or NICU transition" },
  "denial":          { w: 0.92, label: "An insurance denial or coverage problem" },
  "new-therapy":     { w: 0.72, label: "Starting new therapies or services" },
  "school":          { w: 0.70, label: "A school or IEP situation" },
  "provider-change": { w: 0.68, label: "Changing providers or moving" },
  "nothing":         { w: 0.30, label: "Nothing major recently" },
};

export const NEEDS = {
  "organize":   { label: "Getting organized",              guide: "pediatric-care-binder-complex-child" },
  "appts":      { label: "Preparing for appointments",     guide: "prepare-pediatric-specialist-referral-checklist" },
  "insurance":  { label: "Insurance, billing and denials", guide: "appeal-denied-pediatric-insurance-claim" },
  "advocate":   { label: "Someone knowledgeable in our corner", guide: "pediatric-care-team-roster-complex-care" },
  "school-iep": { label: "School and IEP support",         guide: "prepare-pediatric-iep-meeting-organizing-guide" },
  "discharge":  { label: "Coming home from the hospital",  guide: "pediatric-care-binder-complex-child" },
};

export const TIMING = {
  "now":      { w: 1.00, label: "We need help now" },
  "weeks":    { w: 0.72, label: "In the next few weeks" },
  "planning": { w: 0.42, label: "Planning ahead" },
  "looking":  { w: 0.25, label: "Just looking around" },
};

/**
 * @param {object} a  raw form answers
 * @returns {{score,band,factors,drivers,flags,priority,why}}
 */
export function triage(a = {}) {
  const load    = (PROVIDERS[a.providers] || PROVIDERS["1"]).w;
  const strain  = (COPING[a.coping]       || COPING.steady).w;
  const trigger = (TRIGGERS[a.trigger]    || TRIGGERS.nothing).w;
  const urgency = (TIMING[a.timing]       || TIMING.looking).w;

  const drivers = [], flags = [];

  if (load >= 0.85)    drivers.push(`${(PROVIDERS[a.providers] || {}).label} — that is a lot of separate plans to reconcile alone`);
  if (strain >= 0.90)  drivers.push("Told us they are barely keeping up. This family will accept help if it is offered plainly");
  else if (strain >= 0.60) drivers.push("Stretched thin but still coping — help lands best framed as taking work off their plate");
  if (trigger >= 0.92) drivers.push(`${(TRIGGERS[a.trigger] || {}).label} — families act during transitions, and this window closes`);
  if (urgency >= 1.0)  drivers.push("Said they need help now");

  if (urgency <= 0.25) flags.push("Just looking — do not chase. Let the sequence do the work");
  if (load <= 0.25 && strain <= 0.20) flags.push("Single provider and coping well; navigation may genuinely not be needed yet");
  if (a.state && a.state !== "AZ") flags.push(`Outside Arizona (${a.state}) — remote works, but mention it early so they are not wondering`);

  const factors = { load, strain, trigger, urgency };
  const weights = { load: 0.28, strain: 0.30, trigger: 0.22, urgency: 0.20 };
  const logSum = Object.keys(weights)
    .reduce((s, k) => s + weights[k] * Math.log(Math.max(0.05, factors[k])), 0);
  const score = Math.round(clamp01(Math.exp(logSum)) * 100);

  const band = score >= BANDS.NOW ? "NOW"
             : score >= BANDS.SOON ? "SOON"
             : score >= BANDS.NURTURE ? "NURTURE" : "COLD";

  const priority = {
    NOW:     { action: "Call today",        why: "High coordination load, a parent who says they are struggling, and a live trigger. This is the moment." },
    SOON:    { action: "Call within 2 days",why: "Real need and real load. Usually one factor is soft — check the flags before dialling." },
    NURTURE: { action: "Let the sequence run", why: "Genuine interest, no urgency yet. Chasing costs more than waiting." },
    COLD:    { action: "No outreach",       why: "Researching, not buying. The plan they just received is the right amount of help for now." },
  }[band];

  return { score, band, factors, drivers, flags, priority: priority.action, why: priority.why };
}

/** The one thing this family should do first, based on what they told us. */
export function firstMove(a = {}) {
  const need = NEEDS[a.need] || NEEDS.organize;
  const map = {
    organize:  { step: "Build one care binder before anything else",
                 detail: "Every provider, every medication, every device, and the current plan — in one place you can hand to anyone. It is the single change that reduces the most repeated work." },
    appts:     { step: "Write your questions down before the next appointment",
                 detail: "Three questions, in priority order, on paper. Appointments run short and the thing you most needed to ask is usually the thing that gets skipped." },
    insurance: { step: "Request the written denial reason before you appeal",
                 detail: "Not the summary — the actual denial code and policy language. Almost every successful appeal starts by arguing against the specific reason given, and you cannot do that until you have it in writing." },
    advocate:  { step: "Build a one-page care team roster",
                 detail: "Every provider, what they are responsible for, and how to reach them directly. Most coordination failures happen in the gaps between specialists who assume someone else owns the problem." },
    "school-iep": { step: "Request the draft IEP in writing before the meeting",
                 detail: "You are entitled to review it in advance. Walking into that meeting having already read it changes the entire dynamic of the conversation." },
    discharge: { step: "Get the discharge summary and the follow-up list in writing",
                 detail: "Before you leave, or the same week if you already have. Discharge instructions given verbally at a stressful moment are the most commonly lost piece of information in pediatric care." },
  };
  return { ...map[a.need] || map.organize, need: need.label, guide: need.guide };
}
