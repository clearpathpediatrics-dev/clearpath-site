/**
 * ClearPath Pediatrics — topic hubs, and which hub every post belongs to.
 * -------------------------------------------------------------
 * Until these existed, no article linked to any other article, and 177 of 225
 * posts were reachable only from the blog index and the sitemap. To Google that
 * reads as 225 unrelated pages rather than depth on a handful of topics.
 *
 * Each hub is a real page at /blog/topics/<slug>/ listing every post on its
 * topic, and each post links back to its hub and to related posts in it.
 *
 * The same mapping drives the Free Care Roadmap card: `need` preselects the
 * matching answer to question 4 of the funnel, and `card` is the offer shown
 * on that topic's articles.
 */

export const HUBS = [
  {
    key: "denials-auth",
    slug: "insurance-denials-appeals",
    name: "Prior Authorizations, Denials & Appeals",
    short: "Denials & appeals",
    need: "insurance",
    tool: "appeal",
    intro:
      "A denial letter is not the end of the conversation. Most pediatric denials are decided on paperwork: a missing code, an expired authorization, a letter of medical necessity that never said the thing the policy needed it to say. These guides walk through the administrative side, in order: reading the denial, requesting the exact policy language, building the appeal, asking for a peer-to-peer review, and escalating to an external review or your state insurance department when the internal process runs out. None of it replaces your child's care team. It is about making sure the decision gets made on a complete file.",
    card: {
      k: "Free · built from your answers",
      h: "Fighting a denial or waiting on an approval?",
      p: "Answer six quick questions and we email you a plan for your child's situation: the first call to make, the next three steps in order, and what to say on each one.",
    },
  },
  {
    key: "billing-eob",
    slug: "medical-bills-eobs",
    name: "Medical Bills, EOBs & What Care Costs",
    short: "Bills & EOBs",
    need: "insurance",
    tool: "appeal",
    intro:
      "Pediatric bills are hard to read on purpose and easy to overpay. The explanation of benefits, the provider's bill and what you actually owe are three different documents, and they often disagree. These guides cover how to read each one line by line, how deductibles and out-of-pocket maximums really apply to a child with ongoing care, when a bill is likely an error, how to ask for an itemized statement or financial assistance, and what the No Surprises Act changes. The goal is simple: never pay a bill you have not checked.",
    card: {
      k: "Free · built from your answers",
      h: "Bills and insurance piling up?",
      p: "Answer six quick questions and we email you a plan for sorting it out: which document to check first, the calls worth making, and what to ask for on each.",
    },
  },
  {
    key: "second-opinion",
    slug: "second-opinions-specialist-referrals",
    name: "Second Opinions & Specialist Referrals",
    short: "Second opinions & referrals",
    need: "advocate",
    tool: null,
    intro:
      "Asking for a second opinion, or chasing a referral that has gone quiet, is one of the most common reasons parents feel stuck. These guides cover the logistics: how to ask without straining the relationship with your child's current doctor, what records to send ahead and how to get them released, whether insurance will cover it, and how to find out exactly where a stalled referral is sitting. Medical judgment stays with your child's providers. What you control is how complete, organized and timely the request is.",
    card: {
      k: "Free · built from your answers",
      h: "Stuck waiting on a referral or a second opinion?",
      p: "Answer six quick questions and we email you a plan: who to call first, what to send ahead, and how to keep it moving when it stalls.",
    },
  },
  {
    key: "school-iep",
    slug: "school-iep-504",
    name: "School, IEP & 504 Plans",
    short: "School, IEP & 504",
    need: "school-iep",
    tool: "iep",
    intro:
      "When a child has complex medical needs, school becomes another care setting, and the IEP or 504 plan is how those needs get written down. These guides cover the process side: requesting a draft before the meeting, writing a parent input statement, bringing your child's medical team into the conversation, getting accommodations into the written plan, and what to do when a plan is not being followed. They are written for parents walking into those meetings for the first time, and for parents who have been to twenty.",
    card: {
      k: "Free · built from your answers",
      h: "Getting ready for an IEP or 504 meeting?",
      p: "Answer six quick questions and we email you a plan for the meeting: what to request beforehand, what to bring, and the questions worth asking in the room.",
    },
  },
  {
    key: "discharge",
    slug: "hospital-discharge-coming-home",
    name: "Hospital Discharge & Coming Home",
    short: "Discharge & coming home",
    need: "discharge",
    tool: "meds",
    intro:
      "The first weeks after a hospital or NICU stay are when follow-ups get missed, prescriptions get held up and equipment arrives late, usually because everyone assumed someone else owned the next step. These guides cover what to ask before discharge, what a discharge summary should contain, who schedules each follow-up and how to confirm it happened, setting up home nursing and supplies, and building a single page of who-to-call-when for your home. They are organizational, not clinical. Your child's discharge instructions always come first.",
    card: {
      k: "Free · built from your answers",
      h: "Bringing your child home from the hospital?",
      p: "Answer six quick questions and we email you a first-weeks-home plan: the follow-ups to confirm, who owns each one, and what to have ready.",
    },
  },
  {
    key: "organising",
    slug: "medical-paperwork-organization",
    name: "Medical Paperwork & Organization",
    short: "Paperwork & organization",
    need: "organize",
    tool: "meds",
    intro:
      "A child with a long medical history generates a lot of paper: visit summaries, medication lists from several prescribers, referrals, records requests, equipment orders. These guides show how to turn that into something you can actually use, including a care binder that holds up in an emergency room, a one-page medical summary for new providers and caregivers, a medication list everyone works from, and a records system both parents can reach. A little structure saves hours of repeating your child's story.",
    card: {
      k: "Free · built from your answers",
      h: "Drowning in appointments and paperwork?",
      p: "Answer six quick questions and we email you a plan to get it all organized: what to gather first, how to set it up, and what to keep where.",
    },
  },
  {
    key: "coordination",
    slug: "care-team-coordination",
    name: "Care Team Coordination",
    short: "Care team coordination",
    need: "advocate",
    tool: null,
    intro:
      "When several specialists are involved, the hardest question is often the simplest: who owns the next step? These guides cover the coordination work that falls between appointments, such as getting two specialists to share information, requesting a care conference, naming a lead clinician, keeping one medication list across every team, and making sure a test result never just disappears. They also explain how a nurse navigator, a case manager and a social worker differ, so you know who to ask for what.",
    card: {
      k: "Free · built from your answers",
      h: "Too many specialists, no one coordinating?",
      p: "Answer six quick questions and we email you a plan: who to ask to take the lead, what to share between teams, and how to keep everyone on the same page.",
    },
  },
  {
    key: "well-child",
    slug: "well-child-visits",
    name: "Well-Child Visits & Developmental Checks",
    short: "Well-child visits",
    need: "appts",
    tool: null,
    intro:
      "Well-child visits are short, and for a child who also sees specialists, they are easy to lose in the shuffle. These guides cover how to prepare so a fifteen-minute appointment is enough: what to write down beforehand, what to bring when other providers are involved, how to raise a developmental concern so it gets documented, how to ask for a referral, and how to keep visits on schedule during a complicated year. They explain what happens at the visit; questions about your child's development belong with your pediatrician.",
    card: {
      k: "Free · built from your answers",
      h: "Want to get more out of every appointment?",
      p: "Answer six quick questions and we email you a plan: what to prepare before each visit, what to bring, and how to follow up afterwards.",
    },
  },
  {
    key: "home-dme",
    slug: "home-nursing-dme-supplies",
    name: "Home Nursing, Equipment & Supplies",
    short: "Home nursing & equipment",
    need: "organize",
    tool: "meds",
    intro:
      "Home nursing hours, durable medical equipment and monthly supplies each come with their own approvals, vendors and reorder schedules, and a gap in any one of them lands on the family. These guides cover how private duty nursing hours get approved, what to do when shifts go unfilled, how to reorder supplies without running short, what to do when a supplier stops responding or equipment arrives wrong, and how to document a need for an insurance request. Equipment questions about your child's care belong with their prescribing provider.",
    card: {
      k: "Free · built from your answers",
      h: "Juggling nursing shifts, equipment and supplies?",
      p: "Answer six quick questions and we email you a plan: what to track, who to call when something lapses, and how to stay ahead of reorders.",
    },
  },
];

