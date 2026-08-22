/**
 * ClearPath Pediatrics — topic model for the blog engine.
 * -------------------------------------------------------------
 * WHY THESE TOPICS AND NOT OTHERS
 *
 * Pediatric *medical* content is YMYL — Google's highest scrutiny tier. A young
 * domain will not outrank CHOP, Mayo, Nationwide Children's or HealthyChildren
 * on "signs of dehydration in a toddler", and effort spent there is wasted.
 *
 * What those institutions barely cover is the *administrative* reality of
 * raising a medically complex child: prior authorisations, denials, referral
 * logistics, discharge paperwork, IEP process, DME suppliers, who owns the
 * follow-up. Lower competition, not medical, and precisely what ClearPath does.
 *
 * Cluster weights are set from Search Console evidence (6 months to 2026-08-22,
 * 903 impressions, avg position 10.1). Queries already surfacing:
 *   second opinions ......... 9 impressions  (strongest non-brand signal)
 *   well-child / 2-year ..... 6
 *   referral process ........ 3
 *   navigator vs manager .... 2
 *   insurance waiting ....... 2
 *   EOB ..................... 1
 * Position 10.1 means these are page-one-adjacent — depth on these clusters
 * moves existing impressions into clicks faster than any new topic will.
 */

export const CLUSTERS = [
  {
    key: "second-opinion",
    name: "Second Opinions & Specialist Referrals",
    weight: 5, // highest measured non-brand demand
    pillar: "pediatric-care-navigation-guide",
    angles: [
      "how to ask your pediatrician for a second opinion without offending them",
      "what to send ahead of a pediatric second opinion appointment",
      "how long a pediatric second opinion usually takes to arrange",
      "does insurance cover a pediatric second opinion",
      "second opinion vs transferring care — what the difference means practically",
      "how to get medical records released for a second opinion",
      "what questions to ask at a pediatric second opinion",
      "how to compare two conflicting specialist opinions for your child",
      "when a second opinion is worth the wait and when it is not",
      "how to request a virtual pediatric second opinion",
      "what a pediatric specialty referral process actually involves, step by step",
      "why a specialist referral stalls, and how to find out where",
      "how to check whether a referral was actually sent",
      "how to prepare for a first appointment with a new pediatric specialist",
      "who to call when a referral has gone quiet for weeks",
    ],
  },
  {
    key: "denials-auth",
    name: "Prior Authorisation, Denials & Appeals",
    weight: 5,
    pillar: "pediatric-care-navigation-guide",
    angles: [
      "what to do while waiting for insurance to approve a pediatric therapy",
      "how to read a pediatric prior authorisation denial letter",
      "how to request the written denial reason and policy language",
      "what a letter of medical necessity should actually say",
      "how long a pediatric insurance appeal takes",
      "what a peer-to-peer review is and how to ask for one",
      "internal vs external appeal for a pediatric claim",
      "how to track prior authorisation expiry dates so coverage never lapses",
      "what to do when a pediatric therapy authorisation runs out mid-treatment",
      "how to appeal a denied pediatric feeding therapy request",
      "how to appeal a denied pediatric DME or equipment request",
      "what to do when insurance says a pediatric treatment is experimental",
      "how to escalate a pediatric claim to a state insurance commissioner",
      "documenting medical necessity for a child with complex needs",
      "what to do while waiting for gene therapy insurance approval",
    ],
  },
  {
    key: "billing-eob",
    name: "Bills, EOBs & What Care Costs",
    weight: 4,
    pillar: "pediatric-care-navigation-guide",
    angles: [
      "how to read an EOB statement as a parent, line by line",
      "why the EOB and the bill do not match, and which to trust",
      "how a pediatric deductible and out-of-pocket maximum actually work",
      "what to do when you get a surprise pediatric bill",
      "how to ask a children's hospital for an itemised bill",
      "how to request financial assistance from a children's hospital",
      "what balance billing is and when it is not allowed",
      "how to check whether a pediatric provider is in network before the visit",
      "what to do when two providers bill for the same pediatric visit",
      "how to set up a payment plan for pediatric medical bills",
      "how to spot a pediatric billing error before you pay",
      "what the No Surprises Act means for a child's care",
      "how secondary insurance works alongside primary for a child",
    ],
  },
  {
    key: "well-child",
    name: "Well-Child Visits & Developmental Checks",
    weight: 4, // 2-year check queries already surfacing
    pillar: "pediatric-care-navigation-guide",
    angles: [
      "what happens at a 2 year well-child check, and how to prepare",
      "what to bring to a well-child visit when your child sees specialists",
      "how to track developmental milestones between appointments",
      "what to do if you disagree with a developmental screening result",
      "how to ask for a developmental referral at a well-child visit",
      "what to write down before a well-child visit",
      "how well-child visits change for a medically complex child",
      "what questions to ask at a 4 year well-child check",
      "how to get the most out of a fifteen-minute pediatric appointment",
      "how to keep well-child visits on schedule during a complex year",
      "what a developmental screening actually tests",
      "how to document a concern so it is taken seriously",
    ],
  },
  {
    key: "discharge",
    name: "Hospital Discharge & Coming Home",
    weight: 4,
    pillar: "post-nicu-discharge-support",
    angles: [
      "what to ask before your child is discharged from hospital",
      "what a pediatric discharge summary should contain",
      "how to set up home nursing after a pediatric discharge",
      "who schedules follow-up appointments after discharge, and how to confirm",
      "what to do when discharge medications are not ready at the pharmacy",
      "how to build a warning-signs page after a hospital stay",
      "what to expect in the first week home from the NICU",
      "how to get equipment and supplies delivered before discharge day",
      "how to make sure the pediatrician received the discharge summary",
      "what a readmission means and how to prepare for the conversation",
      "how to organise home nursing schedules without losing your mind",
      "questions to ask the discharge planner",
    ],
  },
  {
    key: "school-iep",
    name: "School, IEP & 504 Plans",
    weight: 3,
    pillar: "pediatric-care-navigation-guide",
    angles: [
      "how to request a draft IEP before the meeting",
      "how to write a parent input statement for an IEP",
      "IEP vs 504 plan for a medically complex child",
      "what to do when a child misses school for medical reasons",
      "how to request homebound instruction for a medically fragile child",
      "how to get medical accommodations written into a school plan",
      "what an IEP progress report should actually tell you",
      "how to prepare for an IEP meeting when your child has complex needs",
      "what to do when the school disputes a medical recommendation",
      "how to bring the medical team's input into a school meeting",
      "who at school is responsible for a health care plan day to day",
      "what to do if an IEP is not being followed",
    ],
  },
  {
    key: "organising",
    name: "Medical Paperwork & Organisation",
    weight: 3,
    pillar: "pediatric-care-navigation-guide",
    angles: [
      "how to build a pediatric care binder that survives an ER visit",
      "what belongs on a one-page medical summary for a child",
      "how to organise a pediatric medication list with several prescribers",
      "how to keep a medical timeline for a child with a long history",
      "how to organise pediatric referral paperwork",
      "how to request pediatric medical records, and how long it takes",
      "how to get portal access to every system your child is seen in",
      "what to keep and what to throw away in pediatric paperwork",
      "how to prepare a medical summary for a babysitter or respite carer",
      "how to organise DME and supply paperwork",
      "how to store medical documents so both parents can reach them",
      "what a medication reconciliation is and how to ask for one",
    ],
  },
  {
    key: "coordination",
    name: "Care Team Coordination",
    weight: 3,
    pillar: "care-navigator-vs-case-manager",
    angles: [
      "who owns the follow-up when several specialists are involved",
      "how to ask for a pediatric care conference",
      "nurse navigator vs case manager vs social worker — who does what",
      "how to get two specialists to talk to each other",
      "what to do when specialists give conflicting advice about your child",
      "how to name a lead clinician for a medically complex child",
      "how to keep every team working from the same medication list",
      "what a care plan should contain for a child with complex needs",
      "how to hand over care when you change pediatricians",
      "how to keep track of what each specialist is responsible for",
      "what to do when a test result never comes back",
      "how to prepare a handover document for a new provider",
    ],
  },
  {
    key: "home-dme",
    name: "Home Nursing, DME & Supplies",
    weight: 2,
    pillar: "complex-medical-needs-care-navigation",
    angles: [
      "how private duty nursing hours are approved for a child",
      "what to do when home nursing shifts go unfilled",
      "how to order and reorder pediatric medical supplies without gaps",
      "what to do when a DME supplier stops responding",
      "how to get a pediatric wheelchair or stander replaced as a child grows",
      "how to document equipment need for an insurance request",
      "what to do when equipment arrives broken or wrong",
      "how to prepare your home before equipment is delivered",
      "who to call when a feeding pump or vent alarms at home",
      "how to keep a supply inventory so you never run out",
    ],
  },
];

