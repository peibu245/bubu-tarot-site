"use client";
/* User-managed image URLs cannot be predeclared for Next image optimization. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import type { RichContentBlock } from "../lib/content-types";

const allowedTags = new Set(["P","BR","STRONG","B","EM","I","U","S","MARK","H2","H3","H4","UL","OL","LI","BLOCKQUOTE","A","CODE","PRE","HR","SPAN","DIV"]);
const allowedAttrs = new Set(["href","target","rel","class"]);

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}

function safeHref(value: string) { return /^(https?:\/\/|mailto:|\/|#)/i.test(value.trim()) ? value.trim() : ""; }
function safeImage(value: string) { return /^(https?:\/\/|\/)/i.test(value.trim()) ? value.trim() : ""; }

function sanitizeHtml(input: string) {
  if (typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<div id="root">${input}</div>`, "text/html");
  const root = doc.querySelector("#root");
  if (!root) return "";
  for (const node of Array.from(root.querySelectorAll("*"))) {
    if (!allowedTags.has(node.tagName)) { node.replaceWith(...Array.from(node.childNodes)); continue; }
    for (const attr of Array.from(node.attributes)) if (!allowedAttrs.has(attr.name.toLowerCase())) node.removeAttribute(attr.name);
    if (node.hasAttribute("href")) {
      const href = safeHref(node.getAttribute("href") || "");
      if (href) node.setAttribute("href", href); else node.removeAttribute("href");
    }
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") node.setAttribute("rel", "noreferrer noopener");
    if (node.hasAttribute("class")) node.setAttribute("class", (node.getAttribute("class") || "").replace(/[^a-zA-Z0-9_\- ]/g, "").slice(0, 120));
  }
  return root.innerHTML;
}

function markdownToHtml(markdown: string) {
  const escaped = escapeHtml(markdown.replace(/\r\n/g, "\n"));
  const lines = escaped.split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const inline = (value: string) => value
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*|#[^\s)]*)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeList(); continue; }
    if (line.startsWith("### ")) { closeList(); out.push(`<h4>${inline(line.slice(4))}</h4>`); continue; }
    if (line.startsWith("## ")) { closeList(); out.push(`<h3>${inline(line.slice(3))}</h3>`); continue; }
    if (line.startsWith("# ")) { closeList(); out.push(`<h2>${inline(line.slice(2))}</h2>`); continue; }
    if (line.startsWith("> ")) { closeList(); out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); continue; }
    if (/^-\s+/.test(line)) { if (list !== "ul") { closeList(); list = "ul"; out.push("<ul>"); } out.push(`<li>${inline(line.replace(/^-\s+/, ""))}</li>`); continue; }
    if (/^\d+\.\s+/.test(line)) { if (list !== "ol") { closeList(); list = "ol"; out.push("<ol>"); } out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`); continue; }
    closeList(); out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("");
}

function RichHtml({ value, mode = "markdown", className = "" }: { value: string; mode?: "markdown" | "html"; className?: string }) {
  const markdownHtml = useMemo(() => mode === "markdown" ? markdownToHtml(value) : "", [mode, value]);
  const [sanitized, setSanitized] = useState({ source: "", html: "" });
  useEffect(() => {
    if (mode !== "html") return;
    const timer = window.setTimeout(() => setSanitized({ source: value, html: sanitizeHtml(value) }), 0);
    return () => window.clearTimeout(timer);
  }, [value, mode]);
  const html = mode === "html" ? (sanitized.source === value ? sanitized.html : "") : markdownHtml;
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function ModuleView({ block }: { block: RichContentBlock }) {
  if (block.kind === "divider") return <div className="content-module module-divider">{block.label && <span>{block.label}</span>}</div>;
  if (block.kind === "heading") return <section className="content-module module-heading">{block.label && <p className="micro-label">{block.label}</p>}<h2>{block.content}</h2>{block.secondary && <p>{block.secondary}</p>}</section>;
  if (block.kind === "notice") return <aside className="content-module module-notice">{block.label && <b>{block.label}</b>}<RichHtml value={block.content} mode={block.mode} /></aside>;
  if (block.kind === "button") {
    const href = safeHref(block.url);
    return <section className="content-module module-button">{block.content && <p>{block.content}</p>}{href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener">{block.label || "打开链接"}　↗</a> : <span className="module-disabled-link">{block.label || "链接待补充"}</span>}</section>;
  }
  if (block.kind === "image") {
    const src = safeImage(block.url);
    if (!src) return null;
    return <figure className="content-module module-image"><img src={src} alt={block.label || ""} />{block.content && <figcaption>{block.content}</figcaption>}</figure>;
  }
  if (block.kind === "columns") return <section className="content-module module-columns">{block.label && <h3>{block.label}</h3>}<div><RichHtml value={block.content} mode={block.mode} /><RichHtml value={block.secondary} mode={block.mode} /></div></section>;
  if (block.kind === "faq") return <section className="content-module module-faq">{block.label && <h3>{block.label}</h3>}<div>{block.items.map((item) => <details key={item.id}><summary>{item.title}</summary><RichHtml value={item.body} /></details>)}</div></section>;
  return <article className="custom-content-block"><RichHtml value={block.content} mode={block.mode} /></article>;
}

export default function CustomContentZone({ blocks, page, slot }: { blocks: RichContentBlock[]; page: RichContentBlock["page"]; slot: RichContentBlock["slot"] }) {
  const visible = useMemo(() => blocks.filter((block) => block.visible && block.page === page && block.slot === slot), [blocks, page, slot]);
  if (!visible.length) return null;
  return <section className={`custom-content-zone custom-content-${slot}`}>{visible.map((block) => <ModuleView block={block} key={block.id} />)}</section>;
}
