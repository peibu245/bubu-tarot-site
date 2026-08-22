import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";
const DIRECTORY = process.env.BUBU_CONTACT_IMAGE_DIR || "/data/contact-images";
const allowed = /^[a-f0-9-]+\.(?:jpg|jpeg|png|webp)$/i;
const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(request: Request) {
  const file = new URL(request.url).searchParams.get("file") || "";
  if (!allowed.test(file)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(join(DIRECTORY, file));
    const ext = file.split(".").pop()?.toLowerCase() || "jpg";
    return new Response(new Uint8Array(body), { headers: { "content-type": types[ext] || "application/octet-stream", "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
