"use client";

import { FormEvent, useEffect, useState } from "react";

type Entry = { id: string; nickname: string; message: string; createdAt: string };
const visitorKeyName = "bubu_guestbook_visitor";

function visitorKey() {
  let key = window.localStorage.getItem(visitorKeyName);
  if (!key) { key = crypto.randomUUID(); window.localStorage.setItem(visitorKeyName, key); }
  return key;
}

export default function Guestbook({ copy = {}, compact = false }: { copy?: Record<string, string>; compact?: boolean }) {
  const t = (key: string, fallback: string) => copy[key] || fallback;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(() => t("guestbookLoading", "加载留言中…"));
  const [sending, setSending] = useState(false);

  useEffect(() => { fetch("/api/guestbook", { cache: "no-store" }).then((r) => r.json()).then((data) => { setEntries(data.entries ?? []); setStatus(""); }).catch(() => setStatus(t("guestbookLoadError", "留言板暂时无法加载。"))); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true); setStatus("");
    try {
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nickname, message, visitorKey: visitorKey() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "发送失败");
      setEntries((items) => [data.entry, ...items].slice(0, 80)); setMessage(""); setStatus(t("guestbookSent", "已发布。今天还可以再留几条。"));
    } catch (error) { setStatus(error instanceof Error ? error.message : t("guestbookSendError", "发送失败，请稍后重试。")); }
    finally { setSending(false); }
  }

  const visibleEntries = compact ? entries.slice(0, 3) : entries;
  const form = <form className="guestbook-form" onSubmit={submit}>
    <label>{t("guestbookNicknameLabel", "署名（可选）")}<input value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} placeholder={t("guestbookNicknamePlaceholder", "匿名访客")} /></label>
    <label>{t("guestbookMessageLabel", "留言")}<textarea value={message} maxLength={240} required onChange={(e) => setMessage(e.target.value)} placeholder={t("guestbookMessagePlaceholder", "写下你的话…")} rows={4} /></label>
    <div><small>{message.length}/240</small><button className="primary-action" disabled={sending} type="submit">{sending ? t("guestbookSending", "发送中…") : t("guestbookSubmit", "发布留言")}</button></div>
    {status && <p className="guestbook-status">{status}</p>}
  </form>;

  return <section className={`guestbook ${compact ? "guestbook-compact" : ""}`} id="guestbook">
    <div className="guestbook-intro"><p className="micro-label">{t("guestbookEyebrow", "MESSAGE BOARD")}</p><h2>{t("guestbookTitle", "留一页话")}</h2><p>{t("guestbookLead", "可以聊卡牌、分享抽卡感受，或留下想看的内容。")}</p></div>
    <p className="guestbook-public-note">留言会公开显示，请使用昵称，别写联系方式、私人对话或他人隐私，也请避免露骨、攻击性或引流内容。</p>
    {compact ? <details className="guestbook-compose"><summary>想留一句话</summary>{form}</details> : form}
    <div className="guestbook-list">
      {visibleEntries.map((entry) => <article key={entry.id}><div><b>{entry.nickname}</b><time>{new Date(entry.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</time></div><p>{entry.message}</p></article>)}
      {!entries.length && !status && <p className="guestbook-empty">{t("guestbookEmpty", "还没有留言。你可以写第一条。")}</p>}
    </div>
  </section>;
}
