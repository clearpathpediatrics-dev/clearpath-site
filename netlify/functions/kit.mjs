/**
 * ClearPath Pediatrics — gated digital delivery
 * ---------------------------------------------------------------------------
 * Verifies a real, PAID Stripe Checkout session server-side, then (and only
 * then) serves the purchased kit files. The kit lives in /private, which is
 * hard-404'd as a public path in netlify.toml — this function is the only way
 * to read it.
 *
 * Modes:
 *   GET /.netlify/functions/kit?session_id=cs_...              -> JSON entitlements
 *   GET /.netlify/functions/kit?session_id=cs_...&open=kit     -> serves the kit HTML
 *   GET /.netlify/functions/kit?session_id=cs_...&open=gobag   -> serves the go-bag HTML
 *
 * Required env var (set in Netlify UI → Site config → Environment variables):
 *   STRIPE_SECRET_KEY   — your Stripe SECRET key (sk_live_... / sk_test_...)
 *
 * Price IDs are hardcoded below (they are identifiers, not secrets) so no extra
 * env vars are needed. Each can still be overridden by an env var of the same
 * name if a price is ever replaced:
 *   STRIPE_PRICE_KIT / STRIPE_PRICE_BUMP / STRIPE_PRICE_BUNDLE
 */

import fs from "node:fs";
import path from "node:path";

const FILES = {
  kit:   { rel: "private/kit-food-allergy/index.html", title: "The Food Allergy Starter Kit" },
  gobag: { rel: "private/kit-er-go-bag/index.html",    title: "ER & Urgent Care Go-Bag Checklist" },
};

// Live ClearPath Stripe price IDs (identifiers, not secrets).
const PRICE_IDS = {
  kit:    process.env.STRIPE_PRICE_KIT    || "price_1TwwtfAzFFIaEbIaRkautIts",
  bump:   process.env.STRIPE_PRICE_BUMP   || "price_1Twww1AzFFIaEbIae5AOy4H2",
  bundle: process.env.STRIPE_PRICE_BUNDLE || "", // no bundle product yet
};

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

/** Pull a Stripe Checkout Session (with line items) using the REST API. */
async function getSession(sessionId, key) {
  const url = `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`
            + `?expand[]=line_items&expand[]=line_items.data.price`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { error: `stripe_${res.status}`, detail: detail.slice(0, 400) };
  }
  return { session: await res.json() };
}

/** Decide what this session entitles the buyer to. */
function entitlementsFor(session) {
  const items = session?.line_items?.data || [];
  const owns = new Set();

  const PRICE_KIT    = PRICE_IDS.kit;
  const PRICE_BUMP   = PRICE_IDS.bump;
  const PRICE_BUNDLE = PRICE_IDS.bundle;

  for (const li of items) {
    const priceId = li?.price?.id || "";
    // Product name/description text, lowercased — used only as a fallback when
    // the STRIPE_PRICE_* env vars aren't configured yet.
    const label = `${li?.description || ""} ${li?.price?.nickname || ""}`.toLowerCase();

    if (PRICE_BUNDLE && priceId === PRICE_BUNDLE) { owns.add("kit"); owns.add("gobag"); continue; }
    if (PRICE_KIT    && priceId === PRICE_KIT)    { owns.add("kit");   continue; }
    if (PRICE_BUMP   && priceId === PRICE_BUMP)   { owns.add("gobag"); continue; }

    // Fallback matching (works before price IDs are wired).
    if (/bundle|library/.test(label))            { owns.add("kit"); owns.add("gobag"); }
    else if (/go-?bag|urgent care|\ber\b/.test(label)) { owns.add("gobag"); }
    else if (/starter kit|food allergy/.test(label))   { owns.add("kit"); }
  }

  // A paid session with unrecognized items still gets the front-end product,
  // so a naming change can never leave a real buyer empty-handed.
  if (owns.size === 0) owns.add("kit");
  return owns;
}

export default async (request) => {
  const url = new URL(request.url);
  const sessionId = (url.searchParams.get("session_id") || "").trim();
  const open = (url.searchParams.get("open") || "").trim();

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return json(500, { ok: false, error: "not_configured",
      message: "STRIPE_SECRET_KEY is not set in this site's Netlify environment variables." });
  }
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return json(400, { ok: false, error: "bad_session_id" });
  }

  const { session, error, detail } = await getSession(sessionId, key);
  if (error) return json(502, { ok: false, error, detail });

  // The gate: Stripe itself must say this was paid.
  const paid = session.payment_status === "paid"
            || session.status === "complete" && session.payment_status !== "unpaid";
  if (!paid) {
    return json(402, { ok: false, error: "not_paid", payment_status: session.payment_status || null });
  }

  const owns = entitlementsFor(session);

  // ---- serve a purchased file ----
  if (open) {
    if (!FILES[open])   return json(404, { ok: false, error: "unknown_item" });
    if (!owns.has(open)) return json(403, { ok: false, error: "not_purchased", item: open });

    const abs = path.join(process.cwd(), FILES[open].rel);
    let html;
    try { html = fs.readFileSync(abs, "utf8"); }
    catch { return json(500, { ok: false, error: "file_missing", item: open }); }

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // ---- report entitlements to the access page ----
  return json(200, {
    ok: true,
    email: session.customer_details?.email || null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency || null,
    items: [...owns].map(k => ({ key: k, title: FILES[k].title })),
  });
};
