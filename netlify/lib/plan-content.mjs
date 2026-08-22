/**
 * Turns form answers into everything printed on the Starter Plan.
 *
 * Rules, without exception:
 *  - No medical advice, diagnosis or treatment. Every line is paperwork,
 *    a question to ask, or who to ask it of.
 *  - Nothing invented about the child. We reflect back only what they told us.
 *  - No false urgency. If a family says things are stable, the plan says so.
 *  - Every linked guide must be a real published article on the site.
 */

/* ---------------------------------------------------- situation reflection */
const LOAD_LINE = {
  "1":   "With one provider the coordination load is light today. The value of building the system now is that it stays light when things change — and they usually change faster than anyone expects.",
  "2-3": "Two or three providers is the point where plans begin to overlap and nobody is quite certain who owns what. It is early enough that a small amount of structure prevents most of the mess.",
  "4-6": "Four to six providers means several separate plans that only you ever see all of at once. Each team sees their slice; you are holding the whole picture, usually from memory.",
  "7+":  "Seven or more providers is more moving parts than any one person can hold reliably. Nothing about that is a personal failing — it is simply past the number a human brain tracks without a system.",
};

const TRIGGER_LINE = {
  "new-diagnosis":   "A new diagnosis resets everything at once: new vocabulary, a new team, new paperwork, and a period where you are expected to make decisions before you have the language for them.",
  "discharge":       "Coming home is the highest-risk handoff in pediatric care. Instructions given at discharge — verbally, at the most stressful possible moment — are the most commonly lost information there is.",
  "denial":          "A denial is a deadline. Appeal windows are short, they start from the date on the letter rather than the day you opened it, and they do not pause for everything else happening.",
  "new-therapy":     "New services mean new authorisations, new schedules, and a new set of people who each hold one piece of the plan and assume someone else holds the rest.",
  "school":          "School runs on its own calendar and its own rules, entirely separate from anything medical. What the medical team decides does not automatically reach the people who see your child all day.",
  "provider-change": "Changing providers is where history gets lost. What the previous team knew does not travel automatically, and the gap usually surfaces at the worst moment.",
  "nothing":         "Nothing urgent right now is the best possible time to build this. You get to do it calmly, once, instead of assembling it in a hospital corridor.",
};

const COPING_LINE = {
  "steady":      "You said you are managing. So this is about protecting your time rather than rescuing it — putting structure in while you still have the capacity to build it.",
  "stretched":   "Stretched thin is the point where most families start dropping things they would normally catch. Not from carelessness — from volume.",
  "overwhelmed": "When you are overwhelmed, the fix is never trying harder. It is having fewer things to hold in your head at once.",
  "drowning":    "You told us you are barely keeping up. That is not a failure of effort, it is a load problem — and load problems have structural fixes rather than motivational ones.",
};

