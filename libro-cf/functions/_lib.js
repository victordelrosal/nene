// Shared: write one visit row. Never throws into the page response.
export async function registrar(ctx, capitulo) {
  const r = ctx.request, cf = r.cf || {};
  try {
    await ctx.env.DB.prepare(
      "INSERT INTO visitas (ip, pais, ciudad, region, ruta, capitulo, ua, ref) VALUES (?,?,?,?,?,?,?,?)"
    ).bind(
      r.headers.get("cf-connecting-ip") || "", cf.country || "", cf.city || "", cf.region || "",
      new URL(r.url).pathname, capitulo || null,
      (r.headers.get("user-agent") || "").slice(0, 300), (r.headers.get("referer") || "").slice(0, 300)
    ).run();
  } catch (e) { /* the book must load even if logging fails */ }
}
