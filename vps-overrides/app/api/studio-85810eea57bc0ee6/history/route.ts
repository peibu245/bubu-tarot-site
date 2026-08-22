import { isAdminSession } from "../../../vps-auth";
import { listSiteContentHistory, restoreSiteContentHistory } from "../../../../lib/site-content";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.PUBLIC_ORIGIN;
  if (!origin || !configuredOrigin) return false;
  try { return new URL(origin).origin === new URL(configuredOrigin).origin; }
  catch { return false; }
}

export async function GET() {
  if (!(await isAdminSession())) return json({ error: "请先登录" }, 401);
  try { return json({ revisions: await listSiteContentHistory() }); }
  catch { return json({ error: "读取历史版本失败" }, 500); }
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) return json({ error: "请先登录" }, 401);
  if (!sameOrigin(request)) return json({ error: "请求来源无效" }, 403);
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) return json({ error: "缺少版本编号" }, 400);
    const content = await restoreSiteContentHistory(body.id, "private-admin");
    return json({ content });
  } catch { return json({ error: "恢复版本失败" }, 400); }
}
