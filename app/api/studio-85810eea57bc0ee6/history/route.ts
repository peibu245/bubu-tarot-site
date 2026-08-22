import { getChatGPTUser } from "../../../chatgpt-auth";
import { isOwner, listSiteContentHistory, restoreSiteContentHistory } from "../../../../lib/site-content";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "请先登录" }, 401);
  if (!(await isOwner(user.email))) return json({ error: "没有编辑权限" }, 403);
  try { return json({ revisions: await listSiteContentHistory() }); }
  catch { return json({ error: "读取历史版本失败" }, 500); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "请先登录" }, 401);
  if (!(await isOwner(user.email))) return json({ error: "没有编辑权限" }, 403);
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) return json({ error: "缺少版本编号" }, 400);
    const content = await restoreSiteContentHistory(body.id, user.email);
    return json({ content });
  } catch { return json({ error: "恢复版本失败" }, 400); }
}
