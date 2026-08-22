import { isAdminSession } from "../../../vps-auth";
import { saveSiteContent } from "../../../../lib/site-content";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.PUBLIC_ORIGIN;
  if (!origin || !configuredOrigin) return false;
  try {
    return new URL(origin).origin === new URL(configuredOrigin).origin;
  } catch {
    return false;
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) return json({ error: "请先登录" }, 401);
  if (!sameOrigin(request)) return json({ error: "请求来源无效" }, 403);

  try {
    const payload = await request.json();
    const content = await saveSiteContent(payload, "private-admin");
    return json({ content });
  } catch {
    return json({ error: "保存失败" }, 400);
  }
}