/* --------------------------------------------------------------- playbooks */
const PLAYBOOK = {
  organize: {
    focus: "Getting everything into one place you can hand to anyone",
    first: {
      step: "Build one care binder before anything else",
      detail: "Every provider, every medication, every device, and the current plan — in one place, physical or digital, that you can hand to a stranger in under ten seconds. This is the single change that eliminates the most repeated work, because it stops you being the only copy of your child's history.",
    },
    steps: [
      { t: "Write the one-page summary first", d: "Name, date of birth, diagnoses, allergies, current medications with doses, devices, and the three people to call. If you only ever finish one page, finish this one — it is the page that matters at 2am." },
      { t: "Add a care team roster", d: "Every provider, what they are responsible for, direct phone and portal, and when you last saw them. Coordination failures happen in the gaps between specialists, and you cannot see a gap you have not written down." },
      { t: "Start a running timeline", d: "One line per change: date, what changed, who decided it. When five teams each ask the same history question, having it written saves hours every single month." },
      { t: "Put the binder where it travels", d: "A photo of every page on your phone, or a shared folder. The version that helps is the one you have with you when something goes wrong away from home." },
    ],
    scripts: [
      { who: "Your pediatrician's office", say: "I'm putting together a complete care summary for my child. Could you send me the current problem list, medication list, and the most recent visit note through the portal?" },
      { who: "Each specialist's office", say: "I'm building one document so every team is working from the same information. What would you want another provider to know about your part of my child's care?" },
    ],
    questions: [
      "Which of these medications are still current, and which can come off the list?",
      "Who is the primary point of contact if something changes between visits?",
      "Is there anything in the chart you'd want corrected or updated?",
      "What should I bring to the next appointment that I'm not bringing now?",
      "If we ended up in the ER tonight, what would you want them to know first?",
    ],
    gather: ["Insurance card, front and back", "Current medication list with doses and timings", "Most recent visit note from each specialist", "Device and equipment details, including supplier and model", "Any prior authorisation letters and their expiry dates"],
    resources: [
      { t: "How to build a pediatric care binder", s: "pediatric-care-binder-complex-child" },
      { t: "Building a care team roster", s: "pediatric-care-team-roster-complex-care" },
      { t: "Organising a pediatric medication list", s: "organize-pediatric-medication-list" },
    ],
    map: ["Build the one-page summary and photograph it.", "Add the care team roster and request portal access anywhere you don't have it.", "Fill in the timeline back as far as you can remember, then keep it current."],
  },

  appts: {
    focus: "Making appointments produce answers instead of more questions",
    first: {
      step: "Write your three questions down before the next appointment",
      detail: "Three, in priority order, on paper or on your phone. Appointments run shorter than anyone plans for, and the thing you most needed to ask is almost always the thing that gets skipped — not because the clinician refused, but because it never got said out loud.",
    },
    steps: [
      { t: "Send the questions ahead through the portal", d: "A short message the day before turns a rushed visit into a prepared one. Clinicians read them, and it means the answer starts before you sit down." },
      { t: "Ask for the plan in writing before you leave", d: "\"Can you put the plan in the visit summary so I have it?\" Verbal plans decay within hours, and a written one is what you show the next team." },
      { t: "Record or take notes, and confirm out loud", d: "At the end, say back what you understood in one sentence and ask if you have it right. Most misunderstandings surface in that ten seconds." },
      { t: "Book the follow-up before you walk out", d: "Leaving without a date is the most common reason a follow-up quietly never happens." },
    ],
    scripts: [
      { who: "At the end of the visit", say: "Before we finish — can I say back what I understood, and you tell me if I have it right?" },
      { who: "The scheduling desk", say: "I'd like the follow-up on the calendar now rather than waiting for a call. What's the soonest slot that meets the timeline we just discussed?" },
    ],
    questions: [
      "What are we watching for between now and the next visit?",
      "What would make you want to see us sooner?",
      "Who do I call if that happens — you, or someone else?",
      "What is this test or change meant to tell us?",
      "Is there anything the other teams need to know about what we decided today?",
    ],
    gather: ["Your three questions, in priority order", "Current medication list", "Any changes since the last visit, dated", "Questions the other specialists asked you to raise", "Something to write on — the phone notes app is fine"],
    resources: [
      { t: "The specialist referral checklist", s: "prepare-pediatric-specialist-referral-checklist" },
      { t: "Preparing for a well-child visit", s: "prepare-pediatric-well-child-visit-guide" },
      { t: "Organising specialist appointments", s: "organize-pediatric-specialist-appointments" },
    ],
    map: ["Write and send your three questions before the next visit.", "Get the plan in writing and the follow-up booked before you leave.", "Start a one-page log of what each specialist asked you to raise elsewhere."],
  },

  insurance: {
    focus: "Getting paid-for care approved, and getting denials overturned",
    first: {
      step: "Request the written denial reason before you write anything",
      detail: "Not the summary line on the letter — the specific denial code and the exact policy language it relies on. Almost every successful appeal argues against that precise wording, and you cannot argue against language you have not read. Ask for it in writing and give them a date.",
    },
    steps: [
      { t: "Check the appeal deadline first", d: "It runs from the date printed on the letter, not the day it arrived. Write that date somewhere you will see it, and work backwards from it." },
      { t: "Ask the ordering provider for a letter of medical necessity", d: "It should address the denial reason directly rather than restate the diagnosis. Send them the denial language so they are arguing against the right thing." },
      { t: "Build an authorisation log", d: "Service, approval date, expiry, renewal date, reference number. Most coverage gaps happen because a date passed quietly, not because anyone refused." },
      { t: "Match every EOB against the bill before paying", d: "Billing errors are common and dramatically easier to fix before payment than after." },
    ],
    scripts: [
      { who: "The insurer, on the phone", say: "I'm requesting the specific denial reason code and the policy language it's based on, in writing. Can you also confirm my appeal deadline and the exact address it needs to go to? Could I have a reference number for this call?" },
      { who: "The ordering provider's office", say: "This was denied for [reason]. Would you be able to write a letter of medical necessity that addresses that specific reason? I can send you the denial letter." },
    ],
    questions: [
      "What is the exact denial code, and what policy language does it cite?",
      "What is my appeal deadline, and does it run from the letter date?",
      "Is there a peer-to-peer review available before I file a formal appeal?",
      "What documentation would make this approvable?",
      "Is there a different code or setting this would be covered under?",
    ],
    gather: ["The full denial letter, all pages", "Your policy's summary of benefits", "The original order or referral", "Relevant visit notes supporting the request", "A call log — date, name, reference number, what was said"],
    resources: [
      { t: "Appealing a denied pediatric claim", s: "appeal-denied-pediatric-insurance-claim" },
      { t: "How to read a pediatric EOB", s: "read-pediatric-eob-explanation-of-benefits" },
      { t: "Prior authorisation, organised", s: "organize-pediatric-prior-authorization-requests" },
    ],
    map: ["Get the written denial reason and confirm the deadline.", "Request the letter of medical necessity addressing that reason.", "File the appeal and start the authorisation log so the next one is easier."],
  },

  advocate: {
    focus: "Making sure someone owns the space between your child's teams",
    first: {
      step: "Build a one-page care team roster",
      detail: "Every provider, exactly what they are responsible for, and how to reach them directly. Most coordination failures are not caused by any single team — they happen because each one assumes another owns the follow-up. You cannot close a gap you have not made visible.",
    },
    steps: [
      { t: "Name the owner out loud at every visit", d: "\"Who is responsible for this between now and the next appointment?\" If the answer is vague, that is the gap, and now you know where to put your attention." },
      { t: "Get portal access everywhere", d: "Reading the notes yourself is the fastest way to catch two teams working from different information." },
      { t: "Ask for a care conference when teams disagree", d: "One conversation with everyone present beats six weeks of relayed messages. You are entitled to ask for it." },
      { t: "Keep a decision log", d: "What was decided, by whom, on what date. It ends the loop where nobody remembers who agreed to what." },
    ],
    scripts: [
      { who: "Any specialist, at the end of a visit", say: "Between now and next time, who owns this piece — you, our pediatrician, or me? I want to make sure it doesn't fall between us." },
      { who: "The practice manager", say: "Several teams are involved in my child's care and I'm getting different answers. Could we arrange a care conference so everyone is working from the same plan?" },
    ],
    questions: [
      "Who is the overall lead for my child's care?",
      "Which decisions need input from the other specialists before they're made?",
      "How do the teams communicate with each other — and can I see that?",
      "What happens to follow-ups if we don't chase them?",
      "Is anything currently waiting on another team?",
    ],
    gather: ["A list of every provider and their role", "Portal logins for each system", "Recent visit notes from each team", "Anything you have been told twice, differently", "Dates of outstanding referrals or results"],
    resources: [
      { t: "Building a care team roster", s: "pediatric-care-team-roster-complex-care" },
      { t: "Care navigator vs. case manager", s: "../care-navigator-vs-case-manager" },
      { t: "Organising referral paperwork", s: "organize-pediatric-referral-paperwork" },
    ],
    map: ["Build the roster and identify who owns what.", "Get portal access everywhere and read the last note from each team.", "Ask the ownership question at every appointment until it becomes habit."],
  },

  "school-iep": {
    focus: "Making school work with the rest of your child's care",
    first: {
      step: "Request the draft IEP in writing before the meeting",
      detail: "You are entitled to review it in advance, and asking in writing creates the record that you did. Walking in having already read it changes the whole dynamic of the room — you arrive discussing specifics rather than reacting to a document you are seeing for the first time.",
    },
    steps: [
      { t: "Send your own written input beforehand", d: "A short parent statement describing what your child needs and what has changed. It becomes part of the record and it frames the meeting before it starts." },
      { t: "Bring the medical picture into the room", d: "A one-page summary from the care binder. School teams often make decisions without knowing what changed medically last term." },
      { t: "Get everything agreed written into the document", d: "Anything agreed verbally is not binding. If it matters, it goes in the document before you leave the room." },
      { t: "Ask how progress will be measured and reported", d: "Vague goals cannot be enforced. Specific, measured goals can." },
    ],
    scripts: [
      { who: "The school, in writing, before the meeting", say: "Ahead of our meeting, could you send me the draft IEP and any assessments you'll be referring to? I'd like to review them in advance so we can use the time well." },
      { who: "In the meeting, when something is agreed", say: "That sounds right — can we get that written into the document now, so we're all working from the same version?" },
    ],
    questions: [
      "How will each goal be measured, and how often will I hear about progress?",
      "What happens when my child is absent for medical reasons?",
      "Who on staff is responsible for the medical accommodations day to day?",
      "What training have staff had on my child's specific needs?",
      "What does the plan do if things get worse rather than better?",
    ],
    gather: ["The draft IEP and any assessments", "A one-page medical summary", "Your written parent input statement", "A record of absences and the reasons", "Notes on what has and has not worked so far"],
    resources: [
      { t: "Preparing for an IEP meeting", s: "prepare-pediatric-iep-meeting-organizing-guide" },
      { t: "The IEP organising guide", s: "preparing-pediatric-iep-meeting-guide" },
      { t: "Tracking developmental milestones", s: "track-pediatric-developmental-milestones-between-visits" },
    ],
    map: ["Request the draft IEP and assessments in writing.", "Write and send your parent input statement.", "Attend with the medical summary, and get everything agreed written down before you leave."],
  },

  discharge: {
    focus: "Turning a discharge into a plan you can actually run at home",
    first: {
      step: "Get the discharge summary and the full follow-up list in writing",
      detail: "Before you leave if you can, or this week if you are already home. Discharge instructions given verbally at the most stressful moment of the whole admission are the most commonly lost piece of information in pediatric care. You want the document, not the memory.",
    },
    steps: [
      { t: "Confirm who is scheduling each follow-up", d: "For every appointment on that list: is the hospital booking it, or are you? Anything nobody claims will not happen." },
      { t: "Check every prescription and supply is actually in hand", d: "Discharge medications and equipment routinely stall at the pharmacy or supplier. Confirm each one is filled or scheduled, not just ordered." },
      { t: "Write the warning-signs page", d: "Ask the team what should make you call, and who to call for each. Put it on one page on the fridge. This is the page that matters at 3am." },
      { t: "Send the summary to the pediatrician yourself", d: "Do not assume it arrived. The handoff from hospital to community is where information most often stops." },
    ],
    scripts: [
      { who: "The discharging team", say: "Can I have the discharge summary and the follow-up list in writing before we go? And for each appointment — is your team booking it, or am I?" },
      { who: "The pediatrician's office, the same week", say: "My child was discharged on [date]. I want to confirm you received the discharge summary, and get a follow-up on the calendar." },
    ],
    questions: [
      "What should make me call you, and who exactly do I call?",
      "Which of these medications are new, and which have changed dose?",
      "What does a normal recovery look like week by week?",
      "Which appointments are already booked, and which do I book?",
      "What equipment or supplies are coming, from whom, and by when?",
    ],
    gather: ["The written discharge summary", "The complete follow-up appointment list", "Every new or changed prescription", "Equipment and supply orders with supplier contacts", "The warning-signs page, somewhere visible"],
    resources: [
      { t: "Post-NICU and post-discharge support", s: "../post-nicu-discharge-support" },
      { t: "Building a care binder", s: "pediatric-care-binder-complex-child" },
      { t: "Organising home nursing schedules", s: "organize-pediatric-home-nursing-schedules" },
    ],
    map: ["Get the discharge summary and follow-up list, and confirm who books what.", "Verify every medication and supply is actually in hand.", "Send the summary to the pediatrician and get the first follow-up done."],
  },
};