/**
 * A fixed publication schedule, built once.
 *
 * Round-robins the clusters, taking `weight` angles from each per pass, so a
 * weight-5 cluster publishes 5 posts for every 2 from a weight-2 cluster while
 * every angle is still used exactly once before anything repeats. A pseudo-
 * random pick collided far too often — 14 repeats in the first 42 posts.
 */
const SCHEDULE = (() => {
  const out = [];
  const at = Object.fromEntries(CLUSTERS.map((c) => [c.key, 0]));
  for (let guard = 0; guard < 500; guard++) {
    let added = false;
    for (const c of CLUSTERS) {
      for (let w = 0; w < c.weight; w++) {
        if (at[c.key] < c.angles.length) {
          out.push({ cluster: c, angle: c.angles[at[c.key]++] });
          added = true;
        }
      }
    }
    if (!added) break;
  }
  return out;
})();

export const SCHEDULE_LENGTH = SCHEDULE.length;

/**
 * The angles for a given day. Walks SCHEDULE by day index, so consecutive days
 * never overlap and the whole pool is exhausted before it wraps.
 * `recentTitles` is a secondary guard for anything already published.
 */
export function pickAngles(iso, count, recentTitles = []) {
  const day = Math.floor(Date.parse(iso + "T12:00:00Z") / 86400000);
  const recent = recentTitles.map((t) => t.toLowerCase());
  const out = [];
  for (let n = 0; out.length < count && n < SCHEDULE.length; n++) {
    const pick = SCHEDULE[(day * count + n) % SCHEDULE.length];
    if (out.some((o) => o.angle === pick.angle)) continue;
    const words = pick.angle.split(" ").filter((w) => w.length > 4).slice(0, 4);
    if (words.length >= 3 && recent.some((t) => words.filter((w) => t.includes(w)).length >= 3)) continue;
    out.push(pick);
  }
  return out.slice(0, count);
}
