import { getChatGPTUser } from "../../../chatgpt-auth";
import { isOwner, saveSiteContent } from "../../../../lib/site-content";

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "请先登录" }, 401);
  if (!(await isOwner(user.email))) return json({ error: "没有编辑权限" }, 403);

  try {
    const payload = await request.json();
    const content = await saveSiteContent(payload, user.email);
    return json({ content });
  } catch {
    return json({ error: "保存失败" }, 400);
  }
}