/* --------------------------------------------------------------- watchouts */
const WATCH = {
  discharge: "Discharge instructions given verbally at a stressful moment are the most commonly lost information in pediatric care. Get them in writing before you need them, not after.",
  denial:    "Appeal deadlines run from the date printed on the letter, not the day you opened it. Check that date before anything else.",
  authlog:   "Most coverage gaps happen because a renewal date passed quietly, not because a request was refused. Diary every expiry date.",
  chart:     "Language like \"does not tolerate\" or \"non-compliant\" in a chart follows a child and can later be used to justify withholding a service. Read your notes and correct anything inaccurate early, while it is still easy.",
  school:    "Anything agreed verbally in a school meeting is not binding. If it matters, it goes in the document before you leave the room.",
  gap:       "When several specialists are involved, the risk is rarely any one of them. It is that each assumes someone else owns the follow-up. Name the owner out loud, every time.",
  records:   "Request records when things are calm rather than when you urgently need them. Release processes routinely take two to four weeks.",
  outofstate:"We work with families anywhere in the country by phone, video and secure messaging, so being outside Arizona changes nothing about what we can do together.",
  stable:    "Building the system while things are stable is the cheapest it will ever be. Every family who does it says the same thing after the next crisis.",
  meds:      "Ask for a medication reconciliation at least twice a year. Lists drift as teams add and stop things without seeing each other's changes.",
};

