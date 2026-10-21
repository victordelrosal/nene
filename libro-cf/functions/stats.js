// Private stats: /stats?k=<STATS_KEY>. Visits, unique IPs, chapter opens, recent visits.
const esc = s => String(s ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const disp = ua => /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /bot|crawl|spider|preview|WhatsApp|facebookexternalhit/i.test(ua) ? "vista previa/bot" : "otro";

export async function onRequestGet(ctx) {
  const k = new URL(ctx.request.url).searchParams.get("k");
  if (!ctx.env.STATS_KEY || k !== ctx.env.STATS_KEY) return new Response("No encontrado", { status: 404 });
  const db = ctx.env.DB;
  const one = q => db.prepare(q).first();
  const all = q => db.prepare(q).all().then(r => r.results);
  const [tot, hoy, ips, caps, porIp, recientes] = await Promise.all([
    one("SELECT COUNT(*) n FROM visitas WHERE capitulo IS NULL"),
    one("SELECT COUNT(*) n FROM visitas WHERE capitulo IS NULL AND ts >= date('now')"),
    one("SELECT COUNT(DISTINCT ip) n FROM visitas"),
    all("SELECT capitulo, COUNT(*) n, COUNT(DISTINCT ip) u FROM visitas WHERE capitulo IS NOT NULL GROUP BY capitulo ORDER BY n DESC"),
    all("SELECT ip, MAX(ciudad) ciudad, MAX(pais) pais, SUM(capitulo IS NULL) visitas, SUM(capitulo IS NOT NULL) capitulos, MIN(ts) primera, MAX(ts) ultima, MAX(ua) ua FROM visitas GROUP BY ip ORDER BY ultima DESC LIMIT 200"),
    all("SELECT ts, ip, ciudad, pais, capitulo, ua FROM visitas ORDER BY id DESC LIMIT 60")
  ]);
  const row = c => `<tr>${c.map(x => `<td>${x}</td>`).join("")}</tr>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Visitas · Mamá Nene</title>
<style>body{font:15px/1.45 system-ui,sans-serif;margin:0;padding:20px;background:#f7f1e5;color:#2b2219}h1{font:500 30px Georgia,serif;margin:0 0 4px}.s{color:#6f6150;margin:0 0 18px}
.k{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}.k div{background:#fff;border-radius:12px;padding:12px 16px;min-width:120px}.k b{display:block;font:600 28px Georgia,serif;color:#a9761f}
h2{font:600 12px system-ui;letter-spacing:.18em;text-transform:uppercase;color:#a9761f;margin:22px 0 8px}.w{overflow-x:auto}table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px}td,th{padding:7px 10px;border-bottom:1px solid #eee3d0;text-align:left;white-space:nowrap;font-size:13px}th{color:#6f6150;font-weight:600}</style></head><body>
<h1>Visitas</h1><p class="s">nene.kluxy.app · horas en UTC · las vistas previas de WhatsApp también cuentan como visita</p>
<div class="k"><div><b>${tot.n}</b>visitas</div><div><b>${hoy.n}</b>hoy</div><div><b>${ips.n}</b>IPs distintas</div></div>
<h2>Capítulos abiertos</h2><div class="w"><table><tr><th>Capítulo</th><th>Veces</th><th>IPs</th></tr>${caps.map(c => row([esc(c.capitulo), c.n, c.u])).join("") || row(["todavía ninguno", "", ""])}</table></div>
<h2>Por IP</h2><div class="w"><table><tr><th>IP</th><th>Lugar</th><th>Visitas</th><th>Capítulos</th><th>Primera</th><th>Última</th><th>Equipo</th></tr>${porIp.map(r => row([esc(r.ip), esc([r.ciudad, r.pais].filter(Boolean).join(", ")), r.visitas, r.capitulos, esc(r.primera), esc(r.ultima), disp(r.ua || "")])).join("")}</table></div>
<h2>Últimas 60</h2><div class="w"><table><tr><th>Hora</th><th>IP</th><th>Lugar</th><th>Qué</th><th>Equipo</th></tr>${recientes.map(r => row([esc(r.ts), esc(r.ip), esc([r.ciudad, r.pais].filter(Boolean).join(", ")), r.capitulo ? "capítulo " + esc(r.capitulo) : "portada", disp(r.ua || "")])).join("")}</table></div>
</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