export const HUB_BY_KEY = Object.fromEntries(HUBS.map((h) => [h.key, h]));
export const hubUrl = (h) => `/blog/topics/${h.slug}/`;

/**
 * The hub a post belongs to. Posts written since clusters existed carry a
 * clusterKey; the 48 older ones only have one of four broad day-of-week topics,
 * so they are classified from their title and tags instead.
 */
export function hubFor(post) {
  if (post.clusterKey && HUB_BY_KEY[post.clusterKey]) return HUB_BY_KEY[post.clusterKey];
  const t = `${post.title} ${(post.tags || []).join(" ")}`.toLowerCase();
  const rules = [
    ["denials-auth", /(deni|appeal|prior auth|authoriz|authoris|peer-to-peer|medical necessity)/],
    ["billing-eob", /(eob|explanation of benefits|bill|deductible|out-of-pocket|copay|cost|financial assistance|surprise)/],
    ["school-iep", /(iep|504|school|teacher|classroom|special ed)/],
    ["discharge", /(discharge|nicu|hospital stay|coming home|readmission)/],
    ["second-opinion", /(second opinion|referral|specialist)/],
    ["home-dme", /(home nursing|private duty|dme|equipment|supplies|wheelchair|feeding pump)/],
    ["well-child", /(well-child|well child|milestone|developmental|checkup|check-up|screening)/],
    ["organising", /(organi[sz]|binder|paperwork|records|medication list|summary|tracking|track)/],
    ["denials-auth", /(insurance|coverage|medicaid|claim)/],
  ];
  for (const [key, re] of rules) if (re.test(t)) return HUB_BY_KEY[key];
  return HUB_BY_KEY["coordination"];
}

const STOP = new Set(("a an the to of for and or in on your you how what when why is are with do does it its " +
  "that this from at by be as can after before child childs kids kid pediatric parents parent guide " +
  "step steps without actually really").split(" "));
const tokens = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
  .filter((w) => w.length > 2 && !STOP.has(w)));
const jaccard = (a, b) => { let n = 0; a.forEach((w) => b.has(w) && n++); return n / (a.size + b.size - n || 1); };

/**
 * Related posts for one article: same hub, closest by title overlap, newest
 * first on ties. Near-identical titles are skipped so a reader is never sent to
 * what looks like the page they are already on.
 */
export function relatedPosts(post, posts, n = 4) {
  const hub = hubFor(post);
  const mine = tokens(post.title);
  const seen = [];
  return posts
    .filter((p) => p.slug !== post.slug && hubFor(p) === hub)
    .map((p) => ({ p, k: tokens(p.title), s: jaccard(mine, tokens(p.title)) }))
    .filter((x) => x.s < 0.7)
    .sort((a, b) => b.s - a.s || (a.p.iso < b.p.iso ? 1 : -1))
    .filter((x) => {
      if (seen.some((k) => jaccard(k, x.k) >= 0.7)) return false;
      seen.push(x.k); return true;
    })
    .slice(0, n)
    .map((x) => x.p);
}