const WATCH_BY_TRIGGER = {
  "new-diagnosis":   ["records", "gap", "chart", "meds"],
  "discharge":       ["discharge", "gap", "meds", "records"],
  "denial":          ["denial", "authlog", "chart", "records"],
  "new-therapy":     ["authlog", "gap", "chart", "records"],
  "school":          ["school", "chart", "records", "gap"],
  "provider-change": ["records", "gap", "meds", "chart"],
  "nothing":         ["stable", "records", "gap", "meds"],
};

/** Everything the PDF and the email need. */
export function buildPlan(a = {}) {
  const pb = PLAYBOOK[a.need] || PLAYBOOK.organize;

  const situation = [
    LOAD_LINE[a.providers] || LOAD_LINE["1"],
    TRIGGER_LINE[a.trigger] || TRIGGER_LINE.nothing,
    COPING_LINE[a.coping] || COPING_LINE.steady,
  ].join(" ");

  const wkeys = (WATCH_BY_TRIGGER[a.trigger] || WATCH_BY_TRIGGER.nothing).slice(0, 4);
  const watchouts = wkeys.map(k => WATCH[k]);
  if (a.state && a.state !== "AZ") watchouts[3] = WATCH.outofstate;

  return {
    focus: pb.focus,
    situationLine: situation,
    firstMove: pb.first,
    steps: pb.steps,
    scripts: pb.scripts,
    questions: pb.questions,
    gather: pb.gather,
    resources: pb.resources,
    map: pb.map,
    watchouts,
  };
}
