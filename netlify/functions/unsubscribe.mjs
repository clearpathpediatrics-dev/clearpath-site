/** One-click unsubscribe. No confirmation step. RFC 8058 POST supported. */
import { suppress, leadStore, emailKey, esc } from "../lib/shared.mjs";

const page = (title, msg) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)} · ClearPath Pediatrics</title><style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#faf7f2;padding:24px;
 font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#1d2b3f}
.c{max-width:460px;background:#fff;border:1px solid #e8dfd2;border-radius:20px;padding:38px 34px;text-align:center}
h1{font-size:22px;color:#0b2240;margin:0 0 12px}p{font-size:15.5px;color:#5c6b7f;line-height:1.6;margin:0 0 18px}
a{display:inline-block;background:#16335f;color:#fff;text-decoration:none;font-weight:700;font-size:14.5px;padding:12px 24px;border-radius:999px}
</style></head><body><div class="c"><h1>${esc(title)}</h1><p>${esc(msg)}</p>
<a href="https://clearpathpediatrics.com/">Back to the site</a></div></body></html>`;

export default async function handler(req) {
  const url = new URL(req.url);
  let email = emailKey(url.searchParams.get("e") || "");
  if (!email && req.method === "POST") {
    try { const f = await req.formData(); email = emailKey(f.get("e") || f.get("email") || ""); } catch {}
  }
  if (!email || !email.includes("@")) {
    return new Response(page("Link not recognised", "That link is missing an address. Reply to any of our emails with the word stop and we will handle it by hand."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  try {
    await suppress(email, "one-click");
    const store = leadStore(); const raw = await store.get(email);
    if (raw) {
      const l = JSON.parse(raw);
      l.closed = true; l.closedReason = "unsubscribed"; l.nextTouchAt = null;
      (l.history = l.history || []).push({ at: new Date().toISOString(), event: "unsubscribed" });
      await store.set(email, JSON.stringify(l));
    }
  } catch (e) {
    console.error("[unsubscribe]", e);
    return new Response(page("Something went wrong", "We could not process that automatically. Reply to any email with the word stop and it will be done today."),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  if (req.method === "POST") return new Response("unsubscribed", { status: 200 });
  return new Response(page("You are unsubscribed", `${email} will not receive anything further. Nothing else is needed from you.`),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
