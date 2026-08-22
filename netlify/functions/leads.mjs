/**
 * Private pipeline board. Token-guarded — this holds family contact details
 * and what parents told us about their children. Fails closed.
 *
 *   /.netlify/functions/leads?token=…            ranked board
 *   /.netlify/functions/leads?token=…&format=csv
 */
import { leadStore, esc } from "../lib/shared.mjs";

const C = { NOW:"#b4451f", SOON:"#16335f", NURTURE:"#5c6b7f", COLD:"#9aa7b5" };

export default async function handler(req) {
  const token = process.env.CPP_ADMIN_TOKEN;
  const given = new URL(req.url).searchParams.get("token");
  if (!token || given !== token) return new Response("Not found", { status: 404 });

  const fmt = new URL(req.url).searchParams.get("format") || "html";
  let leads = [];
  try {
    const store = leadStore();
    const { blobs } = await store.list();
    leads = (await Promise.all((blobs || []).map(async ({ key }) => {
      try { return JSON.parse(await store.get(key)); } catch { return null; }
    }))).filter(Boolean);
  } catch (e) { return new Response(`store error: ${e.message}`, { status: 500 }); }
  leads.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (fmt === "json") return Response.json(leads);
  if (fmt === "csv") {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = ["submitted,score,band,priority,parent,child,email,phone,city,state,need,stage,closed,first_move"]
      .concat(leads.map(l => [l.submittedAt,l.score,l.band,l.priority,l.parentName,l.childName,l.email,
        l.phone,l.city,l.state,l.needLabel,l.stage,l.closed?"yes":"no",l.firstMove].map(q).join(","))).join("\n");
    return new Response(csv, { headers: { "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition":'attachment; filename="clearpath-leads.csv"' } });
  }

  const n = (b) => leads.filter(l => l.band === b).length;
  const rows = leads.map(l => `<tr>
    <td><span class="p" style="background:${C[l.band]||"#9aa7b5"}">${esc(l.band||"?")} ${l.score??""}</span>
        <div class="dim" style="margin-top:5px">${esc(l.priority||"")}</div></td>
    <td><strong>${esc(l.parentName||"—")}</strong><div class="dim">child: ${esc(l.childName||"—")}</div>
        <a href="mailto:${esc(l.email)}">${esc(l.email)}</a>
        ${l.phone?`<div class="dim">${esc(l.phone)}</div>`:""}</td>
    <td>${esc(l.needLabel||"—")}<div class="dim">${esc([l.city,l.state].filter(Boolean).join(", ")||"—")}</div></td>
    <td class="dim">${esc(l.firstMove||"—")}</td>
    <td class="dim">${l.closed?`closed · ${esc(l.closedReason||"")}`:`touch ${l.stage||0}/4`}
        <div>${esc((l.submittedAt||"").slice(0,10))}</div></td></tr>`).join("");

  return new Response(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Family pipeline · ClearPath Pediatrics</title><style>
body{margin:0;background:#faf7f2;color:#1d2b3f;padding:28px 18px;
 font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.w{max-width:1200px;margin:0 auto}h1{font-size:24px;color:#0b2240;margin:0 0 6px}
.sub{color:#5c6b7f;font-size:14px;margin-bottom:20px}
.st{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
.s{background:#fff;border:1px solid #e8dfd2;border-radius:14px;padding:12px 18px;font-size:13px;color:#5c6b7f}
.s b{display:block;font-size:22px;color:#0b2240}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8dfd2;border-radius:14px;overflow:hidden;font-size:14px}
th{background:#0b2240;color:#fff;text-align:left;padding:11px 14px;font-size:12px;letter-spacing:.05em;text-transform:uppercase}
td{padding:13px 14px;border-bottom:1px solid #f1e9dd;vertical-align:top}tr:last-child td{border-bottom:none}
.p{display:inline-block;color:#fff;font-weight:700;font-size:11.5px;padding:4px 11px;border-radius:99px;white-space:nowrap}
.dim{color:#5c6b7f;font-size:12.5px}a{color:#16335f}
</style></head><body><div class="w">
<h1>Family pipeline</h1><p class="sub">${leads.length} famil${leads.length===1?"y":"ies"} · ranked by how much a navigator changes their week, and how soon</p>
<div class="st">
 <div class="s"><b>${n("NOW")}</b>CALL TODAY</div><div class="s"><b>${n("SOON")}</b>SOON</div>
 <div class="s"><b>${n("NURTURE")}</b>NURTURE</div><div class="s"><b>${n("COLD")}</b>COLD</div>
 <div class="s"><b>${leads.filter(l=>!l.closed).length}</b>In sequence</div></div>
${leads.length?`<table><thead><tr><th>Priority</th><th>Family</th><th>Needs / where</th><th>Their first move</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
 :`<p class="dim">No families yet. They appear here the moment someone requests a plan.</p>`}
<p style="margin-top:16px;font-size:13px"><a href="?token=${encodeURIComponent(given)}&format=csv">Download CSV</a></p>
</div></body></html>`, { headers: { "Content-Type":"text/html; charset=utf-8", "X-Robots-Tag":"noindex" } });
}
