"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SiteContent } from "../../lib/content-types";
import CollapsiblePanel from "./CollapsiblePanel";

type Revision = { id: string; createdAt: string; updatedBy: string };

function displayTime(value: string) {
  try { return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return value; }
}

export default function HistoryPanel({ setContent }: { setContent: Dispatch<SetStateAction<SiteContent>> }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "restoring" | "error">("idle");
  const [message, setMessage] = useState("");

  async function load() {
    setState("loading");
    try {
      const response = await fetch("/api/studio-85810eea57bc0ee6/history", { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      const data = await response.json() as { revisions: Revision[] };
      setRevisions(data.revisions || []);
      setState("idle");
    } catch { setState("error"); setMessage("历史版本暂时读取失败。"); }
  }

  useEffect(() => {
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("bubu-content-saved", refresh);
    return () => window.removeEventListener("bubu-content-saved", refresh);
  }, []);

  async function restore(revision: Revision) {
    if (!window.confirm(`恢复到 ${displayTime(revision.createdAt)} 的版本？\n\n当前版本会先自动备份，所以之后仍然可以恢复回来。`)) return;
    setState("restoring");
    setMessage("");
    try {
      const response = await fetch("/api/studio-85810eea57bc0ee6/history", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: revision.id }),
      });
      if (!response.ok) throw new Error("restore failed");
      const data = await response.json() as { content: SiteContent };
      setContent(data.content);
      window.dispatchEvent(new CustomEvent("bubu-content-saved", { detail: data.content.pageText }));
      setMessage("已恢复并发布该版本。刚才的当前版本也已自动备份。");
      await load();
    } catch { setState("error"); setMessage("恢复失败，没有改动当前公开内容。"); }
    finally { setState((current) => current === "error" ? current : "idle"); }
  }

  return (
    <CollapsiblePanel label="03 / HISTORY" title="历史版本与回滚"><section className="editor-section history-panel">
      <div className="editor-title"><div><span>03 / HISTORY</span><h2>历史版本与回滚</h2></div><button className="admin-add" type="button" onClick={() => void load()} disabled={state === "loading"}>刷新版本</button></div>
      <p className="manager-hint">每次发布前都会先保存上一版。这里最多保留最近 30 个版本；恢复某一版时，当前版本也会先备份，因此可以反悔。</p>
      {message && <p className={state === "error" ? "history-message is-error" : "history-message"}>{message}</p>}
      <div className="history-list">
        {revisions.length ? revisions.map((revision, index) => (
          <article key={revision.id}>
            <div><b>{index === 0 ? "最近上一版" : `历史 #${index + 1}`}</b><time>{displayTime(revision.createdAt)}</time><small>{revision.updatedBy}</small></div>
            <button type="button" disabled={state === "restoring"} onClick={() => void restore(revision)}>恢复这一版</button>
          </article>
        )) : <p className="editor-empty">{state === "loading" ? "正在读取历史版本…" : "目前还没有历史版本。第一次修改并发布后，这里就会开始记录。"}</p>}
      </div>
    </section></CollapsiblePanel>
  );
}
