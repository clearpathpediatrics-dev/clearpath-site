/**
 * ClearPath Pediatrics — SEO landing pages (data)
 * -------------------------------------------------------------
 * Each entry becomes a standalone, SEO-optimized page at /<slug>.
 * These target specific searches families actually type, and each one
 * funnels to a free consultation. Add a new page by adding an object here,
 * then run:  node scripts/build-landing-pages.mjs
 *
 * Framing rule: EDUCATION + NAVIGATION only. Never medical advice/diagnosis.
 */
export const LANDING_PAGES = [
  {
    slug: "post-nicu-discharge-support",
    eyebrow: "Post-NICU Support",
    h1: "Post-NICU Discharge Support for Families",
    title: "Post-NICU Discharge Support | Pediatric Care Navigation | ClearPath Pediatrics",
    metaDescription: "RN-led support for families bringing a baby home from the NICU. Organize follow-ups, medications, and specialists so nothing falls through the cracks. Book a free call.",
    keywords: ["post-NICU support", "NICU discharge", "bringing baby home from NICU", "pediatric care navigation", "premature baby follow-up care"],
    intro: [
      "Coming home from the NICU is a huge milestone — and one of the most overwhelming transitions a family can face. Suddenly you're managing follow-up appointments, medications, equipment, and a stack of discharge paperwork, all at once.",
      "ClearPath Pediatrics gives you an experienced RN care navigator in your corner to help you organize it all, prepare for every appointment, and feel confident in those first months home.",
    ],
    who: [
      "You just brought your baby home from the NICU and feel buried in instructions",
      "You're juggling multiple specialists, follow-ups, and early-intervention referrals",
      "You're managing medications, feeding plans, or home equipment",
      "You want a knowledgeable person to help you stay organized and prepared",
    ],
    help: [
      { icon: "📋", title: "Make sense of discharge instructions", text: "We translate dense NICU discharge paperwork into a clear, manageable plan you can actually act on." },
      { icon: "📅", title: "Organize every follow-up", text: "Track pediatrician, specialist, and early-intervention appointments in one place — with reminders and prep." },
      { icon: "💊", title: "Keep medications & feeding straight", text: "Build a simple system for dosing schedules, feeding plans, and home equipment so nothing gets missed." },
      { icon: "📞", title: "Know when to call", text: "Understand which questions belong to which provider, and how to reach your care team with confidence." },
    ],
    faq: [
      { q: "What is post-NICU care navigation?", a: "Post-NICU care navigation is non-medical support that helps families organize the follow-up care a NICU graduate needs — appointments, medications, referrals, and paperwork. ClearPath's RNs help you understand and coordinate what your child's providers have already prescribed; we do not provide medical care or treatment." },
      { q: "Do you replace my baby's doctors?", a: "No. ClearPath complements your child's licensed medical team. We handle the organization, preparation, and coordination between visits so you can focus on your baby — all clinical decisions stay with your providers." },
    ],
  },
  {
    slug: "complex-medical-needs-care-navigation",
    eyebrow: "Complex & Chronic Care",
    h1: "Care Navigation for Children With Complex Medical Needs",
    title: "Care Navigation for Medically Complex Children | ClearPath Pediatrics",
    metaDescription: "Feeding tubes, tracheostomies, seizures, multiple specialists? RN-led care navigation helps families of medically complex children stay organized and prepared. Free call.",
    keywords: ["medically complex children", "complex care pediatrics", "feeding tube support", "multiple specialists coordination", "chronic pediatric conditions"],
    intro: [
      "When your child has complex or chronic medical needs, care becomes a full-time job — coordinating specialists, tracking medications, managing equipment, and advocating at every appointment.",
      "ClearPath Pediatrics pairs your family with an experienced RN care navigator who helps you build systems that actually work, so you can spend less time drowning in logistics and more time with your child.",
    ],
    who: [
      "Your child sees multiple specialists across different systems",
      "You manage medications, feeding, seizures, or medical equipment day-to-day",
      "You feel like you're the only one connecting the dots between providers",
      "You want to walk into appointments organized and confident",
    ],
    help: [
      { icon: "🔗", title: "Coordinate every specialist", text: "Track each provider, referral, and follow-up, and keep communication clear across your child's whole care team." },
      { icon: "🗂️", title: "Build a Medical Care Binder", text: "A professionally organized record of diagnoses, medications, and emergency summaries — always ready when you need it." },
      { icon: "🗓️", title: "Prepare for every visit", text: "Walk in with the right questions and history so nothing important gets forgotten or repeated." },
      { icon: "🚨", title: "Red-flag & escalation clarity", text: "Understand which symptoms warrant a call, which need urgent care, and which can wait — so you're never frozen." },
    ],
    faq: [
      { q: "How does ClearPath help families of medically complex children?", a: "ClearPath provides RN-led care navigation and education: organizing medications and appointments, building a medical care binder, preparing for specialist visits, and coordinating communication across providers. We help you understand and manage the plan your medical team has set — we do not diagnose or treat." },
      { q: "Is this a medical service?", a: "No. ClearPath is a private, fee-for-service care navigation and education service, not a medical practice. All medical decisions remain with your child's licensed healthcare providers. In an emergency, call 911." },
    ],
  },
  {
    slug: "autism-care-coordination",
    eyebrow: "Developmental Support",
    h1: "Autism & Developmental Care Coordination for Families",
    title: "Autism Care Coordination & Navigation for Parents | ClearPath Pediatrics",
    metaDescription: "Navigating autism and developmental care? RN-led navigation helps families organize evaluations, therapies, referrals, and appointments — and feel prepared. Free call.",
    keywords: ["autism care coordination", "developmental pediatrics navigation", "autism resources for parents", "therapy coordination", "special needs care navigation"],
    intro: [
      "An autism or developmental diagnosis can open a maze of evaluations, therapies, referrals, and waitlists — often with little guidance on how to hold it all together.",
      "ClearPath Pediatrics gives you an RN care navigator to help you organize the moving pieces, prepare for appointments, and keep your child's supports on track, so you can focus on your child, not the paperwork.",
    ],
    who: [
      "Your child was recently diagnosed and you're not sure where to start",
      "You're coordinating multiple therapies, evaluations, or referrals",
      "You're stuck on waitlists and losing track of what's next",
      "You want a calm, organized point person in your corner",
    ],
    help: [
      { icon: "🧭", title: "A clear path forward", text: "We help you map out evaluations, therapies, and next steps so the maze feels manageable." },
      { icon: "🗓️", title: "Keep therapies on track", text: "Organize appointments, referrals, and follow-ups across providers in one simple system." },
      { icon: "💬", title: "Prepare & advocate", text: "Walk into appointments and school meetings organized, with the right questions and documentation ready." },
      { icon: "🗂️", title: "One organized record", text: "Keep evaluations, reports, and plans together so you're never scrambling to find a document." },
    ],
    faq: [
      { q: "What does autism care coordination include?", a: "It's non-medical navigation and education support: helping parents organize evaluations, therapies, referrals, and appointments, prepare for provider and school meetings, and keep records in one place. ClearPath does not diagnose autism or provide therapy — we help you coordinate and prepare around the care your licensed providers direct." },
      { q: "Can ClearPath help with school and IEP meetings?", a: "We help you organize documentation and prepare questions so you can advocate effectively — walking in prepared and leaving with clarity. We do not attend meetings or make educational or clinical decisions on your behalf." },
    ],
  },
  {
    slug: "pediatric-care-navigation-phoenix",
    eyebrow: "Phoenix, Arizona",
    h1: "Pediatric Care Navigation in Phoenix, Arizona",
    title: "Pediatric Care Navigation in Phoenix, AZ | ClearPath Pediatrics",
    metaDescription: "Phoenix-based, RN-led pediatric care navigation for families of medically complex children — organize specialists, appointments, and insurance. Book a free 30-minute call.",
    keywords: ["pediatric care navigation Phoenix", "Phoenix pediatric care coordination", "care navigator Phoenix AZ", "medically complex children Phoenix", "RN care navigator Arizona"],
    intro: [
      "ClearPath Pediatrics is a Phoenix-based, RN-led care navigation service for families of medically complex and chronically ill children. We help Arizona parents organize specialists, prepare for appointments, understand insurance, and feel confident between visits.",
      "Our services are delivered virtually, so we support families across Phoenix, Scottsdale, Tempe, Mesa, and the wider Valley — and beyond.",
    ],
    who: [
      "You're a Phoenix-area family managing complex or chronic pediatric care",
      "You're coordinating between multiple specialists and feeling stretched thin",
      "You want help understanding appointments, referrals, and insurance",
      "You'd like a knowledgeable RN resource who knows your child's situation",
    ],
    help: [
      { icon: "📋", title: "Understand your child's care", text: "We translate complex instructions into clear, manageable steps your family can act on." },
      { icon: "🔗", title: "Coordinate local specialists", text: "Track every provider and keep communication clear across your child's Phoenix-area care team." },
      { icon: "🗓️", title: "Prepare for every appointment", text: "Walk in organized and confident, with the right questions and history ready." },
      { icon: "📞", title: "Support between visits", text: "Ongoing RN check-ins and secure messaging so you're never navigating alone." },
    ],
    faq: [
      { q: "Do you serve families outside Phoenix?", a: "Yes. ClearPath Pediatrics is based in Phoenix, Arizona, and delivers services virtually, so we can support families across the Valley and nationwide. Reach out to confirm availability in your area." },
      { q: "Is ClearPath a doctor's office?", a: "No. ClearPath is a private, fee-for-service care navigation and education service — not a medical practice. We help you organize, understand, and prepare for the care your licensed providers direct. All medical decisions stay with your child's healthcare team." },
    ],
  },
];
