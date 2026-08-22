/**
 * ClearPath Pediatrics — renders the personalised Care Navigation Starter Plan.
 *
 * Deliberately NOT branded as the Family Care Roadmap. That document is written
 * by an RN after a real conversation; this one is assembled from a web form.
 * Conflating them would be a lie the parent eventually notices.
 *
 * LAYOUT: this is a flowing renderer, not a fixed template. Every draw call
 * goes through the cursor, which starts a new page when the block will not fit.
 * The previous version painted the closing band at a fixed y and content ran
 * underneath it — with variable-length content that is a matter of when, not if.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROVIDERS, COPING, TRIGGERS, TIMING } from "./triage.mjs";

const NAVY  = rgb(0.043, 0.133, 0.251);
const NAVY2 = rgb(0.086, 0.200, 0.373);
const GOLD  = rgb(0.890, 0.643, 0.345);
const INK   = rgb(0.216, 0.302, 0.408);
const MUTED = rgb(0.478, 0.420, 0.333);
const CREAM = rgb(0.980, 0.969, 0.949);
const LINE  = rgb(0.910, 0.875, 0.824);
const WHITE = rgb(1, 1, 1);

const PW = 612, PH = 792, M = 46;
const COL = PW - 2 * M;
const BOTTOM = 62;               // never draw below this
const TOP_FIRST = PH - 128;      // below the tall header band
const TOP_CONT = PH - 76;        // below the slim continuation strip

/** pdf-lib standard fonts are WinAnsi — drop anything they cannot encode. */
const safe = (s = "") => String(s)
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/–/g, "-").replace(/…/g, "...")
  .replace(/[^\x20-\x7E -ÿ—•]/g, "");

