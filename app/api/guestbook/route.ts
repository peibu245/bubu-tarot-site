import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isAdminSession } from "../../vps-auth";

export const dynamic = "force-dynamic";
const FILE = process.env.BUBU_GUESTBOOK_FILE || "/data/guestbook.json";
const BLOCKED = ["裸聊", "约炮", "色情", "成人视频", "性交", "强奸", "援交", "包养", "嫖娼", "卖淫", "成人视频", "成人视频", "裸照", "裸体", "操你", "傻逼", "妈的", "法轮功"];
type Entry = { id: string; nickname: string; message: string; createdAt: string; day: string; visitorHash: string };

const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });
const publicEntry = (entry: Entry) => ({ id: entry.id, nickname: entry.nickname, message: entry.message, createdAt: entry.createdAt });
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });

async function readEntries(): Promise<Entry[]> {
  try { const data = JSON.parse(await readFile(FILE, "utf8")); return Array.isArray(data.entries) ? data.entries : []; } catch { return []; }
}
async function saveEntries(entries: Entry[]) {
  await mkdir(dirname(FILE), { recursive: true });
  const temporary = `${FILE}.tmp`;
  await writeFile(temporary, `${JSON.stringify({ entries: entries.slice(0, 500) }, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, FILE);
}
function visitorHash(request: Request, visitor: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  return createHash("sha256").update(`${forwarded}|${visitor}|${process.env.ADMIN_SESSION_SECRET || "bubu"}`).digest("hex");
}
function hasBlockedContent(value: string) { return BLOCKED.some((word) => value.toLowerCase().includes(word.toLowerCase())) || /https?:\/\/|www\.|\b(?:vx|v信|微信|telegram)\b/i.test(value); }

export async function GET() { const entries = await readEntries(); return json({ entries: entries.slice(0, 80).map(publicEntry) }); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nickname = cleanText(body.nickname, 20) || "匿名访客";
    const message = cleanText(body.message, 240);
    const visitor = cleanText(body.visitorKey, 80);
    if (!message || !visitor) return json({ error: "请写下留言后再发布。" }, 400);
    if (hasBlockedContent(`${nickname} ${message}`)) return json({ error: "这条留言包含不适合公开展示的内容，请调整后再发。" }, 400);
    const entries = await readEntries(); const hash = visitorHash(request, visitor); const day = today();
    if (entries.filter((entry) => entry.visitorHash === hash && entry.day === day).length >= 10) return json({ error: "你今天已经发布了 10 条留言，明天再来吧。" }, 429);
    const entry: Entry = { id: randomUUID(), nickname, message, createdAt: new Date().toISOString(), day, visitorHash: hash };
    await saveEntries([entry, ...entries]); return json({ entry: publicEntry(entry) }, 201);
  } catch { return json({ error: "留言发布失败，请稍后重试。" }, 400); }
}

export async function DELETE(request: Request) {
  if (!(await isAdminSession())) return json({ error: "请先登录后台" }, 401);
  const origin = request.headers.get("origin"); if (!origin || origin !== process.env.PUBLIC_ORIGIN) return json({ error: "请求来源无效" }, 403);
  const id = new URL(request.url).searchParams.get("id"); if (!id) return json({ error: "缺少留言编号" }, 400);
  const entries = await readEntries(); await saveEntries(entries.filter((entry) => entry.id !== id)); return json({ ok: true });
}
