/**
 * ClearPath Pediatrics — email + storage infrastructure for the lead funnel.
 *
 * Env (Netlify → Site configuration → Environment variables):
 *   RESEND_API_KEY       required to send
 *   CPP_FROM_EMAIL       verified Resend sender
 *   CPP_ALERT_EMAIL      where lead alerts go
 *   CPP_ADMIN_TOKEN      guards the pipeline dashboard
 *   CPP_POSTAL_ADDRESS   optional; omitted from the footer when unset
 */
import { getStore } from "@netlify/blobs";

export const SITE = "https://clearpathpediatrics.com";
export const CAL  = "https://calendly.com/clearpathpediatrics/30min";
export const PHONE = "(949) 416-5447";

export const FROM     = process.env.CPP_FROM_EMAIL  || "ClearPath Pediatrics <admin@clearpathpediatrics.com>";
export const ALERT_TO = process.env.CPP_ALERT_EMAIL || "admin@clearpathpediatrics.com";
export const POSTAL   = process.env.CPP_POSTAL_ADDRESS || "";

export const leadStore        = () => getStore({ name: "cpp-leads", consistency: "strong" });
export const suppressionStore = () => getStore({ name: "cpp-suppression", consistency: "strong" });
export const emailKey = (e) => String(e || "").trim().toLowerCase();

export async function isSuppressed(email) {
  try { return (await suppressionStore().get(emailKey(email))) !== null; } catch { return false; }
}
export async function suppress(email, reason = "unsubscribe") {
  await suppressionStore().set(emailKey(email), JSON.stringify({ reason, at: new Date().toISOString() }));
}

export const esc = (s = "") => String(s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

/** Send via Resend. Never throws — a delivery failure must not lose the lead. */
export async function sendEmail({ to, subject, html, text, replyTo, attachments, tag }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "RESEND_API_KEY not set" };
  if (await isSuppressed(to)) return { sent: false, error: "recipient suppressed" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: [to], subject, html, text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments?.length ? { attachments } : {}),
        ...(tag ? { tags: [{ name: "flow", value: tag }] } : {}),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { sent: false, error: body.message || `resend ${res.status}` };
    return { sent: true, id: body.id };
  } catch (e) { return { sent: false, error: String(e.message || e) }; }
}

/* Pediatrics brand: navy #0b2240 / #16335f, gold #e3a458, cream #faf7f2.
   Header and CTA bands are deliberately dark so Apple Mail's dark mode
   inversion leaves them looking as intended. */
const HEAD = `
<style>
 body{margin:0;background:#faf7f2;color:#1d2b3f;line-height:1.62;
   font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
 .wrap{max-width:620px;margin:0 auto;padding:24px 16px 36px}
 .shell{border-radius:18px;overflow:hidden;border:1px solid #e8dfd2}
 .hdr{background:#0b2240;padding:24px 30px;text-align:center}
 .hdr img{height:88px;width:auto;border:0;display:inline-block}
 .hdr .tag{margin:10px 0 0;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#e3a458}
 .card{background:#fff;padding:30px 30px 34px}
 h1{font-size:23px;line-height:1.25;color:#0b2240;margin:0 0 15px;font-weight:700}
 h2{font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;color:#7a6a55;margin:28px 0 12px;font-weight:700}
 p{font-size:15.5px;color:#374d68;margin:0 0 14px}
 ul{margin:0 0 16px;padding-left:0;list-style:none}
 li{position:relative;padding:0 0 11px 22px;font-size:15.5px;color:#374d68}
 li:before{content:"—";position:absolute;left:0;color:#e3a458;font-weight:700}
 .btn{display:inline-block;background:#16335f;color:#fff !important;text-decoration:none;font-weight:700;
      font-size:15px;padding:13px 26px;border-radius:999px;margin:6px 0 4px}
 .step{background:#faf7f2;border-left:3px solid #e3a458;border-radius:0 12px 12px 0;padding:16px 20px;margin:4px 0 18px}
 .step b{display:block;color:#0b2240;font-size:16px;margin-bottom:6px}
 .band{background:#16335f;padding:26px 30px;text-align:center}
 .band p{color:#cfe0f2;font-size:15px;margin:0 0 16px}
 .band .btn{background:#e3a458;color:#0b2240 !important}
 .sig{margin-top:26px;font-size:15px;color:#374d68}
 .foot{margin-top:20px;padding:0 10px;font-size:11.5px;color:#9a8b78;line-height:1.65}
 .foot a{color:#9a8b78}
 @media(max-width:520px){.card,.hdr,.band{padding-left:20px;padding-right:20px}}
</style>`;

export const ctaBand = (text, href, label) =>
  `<div class="band"><p>${esc(text)}</p><a class="btn" href="${href}">${esc(label)}</a></div>`;

export function layout({ body, unsubUrl, preheader = "", band = "" }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">${HEAD}</head><body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>` : ""}
<div class="wrap"><div class="shell">
  <div class="hdr">
    <img src="${SITE}/assets/logo-white-420.png" width="71" height="88" alt="ClearPath Pediatrics">
    <p class="tag">Clarity for families, confidence between visits</p></div>
  <div class="card">${body}</div>${band}
</div>
<div class="foot">
  ClearPath Pediatrics, LLC · care navigation and education only — not medical advice, diagnosis or treatment.<br>
  For emergencies call 911.${POSTAL ? "<br>" + esc(POSTAL) : ""}<br>
  ${unsubUrl ? `<a href="${unsubUrl}">Unsubscribe</a> — one click, and it stops everything.` : ""}
</div></div></body></html>`;
}

export const unsubUrlFor = (email) =>
  `${SITE}/.netlify/functions/unsubscribe?e=${encodeURIComponent(emailKey(email))}`;

const ENT = {"&nbsp;":" ","&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'",
  "&ldquo;":'"',"&rdquo;":'"',"&rsquo;":"'","&mdash;":"—","&ndash;":"–","&rarr;":"→"};

export const toText = (html) => html
  .replace(/<style[\s\S]*?<\/style>|<head[\s\S]*?<\/head>/gi,"")
  .replace(/<li[^>]*>/gi,"\n- ").replace(/<br\s*\/?>/gi,"\n")
  .replace(/<\/(p|h1|h2|h3|div|li)>/gi,"\n").replace(/<[^>]+>/g,"")
  .replace(/&[a-z#0-9]+;/gi,(m)=>ENT[m.toLowerCase()] ?? m)
  .split("\n").map(l=>l.replace(/[ \t]+/g," ").trim()).join("\n")
  .replace(/\n{3,}/g,"\n\n").trim();
