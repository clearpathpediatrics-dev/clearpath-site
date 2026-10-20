/**
 * ClearPath Pediatrics — the only code that writes sitemap.xml.
 * -------------------------------------------------------------
 * There used to be two: one in the blog generator and a second in
 * build-landing-pages.mjs, each rewriting the whole file from its own list. On
 * three separate occasions one of them silently deleted URLs the other had
 * added. Every script now calls this one.
 *
 * URLs carry the trailing slash because that is the address Netlify answers
 * with 200; the bare form redirects.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE } from "./site-chrome.mjs";
import { LANDING_PAGES } from "./landing-pages.data.mjs";
import { HUBS, hubUrl } from "./hubs.pediatric.mjs";

const GUIDE_SLUG = "pediatric-care-navigation-guide";
const COMPARE_SLUG = "care-navigator-vs-case-manager";

function phoenixToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/**
 * Real last-modified date for a static page, from the file on disk. Claiming
 * today's date for every page on every run teaches Google to ignore the field.
 */
function fileMod(rel, fallback) {
  try { return fs.statSync(path.join(ROOT, rel, "index.html")).mtime.toISOString().slice(0, 10); }
  catch { return fallback; }
}

export function renderSitemap(posts) {
  const today = phoenixToday();
  const page = (rel, pri, freq) => ({ loc: `${SITE}/${rel ? rel + "/" : ""}`, pri, freq, mod: fileMod(rel, today) });
  const staticUrls = [
    { loc: `${SITE}/`, pri: "1.0", freq: "weekly", mod: fileMod("", today) },
    { loc: `${SITE}/blog/`, pri: "0.8", freq: "daily", mod: today },
    page(GUIDE_SLUG, "0.9", "weekly"),
    page(COMPARE_SLUG, "0.7", "monthly"),
    ...LANDING_PAGES.map((p) => page(p.slug, "0.8", "monthly")),
    page("free-care-roadmap", "0.95", "monthly"),
    page("book", "0.9", "monthly"),
    page("is-clearpath-right-for-us", "0.7", "monthly"),
    page("food-allergy-starter-kit", "0.7", "monthly"),
    page("tools", "0.9", "monthly"),
    page("tools/insurance-appeal-letter", "0.9", "monthly"),
    page("tools/iep-meeting-prep", "0.9", "monthly"),
    page("tools/medication-schedule", "0.9", "monthly"),
    ...HUBS.map((h) => ({ loc: `${SITE}${hubUrl(h)}`, pri: "0.8", freq: "weekly", mod: today })),
    page("privacy-policy", "0.3", "yearly"),
    page("terms-of-use", "0.3", "yearly"),
  ];
  const postUrls = posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}/`, pri: "0.6", freq: "monthly", mod: p.modified || p.iso }));
  const rows = [...staticUrls, ...postUrls].map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.mod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function writeSitemap(posts) {
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), renderSitemap(posts));
}
