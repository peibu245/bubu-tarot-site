import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isAdminSession } from "../../../vps-auth";

const DIRECTORY = process.env.BUBU_CONTACT_IMAGE_DIR || "/data/contact-images";
const MAX_BYTES = 6 * 1024 * 1024;
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.PUBLIC_ORIGIN;
  if (!origin || !configuredOrigin) return false;
  try { return new URL(origin).origin === new URL(configuredOrigin).origin; } catch { return false; }
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) return json({ error: "请先登录后台" }, 401);
  if (!sameOrigin(request)) return json({ error: "请求来源无效" }, 403);
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "没有选择图片" }, 400);
    const ext = extensions[file.type];
    if (!ext) return json({ error: "只支持 JPG、PNG、WEBP" }, 400);
    if (file.size <= 0 || file.size > MAX_BYTES) return json({ error: "图片需小于 6MB" }, 400);
    const name = `${randomUUID()}.${ext}`;
    await mkdir(DIRECTORY, { recursive: true });
    await writeFile(join(DIRECTORY, name), Buffer.from(await file.arrayBuffer()), { mode: 0o600 });
    return json({ url: `/api/contact-image?file=${encodeURIComponent(name)}` }, 201);
  } catch { return json({ error: "上传失败" }, 400); }
}
