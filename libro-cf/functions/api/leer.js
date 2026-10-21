// Beacon from the reader when a chapter is opened: POST /api/leer?c=<chapter id>
import { registrar } from "../_lib.js";

export async function onRequestPost(ctx) {
  const c = (new URL(ctx.request.url).searchParams.get("c") || "").replace(/[^a-z0-9-]/gi, "").slice(0, 20);
  if (c) ctx.waitUntil(registrar(ctx, c));
  return new Response(null, { status: 204 });
}
