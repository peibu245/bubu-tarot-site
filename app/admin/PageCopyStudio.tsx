"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, DragEvent, SetStateAction } from "react";
import type { RichBlockKind, RichContentBlock, RichContentItem, SiteContent } from "../../lib/content-types";
import { copyPages } from "../../lib/page-copy-schema";
import CollapsiblePanel from "./CollapsiblePanel";

const makeId = (prefix = "block") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const pageLabels: Record<RichContentBlock["page"], string> = {
  home: "首页", dream: "梦向解读", reality: "现实问题咨询", ideas: "奇思妙想", booking: "预约页", notes: "抽一张", policies: "政策总页",
};

const moduleKinds: Array<{ value: RichBlockKind; label: string; note: string }> = [
  { value: "richText", label: "富文本", note: "Markdown / 安全 HTML，自由度最高" },
  { value: "heading", label: "标题区", note: "小标签 + 大标题 + 说明" },
  { value: "notice", label: "提示框", note: "适合注意事项、活动说明" },
  { value: "button", label: "按钮 / 链接", note: "一段说明 + 一个操作按钮" },
  { value: "image", label: "图片", note: "图片 + 替代文字 + 图注" },
  { value: "columns", label: "双栏文字", note: "左右两栏内容" },
  { value: "faq", label: "FAQ", note: "可折叠问答列表" },
  { value: "divider", label: "分隔线", note: "可带一个小标题" },
];

function pageForModules(id: string): RichContentBlock["page"] | null {
  return (["home", "dream", "reality", "ideas", "booking", "notes", "policies"] as const).includes(id as RichContentBlock["page"])
    ? id as RichContentBlock["page"] : null;
}

function newBlock(page: RichContentBlock["page"], kind: RichBlockKind = "richText"): RichContentBlock {
  return {
    id: makeId(), page, slot: "afterHero", name: "新内容模块", kind, mode: "markdown", content: kind === "richText" ? "## 新内容\n\n在这里写正文。" : "",
    secondary: "", label: "", url: "", items: kind === "faq" ? [{ id: makeId("faq"), title: "一个常见问题", body: "这里写回答。" }] : [], visible: true,
  };
}

