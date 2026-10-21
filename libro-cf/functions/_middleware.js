// Counts page visits: GET of the book's HTML only (not images, the stats page or the beacon).
import { registrar } from "./_lib.js";

export async function onRequest(ctx) {
  const res = await ctx.next();
  const { pathname } = new URL(ctx.request.url);
  const html = (res.headers.get("content-type") || "").includes("text/html");
  if (ctx.request.method === "GET" && html && (pathname === "/" || pathname === "/index.html")) {
    ctx.waitUntil(registrar(ctx, null));
  }
  return res;
}