export async function buildStarterPlan(lead) {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  let logo = null;
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const f = [path.resolve(here, "../../assets/logo-white-420.png"),
               path.resolve(process.cwd(), "assets/logo-white-420.png")].find(fs.existsSync);
    if (f) logo = await doc.embedPng(fs.readFileSync(f));
  } catch { /* text fallback below */ }

  const pages = [];
  let page, y;

  const wrap = (text, font, size, maxw) => {
    const out = [];
    for (const para of safe(text).split("\n")) {
      let line = "";
      for (const w of para.split(" ")) {
        const t = line ? line + " " + w : w;
        if (font.widthOfTextAtSize(t, size) <= maxw) line = t;
        else { if (line) out.push(line); line = w; }
      }
      out.push(line);
    }
    return out;
  };

  function newPage(first = false) {
    page = doc.addPage([PW, PH]);
    pages.push(page);
    if (first) {
      page.drawRectangle({ x: 0, y: PH - 96, width: PW, height: 96, color: NAVY });
      page.drawRectangle({ x: 0, y: PH - 100, width: PW, height: 4, color: GOLD });
      page.drawText("YOUR CARE NAVIGATION STARTER PLAN",
        { x: M, y: PH - 44, size: 19, font: bold, color: WHITE });
      page.drawText(safe(`Built from your answers on ${lead.dateLabel}`),
        { x: M, y: PH - 66, size: 10, font: reg, color: GOLD });
      if (logo) {
        const h = 62, w = (logo.width / logo.height) * h;
        page.drawImage(logo, { x: PW - M - w, y: PH - 80, width: w, height: h });
      } else {
        page.drawText("ClearPath Pediatrics",
          { x: PW - M - bold.widthOfTextAtSize("ClearPath Pediatrics", 12), y: PH - 44, size: 12, font: bold, color: WHITE });
      }
      y = TOP_FIRST;
    } else {
      page.drawRectangle({ x: 0, y: PH - 44, width: PW, height: 44, color: NAVY });
      page.drawRectangle({ x: 0, y: PH - 47, width: PW, height: 3, color: GOLD });
      page.drawText("Care Navigation Starter Plan", { x: M, y: PH - 28, size: 10.5, font: bold, color: WHITE });
      page.drawText(safe(lead.parentName || ""), {
        x: PW - M - reg.widthOfTextAtSize(safe(lead.parentName || ""), 9.5), y: PH - 28, size: 9.5, font: reg, color: GOLD });
      y = TOP_CONT;
    }
  }

  /** Reserve vertical space; break to a new page if the block will not fit. */
  const need = (h) => { if (y - h < BOTTOM) newPage(false); };

  // Height predictions. A section heading must never be the last thing on a
  // page — it has to break together with whatever follows it.
  const nl = (t, f, sz, w) => wrap(t, f, sz, w).length;
  const hStep    = (t, d) => nl(t, bold, 10.4, COL - 26) * 14 + nl(d, reg, 9.8, COL - 26) * 13 + 12;
  const hCallout = (k, t, b, ts = 12.5) =>
    26 + nl(t, bold, ts, COL - 34) * (ts + 3) + (b ? nl(b, reg, 9.8, COL - 34) * 13 : 0) + 12 + 2;
  const hBullet  = (t) => nl(t, reg, 10, COL - 15) * 13.4 + 5;
  const hCheck   = (t) => nl(t, reg, 10, COL - 20) * 13.4 + 5;
  const hMapRow  = (t) => Math.max(nl(t, reg, 10, COL - 74) * 13.4, 16) + 8;
  const hLede    = (t) => nl(t, reg, 9.6, COL) * 13.3 + 10;

  /** @param follow height of the first block that must stay with this heading */
  const H = (t, follow = 40) => {
    need(30 + follow);
    page.drawText(safe(t), { x: M, y, size: 8.5, font: bold, color: MUTED });
    y -= 6;
    page.drawLine({ start: { x: M, y }, end: { x: PW - M, y }, thickness: 0.6, color: LINE });
    y -= 15;
  };

  const P = (t, { size = 10.2, font = reg, color = INK, gap = 8, indent = 0 } = {}) => {
    for (const ln of wrap(t, font, size, COL - indent)) {
      need(size * 1.38);
      page.drawText(ln, { x: M + indent, y, size, font, color });
      y -= size * 1.38;
    }
    y -= gap;
  };

  /** Numbered step with a bold title and a wrapped detail line. */
  const step = (n, title, detail) => {
    const tl = wrap(title, bold, 10.4, COL - 26);
    const dl = wrap(detail, reg, 9.8, COL - 26);
    need(tl.length * 14 + dl.length * 13 + 14);
    page.drawCircle({ x: M + 7, y: y + 3.2, size: 8.5, color: NAVY2 });
    const s = String(n);
    page.drawText(s, { x: M + 7 - bold.widthOfTextAtSize(s, 8) / 2, y: y + 0.6, size: 8, font: bold, color: WHITE });
    tl.forEach((ln) => { page.drawText(ln, { x: M + 24, y, size: 10.4, font: bold, color: NAVY }); y -= 14; });
    dl.forEach((ln) => { page.drawText(ln, { x: M + 24, y, size: 9.8, font: reg, color: INK }); y -= 13; });
    y -= 7;
  };

  /** Cream call-out with a gold rule — used for START HERE and the scripts. */
  const callout = (kicker, title, body, { titleSize = 12.5 } = {}) => {
    const tl = wrap(title, bold, titleSize, COL - 34);
    const bl = body ? wrap(body, reg, 9.8, COL - 34) : [];
    const h = 26 + tl.length * (titleSize + 3) + bl.length * 13 + 12;
    need(h + 6);
    page.drawRectangle({ x: M, y: y - h + 16, width: COL, height: h, color: CREAM });
    page.drawRectangle({ x: M, y: y - h + 16, width: 3.5, height: h, color: GOLD });
    if (kicker) { page.drawText(safe(kicker), { x: M + 17, y: y + 2, size: 7.5, font: bold, color: MUTED }); y -= 14; }
    tl.forEach((ln) => { page.drawText(ln, { x: M + 17, y, size: titleSize, font: bold, color: NAVY }); y -= titleSize + 3; });
    y -= 3;
    bl.forEach((ln) => { page.drawText(ln, { x: M + 17, y, size: 9.8, font: reg, color: INK }); y -= 13; });
    y -= 15;
  };

  const bullet = (t, mark = "•") => {
    const ls = wrap(t, reg, 10, COL - 15);
    need(ls.length * 13.4 + 5);
    page.drawText(mark, { x: M, y, size: 10, font: bold, color: GOLD });
    ls.forEach((ln) => { page.drawText(ln, { x: M + 14, y, size: 10, font: reg, color: INK }); y -= 13.4; });
    y -= 4;
  };

  /** Checkbox row for things to gather. */
  const check = (t) => {
    const ls = wrap(t, reg, 10, COL - 20);
    need(ls.length * 13.4 + 5);
    page.drawRectangle({ x: M, y: y - 1, width: 8.5, height: 8.5, borderColor: NAVY2, borderWidth: 1, color: WHITE });
    ls.forEach((ln) => { page.drawText(ln, { x: M + 18, y, size: 10, font: reg, color: INK }); y -= 13.4; });
    y -= 4;
  };

  // ======================================================== page 1
  newPage(true);

  const meta = [["PREPARED FOR", lead.parentName], ["CHILD", lead.childName],
                ["WHERE", [lead.city, lead.state].filter(Boolean).join(", ")]];
  let mx = M;
  for (const [k, v] of meta) {
    page.drawText(k, { x: mx, y, size: 7.5, font: bold, color: MUTED });
    page.drawText(safe(v || "—").slice(0, 32), { x: mx, y: y - 15, size: 11.5, font: reg, color: NAVY });
    mx += COL / 3;
  }
  y -= 34;
  page.drawLine({ start: { x: M, y }, end: { x: PW - M, y }, thickness: 0.75, color: LINE });
  y -= 24;

  page.drawText(safe(`This plan focuses on: ${lead.focus}`), { x: M, y, size: 10.5, font: italic, color: NAVY2 });
  y -= 24;

  H("WHERE YOU ARE RIGHT NOW", 46);
  const bits = [(PROVIDERS[lead.providers] || {}).label, (COPING[lead.coping] || {}).label,
                (TRIGGERS[lead.trigger] || {}).label, (TIMING[lead.timing] || {}).label].filter(Boolean);
  P(`You told us: ${bits.join("  ·  ")}`, { font: bold, color: NAVY, size: 10.3, gap: 6 });
  P(lead.situationLine, { gap: 11 });

  callout("START HERE", lead.firstMove.step, lead.firstMove.detail);

  H("THEN, IN THIS ORDER", hStep(lead.steps[0].t, lead.steps[0].d));
  lead.steps.forEach((s, i) => step(i + 1, s.t, s.d));
  y -= 4;

  const sayLede = "Word for word, so you do not have to compose it in the moment.";
  H("WHAT TO SAY", hLede(sayLede) + hCallout(lead.scripts[0].who, `"${lead.scripts[0].say}"`, "", 10.4));
  P(sayLede, { size: 9.6, color: MUTED, gap: 10 });
  for (const sc of lead.scripts) callout(safe(sc.who).toUpperCase(), `"${sc.say}"`, "", { titleSize: 10.4 });

  const qLede = "Three is realistic in a short visit. Pick the three that matter most and ask them first.";
  H("QUESTIONS FOR YOUR NEXT APPOINTMENT", hLede(qLede) + hBullet(lead.questions[0]) + hBullet(lead.questions[1]));
  P(qLede, { size: 9.6, color: MUTED, gap: 10 });
  for (const q of lead.questions) bullet(q);
  y -= 6;

  H("WHAT TO HAVE READY", hCheck(lead.gather[0]) + hCheck(lead.gather[1]));
  for (const g of lead.gather) check(g);
  y -= 6;

  H("WORTH KNOWING", hBullet(lead.watchouts[0]));
  for (const w of lead.watchouts) bullet(w);
  y -= 6;

  H("YOUR FIRST THIRTY DAYS", lead.map.reduce((a, m) => a + hMapRow(m), 0));
  const weeks = ["Week 1", "Week 2", "Weeks 3–4"];
  lead.map.forEach((m, i) => {
    const ls = wrap(m, reg, 10, COL - 74);
    need(Math.max(ls.length * 13.4, 16) + 8);
    page.drawText(weeks[i] || `Step ${i + 1}`, { x: M, y, size: 9.5, font: bold, color: NAVY2 });
    ls.forEach((ln) => { page.drawText(ln, { x: M + 72, y, size: 10, font: reg, color: INK }); y -= 13.4; });
    y -= 7;
  });
  y -= 6;

  H("FREE GUIDES ON THESE EXACT STEPS", 30 * lead.resources.length);
  for (const r of lead.resources) {
    need(26);
    page.drawText(safe(r.t), { x: M, y, size: 10.2, font: bold, color: NAVY });
    y -= 12.5;
    const url = r.s.startsWith("..")
      ? `clearpathpediatrics.com/${r.s.replace("../", "")}`
      : `clearpathpediatrics.com/blog/${r.s}`;
    page.drawText(url, { x: M, y, size: 9, font: reg, color: MUTED });
    y -= 17;
  }
  y -= 8;

  // ---- closing band: flows with the content, never painted over it --------
  const BANDH = 82;
  need(BANDH + 30);
  const by = y - BANDH + 10;
  page.drawRectangle({ x: M, y: by, width: COL, height: BANDH, color: NAVY });
  page.drawRectangle({ x: M, y: by + BANDH - 4, width: COL, height: 4, color: GOLD });
  page.drawText("This plan is yours to keep — no strings attached.",
    { x: M + 22, y: by + 52, size: 12.5, font: bold, color: WHITE });
  page.drawText(safe("Want an RN to build the full version with you? The first 30-minute call is free,"),
    { x: M + 22, y: by + 34, size: 9.6, font: reg, color: rgb(0.812, 0.878, 0.949) });
  page.drawText(safe("with no pitch — and we will tell you honestly if we are not the right fit."),
    { x: M + 22, y: by + 21, size: 9.6, font: reg, color: rgb(0.812, 0.878, 0.949) });
  page.drawText("clearpathpediatrics.com  |  admin@clearpathpediatrics.com  |  (949) 416-5447",
    { x: M + 22, y: by + 7, size: 8.4, font: reg, color: GOLD });

  // ---- per-page footer ----------------------------------------------------
  const disclaimer = safe("ClearPath Pediatrics provides care navigation and education only — not medical advice, diagnosis, or treatment. For emergencies, call 911.");
  pages.forEach((p, i) => {
    p.drawText(disclaimer, { x: M, y: 34, size: 7.4, font: reg, color: MUTED });
    const lbl = `${i + 1} of ${pages.length}`;
    p.drawText(lbl, { x: PW - M - reg.widthOfTextAtSize(lbl, 7.4), y: 34, size: 7.4, font: reg, color: MUTED });
  });

  doc.setTitle("Care Navigation Starter Plan — ClearPath Pediatrics");
  doc.setProducer("ClearPath Pediatrics");
  return Buffer.from(await doc.save());
}
