"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; nickname: string; message: string; createdAt: string };

export default function GuestbookManager() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState("加载中…");
  useEffect(() => { fetch("/api/guestbook", { cache: "no-store" }).then((r) => r.json()).then((data) => { setEntries(data.entries ?? []); setStatus(""); }).catch(() => setStatus("留言加载失败。")); }, []);
  async function remove(id: string) {
    if (!window.confirm("确定删除这条留言吗？")) return;
    const response = await fetch(`/api/guestbook?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setEntries((items) => items.filter((entry) => entry.id !== id)); else setStatus("删除失败，请重试。");
  }
  return <section className="editor-section guestbook-manager"><div className="editor-title"><div><span>10 / GUESTBOOK</span><h2>留言板管理</h2></div></div><p className="manager-hint">公开留言会先经过基础过滤。这里只显示最新 80 条；删除后无法恢复。</p>{status && <p className="editor-empty">{status}</p>}<div className="manager-entries">{entries.map((entry) => <article key={entry.id}><div><b>{entry.nickname}</b><time>{new Date(entry.createdAt).toLocaleString("zh-CN")}</time><button type="button" onClick={() => remove(entry.id)}>删除</button></div><p>{entry.message}</p></article>)}</div></section>;
}