export default function PageCopyStudio({ content, setContent }: { content: SiteContent; setContent: Dispatch<SetStateAction<SiteContent>> }) {
  const [activeId, setActiveId] = useState("home");
  const [query, setQuery] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [mode, setMode] = useState<"fields" | "json" | "blocks">("fields");
  const [previewReady, setPreviewReady] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [baselinePageText, setBaselinePageText] = useState<Record<string, string>>(() => ({ ...content.pageText }));
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activePage = copyPages.find((page) => page.id === activeId) ?? copyPages[0];
  const modulePage = pageForModules(activeId);
  const activeBlocks = useMemo(() => modulePage ? content.richBlocks.filter((block) => block.page === modulePage) : [], [content.richBlocks, modulePage]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activePage.fields;
    return activePage.fields.filter((field) => `${field.label} ${field.key} ${content.pageText[field.key] ?? ""}`.toLowerCase().includes(q));
  }, [activePage, content.pageText, query]);

  const [previewPath, previewHash = ""] = activePage.path.split("#");
  const previewSrc = `${previewPath}?studio-preview=1${previewHash ? `#${previewHash}` : ""}`;
  const previewMessage = useMemo(() => ({
    type: "bubu-preview:update" as const,
    pageText: content.pageText,
    baseline: baselinePageText,
    keys: activePage.fields.map((field) => field.key),
    typography: content.typography,
    scope: activePage.id,
  }), [activePage, baselinePageText, content.pageText, content.typography]);

  function postPreview() {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(previewMessage, window.location.origin);
  }

  useEffect(() => { if (previewReady) postPreview(); }, [previewMessage, previewReady]);
  useEffect(() => {
    const syncBaseline = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, string>>).detail;
      if (detail && typeof detail === "object") setBaselinePageText({ ...detail });
      setPreviewReady(false);
      iframeRef.current?.contentWindow?.location.reload();
    };
    window.addEventListener("bubu-content-saved", syncBaseline);
    return () => window.removeEventListener("bubu-content-saved", syncBaseline);
  }, []);
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "bubu-preview:ready") { setPreviewReady(true); window.setTimeout(postPreview, 20); }
      if (event.data?.type === "bubu-preview:select" && typeof event.data.key === "string") {
        const key = event.data.key;
        if (!activePage.fields.some((field) => field.key === key)) return;
        setMode("fields"); setQuery("");
        window.setTimeout(() => document.querySelector<HTMLElement>(`[data-copy-field-key="${CSS.escape(key)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [activePage]);

  const patchText = (key: string, value: string) => setContent((current) => ({ ...current, pageText: { ...current.pageText, [key]: value } }));
  const patchBlock = (id: string, patch: Partial<RichContentBlock>) => setContent((current) => ({ ...current, richBlocks: current.richBlocks.map((block) => block.id === id ? { ...block, ...patch } : block) }));

  async function copyCurrentJson() {
    const payload = Object.fromEntries(activePage.fields.map((field) => [field.key, content.pageText[field.key] ?? ""]));
    const text = JSON.stringify(payload, null, 2); setBulkText(text);
    try { await navigator.clipboard.writeText(text); setBulkStatus("当前页 JSON 已复制。"); } catch { setBulkStatus("JSON 已放进下方文本框，可以手动复制。"); }
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(bulkText) as Record<string, unknown>;
      const allowed = new Set(activePage.fields.map((field) => field.key));
      const patch = Object.fromEntries(Object.entries(parsed).filter(([key, value]) => allowed.has(key) && typeof value === "string")) as Record<string, string>;
      setContent((current) => ({ ...current, pageText: { ...current.pageText, ...patch } }));
      setBulkStatus(`已导入 ${Object.keys(patch).length} 个字段；右侧预览会立即更新。`);
    } catch { setBulkStatus("JSON 格式不对。请确认最外层是 { \"字段\": \"文字\" }。"); }
  }

  function addBlock(kind: RichBlockKind = "richText") {
    if (!modulePage) return;
    setContent((current) => ({ ...current, richBlocks: [...current.richBlocks, newBlock(modulePage, kind)] }));
    setMode("blocks");
  }

  function moveBlock(id: string, direction: -1 | 1) {
    if (!modulePage) return;
    setContent((current) => {
      const pageIds = current.richBlocks.filter((b) => b.page === modulePage).map((b) => b.id);
      const local = pageIds.indexOf(id); const targetLocal = local + direction;
      if (local < 0 || targetLocal < 0 || targetLocal >= pageIds.length) return current;
      const targetId = pageIds[targetLocal];
      const array = [...current.richBlocks]; const from = array.findIndex((b) => b.id === id); const to = array.findIndex((b) => b.id === targetId);
      const [moved] = array.splice(from, 1); array.splice(to, 0, moved);
      return { ...current, richBlocks: array };
    });
  }

  function dropBlock(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    if (!draggedId || draggedId === targetId || !modulePage) return setDraggedId(null);
    setContent((current) => {
      const array = [...current.richBlocks]; const from = array.findIndex((b) => b.id === draggedId); const targetBeforeMove = array.findIndex((b) => b.id === targetId);
      if (from < 0 || targetBeforeMove < 0 || array[from].page !== modulePage || array[targetBeforeMove].page !== modulePage) return current;
      const [moved] = array.splice(from, 1);
      const targetAfterMove = array.findIndex((b) => b.id === targetId);
      array.splice(targetAfterMove < 0 ? array.length : targetAfterMove, 0, moved);
      return { ...current, richBlocks: array };
    });
    setDraggedId(null);
  }

  function patchFaq(block: RichContentBlock, itemId: string, patch: Partial<RichContentItem>) {
    patchBlock(block.id, { items: block.items.map((item) => item.id === itemId ? { ...item, ...patch } : item) });
  }

  return (
    <CollapsiblePanel label="02 / COPY" title="页面文案与模块"><section className="editor-section copy-studio-section">
      <div className="editor-title studio-title">
        <div><span>02 / CONTENT STUDIO</span><h2>页面文案工作台</h2></div>
        <a className="admin-preview-link" href={activePage.path} target="_blank" rel="noreferrer">打开正式页面 ↗</a>
      </div>
      <p className="manager-hint">左边改，右边直接看草稿。预览里的可编辑文字会有虚线提示；点右侧文字，会自动定位到左侧对应字段。模块编辑器支持拖动排序，富文本继续支持 Markdown / 安全 HTML。</p>

      <div className="copy-studio-shell">
        <aside className="copy-page-tabs" aria-label="页面列表">
          {copyPages.map((page) => <button type="button" className={page.id === activeId ? "active" : ""} onClick={() => { setActiveId(page.id); setQuery(""); setBulkStatus(""); setPreviewReady(false); }} key={page.id}><b>{page.title}</b><small>{page.path}</small></button>)}
        </aside>

        <div className="copy-studio-main">
          <div className="copy-studio-head">
            <div><h3>{activePage.title}</h3><p>{activePage.note}</p></div>
            <div className="copy-mode-tabs">
              <button className={mode === "fields" ? "active" : ""} type="button" onClick={() => setMode("fields")}>逐项编辑</button>
              <button className={mode === "json" ? "active" : ""} type="button" onClick={() => setMode("json")}>批量 JSON</button>
              <button className={mode === "blocks" ? "active" : ""} type="button" onClick={() => setMode("blocks")}>模块编辑</button>
            </div>
          </div>

          <div className="studio-live-layout">
            <div className="studio-edit-pane">
              {mode === "fields" && <>
                <div className="copy-search-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、按钮、字段名或当前文字…" /><span>{filtered.length} / {activePage.fields.length}</span></div>
                <div className="copy-field-list">
                  {filtered.map((field) => {
                    const value = content.pageText[field.key] ?? "";
                    const multiline = field.multiline || value.length > 54 || value.includes("\n");
                    return <label className="copy-field" data-copy-field-key={field.key} key={field.key}><span><b>{field.label}</b><code>{field.key}</code></span>{field.hint && <small>{field.hint}</small>}{multiline ? <textarea rows={Math.min(7, Math.max(3, value.split("\n").length + 2))} value={value} onChange={(event) => patchText(field.key, event.target.value)} /> : <input value={value} onChange={(event) => patchText(field.key, event.target.value)} />}</label>;
                  })}
                </div>
              </>}

              {mode === "json" && <div className="bulk-editor">
                <div className="bulk-actions"><button type="button" onClick={copyCurrentJson}>复制当前页 JSON</button><button type="button" onClick={() => setBulkText(JSON.stringify(content.pageText, null, 2))}>放入全站文案 JSON</button><button className="primary-admin" type="button" onClick={applyJson}>应用到当前页</button></div>
                <textarea rows={24} spellCheck={false} value={bulkText} onChange={(event) => setBulkText(event.target.value)} placeholder={'{\n  "homeTitle": "你想写的标题",\n  "homeLead": "正文……"\n}'} />
                <p>{bulkStatus || "只会导入当前页面已经登记的文字字段；多余字段会忽略，不会执行代码。"}</p>
              </div>}

              {mode === "blocks" && <div className="rich-block-editor">
                {!modulePage ? <p className="editor-empty">“{activePage.title}”属于全站/弹窗文案，没有页面内容插槽。切换到首页、梦向、现实、奇思妙想、预约、抽一张或政策页后即可添加模块。</p> : <>
                  <div className="rich-block-intro"><div><h4>{pageLabels[modulePage]} · 模块</h4><p>拖动卡片左上角的 ⠿ 就能调整顺序。模块可以放在主视觉之后或页脚之前；富文本仍可直接粘 Markdown / 安全 HTML。</p></div><div className="module-add-menu"><select id="module-kind-picker" defaultValue="richText">{moduleKinds.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><button className="admin-add" type="button" onClick={() => { const select = document.getElementById("module-kind-picker") as HTMLSelectElement | null; addBlock((select?.value || "richText") as RichBlockKind); }}>＋ 添加模块</button></div></div>
                  <div className="editor-cards module-editor-cards">
                    {activeBlocks.length ? activeBlocks.map((block, index) => <article className={`editor-card rich-block-card ${draggedId === block.id ? "is-dragging" : ""}`} key={block.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropBlock(event, block.id)}>
                      <div className="card-admin-top module-card-top"><div><span className="drag-handle" title="拖动排序" draggable onDragStart={() => setDraggedId(block.id)} onDragEnd={() => setDraggedId(null)}>⠿</span><b>#{String(index + 1).padStart(2, "0")} · {block.name}</b></div><div><button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index === activeBlocks.length - 1}>↓</button><button type="button" onClick={() => setContent((current) => ({ ...current, richBlocks: current.richBlocks.filter((item) => item.id !== block.id) }))}>删除</button></div></div>
                      <div className="form-grid">
                        <label>内部名称<input value={block.name} onChange={(event) => patchBlock(block.id, { name: event.target.value })} /></label>
                        <label>模块类型<select value={block.kind} onChange={(event) => patchBlock(block.id, { kind: event.target.value as RichBlockKind })}>{moduleKinds.map((item) => <option value={item.value} key={item.value}>{item.label} · {item.note}</option>)}</select></label>
                        <label>插入位置<select value={block.slot} onChange={(event) => patchBlock(block.id, { slot: event.target.value as RichContentBlock["slot"] })}><option value="afterHero">页面开头 / 主视觉之后</option><option value="beforeFooter">页尾 / 页脚之前</option></select></label>
                        {(block.kind === "richText" || block.kind === "notice" || block.kind === "columns") && <label>内容格式<select value={block.mode} onChange={(event) => patchBlock(block.id, { mode: event.target.value as RichContentBlock["mode"] })}><option value="markdown">Markdown / 普通文本</option><option value="html">安全 HTML</option></select></label>}

                        {block.kind === "richText" && <label className="wide">内容<textarea className="code-textarea" rows={12} spellCheck={false} value={block.content} onChange={(event) => patchBlock(block.id, { content: event.target.value })} /></label>}
                        {block.kind === "heading" && <><label>英文小字 / 标签<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label><label className="wide">大标题<input value={block.content} onChange={(event) => patchBlock(block.id, { content: event.target.value })} /></label><label className="wide">说明<textarea rows={4} value={block.secondary} onChange={(event) => patchBlock(block.id, { secondary: event.target.value })} /></label></>}
                        {block.kind === "notice" && <><label className="wide">提示框标题<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label><label className="wide">提示内容<textarea className={block.mode === "html" ? "code-textarea" : ""} rows={8} value={block.content} onChange={(event) => patchBlock(block.id, { content: event.target.value })} /></label></>}
                        {block.kind === "button" && <><label>按钮文字<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label><label>链接<input value={block.url} onChange={(event) => patchBlock(block.id, { url: event.target.value })} placeholder="https://… 或 /booking" /></label><label className="wide">按钮上方说明<textarea rows={3} value={block.content} onChange={(event) => patchBlock(block.id, { content: event.target.value })} /></label></>}
                        {block.kind === "image" && <><label className="wide">图片地址<input value={block.url} onChange={(event) => patchBlock(block.id, { url: event.target.value })} placeholder="https://… 或 /images/example.jpg" /></label><label>图片替代文字<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label><label>图注<input value={block.content} onChange={(event) => patchBlock(block.id, { content: event.target.value })} /></label></>}
                        {block.kind === "columns" && <><label className="wide">双栏标题<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label><label>左栏<textarea rows={8} value={block.content} onChange={(event) => patchBlock(block.id, { content: event.target.value })} /></label><label>右栏<textarea rows={8} value={block.secondary} onChange={(event) => patchBlock(block.id, { secondary: event.target.value })} /></label></>}
                        {block.kind === "faq" && <label className="wide">FAQ 区标题<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label>}
                        {block.kind === "divider" && <label className="wide">分隔线小标题（可留空）<input value={block.label} onChange={(event) => patchBlock(block.id, { label: event.target.value })} /></label>}
                      </div>
                      {block.kind === "faq" && <div className="faq-editor-list">{block.items.map((item, itemIndex) => <div className="faq-editor-row" key={item.id}><label>问题 {itemIndex + 1}<input value={item.title} onChange={(event) => patchFaq(block, item.id, { title: event.target.value })} /></label><label>回答<textarea rows={3} value={item.body} onChange={(event) => patchFaq(block, item.id, { body: event.target.value })} /></label><button type="button" onClick={() => patchBlock(block.id, { items: block.items.filter((row) => row.id !== item.id) })}>删除问答</button></div>)}<button className="admin-add" type="button" onClick={() => patchBlock(block.id, { items: [...block.items, { id: makeId("faq"), title: "新问题", body: "" }] })}>＋ 添加问答</button></div>}
                      <div className="check-row"><label><input type="checkbox" checked={block.visible} onChange={(event) => patchBlock(block.id, { visible: event.target.checked })} /> 对访客显示</label></div>
                    </article>) : <p className="editor-empty">这个页面还没有自定义模块。可以从上方选择“标题区 / 富文本 / 图片 / FAQ”等模块开始。</p>}
                  </div>
                </>}
              </div>}
            </div>

            <aside className="studio-preview-pane">
              <div className="studio-preview-toolbar"><div><b>实时草稿</b><span>{previewReady ? "已连接" : "加载中…"}</span></div><button type="button" onClick={() => { setPreviewReady(false); iframeRef.current?.contentWindow?.location.reload(); }}>刷新预览</button></div>
              <div className="studio-device-frame"><iframe ref={iframeRef} key={previewSrc} src={previewSrc} title={`${activePage.title}草稿预览`} onLoad={() => { setPreviewReady(true); window.setTimeout(postPreview, 40); }} /></div>
              <p>这里显示的是你尚未发布的文字草稿。价格、活动和新建模块仍以“保存并发布”后的正式页面为准；模块卡片本身可以在左侧直接编辑和排序。</p>
            </aside>
          </div>
        </div>
      </div>
    </section></CollapsiblePanel>
  );
}
