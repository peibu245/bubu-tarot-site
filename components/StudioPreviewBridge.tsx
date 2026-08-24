"use client";

import { useEffect } from "react";
import type { PageTextStyle, TypographySettings } from "../lib/content-types";
import { fontStack } from "../lib/typography";

type DraftMessage = {
  type: "bubu-preview:update";
  pageText: Record<string, string>;
  baseline: Record<string, string>;
  keys: string[];
  typography?: TypographySettings;
  fieldStyles?: Record<string, PageTextStyle>;
  scope?: string;
};

const candidateSelector = "h1,h2,h3,h4,p,a,button,span,strong,b,small,i,li,label";
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

export default function StudioPreviewBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("studio-preview") !== "1") return;

    document.documentElement.classList.add("studio-preview-active");
    const style = document.createElement("style");
    style.dataset.studioPreview = "true";
    style.textContent = `
      .studio-preview-active [data-studio-key]{cursor:pointer!important;outline:1px dashed rgba(111,83,127,.28);outline-offset:3px;transition:outline-color .15s,background .15s}
      .studio-preview-active [data-studio-key]:hover{outline:2px solid #6f537f;background:rgba(111,83,127,.08)!important}
      .studio-preview-badge{position:fixed;z-index:2147483647;left:12px;bottom:12px;padding:8px 11px;border-radius:999px;background:#2e2930;color:#fff;font:11px/1.2 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.2);pointer-events:none}
    `;
    document.head.appendChild(style);
    const badge = document.createElement("div");
    badge.className = "studio-preview-badge";
    badge.textContent = "草稿实时预览 · 点文字定位";
    document.body.appendChild(badge);

    const mapping = new Map<string, HTMLElement[]>();
    let lastKeys = "";
    let currentBaseline: Record<string, string> = {};
    let lastMessage: DraftMessage | null = null;
    let remapTimer: number | null = null;

    function findElements(key: string, used: Set<HTMLElement>, scope?: string) {
      const explicit = Array.from(document.querySelectorAll<HTMLElement>(`[data-copy-key="${CSS.escape(key)}"]`)).filter((element) => !used.has(element));
      if (explicit.length) return explicit;
      const initial = normalize(currentBaseline[key] || "");
      if (!initial) return [] as HTMLElement[];
      let root: ParentNode = document;
      const chromeKey = key === "siteBrand" || key.startsWith("nav") || key.startsWith("footer");
      if (scope === "global" && chromeKey) {
        const real = Array.from(document.querySelectorAll<HTMLElement>(candidateSelector)).filter((element) => element.closest(".public-header") || element.closest(".public-footer"));
        return real.filter((element) => !used.has(element) && element.childElementCount === 0 && normalize(element.textContent || "") === initial);
      }
      if (scope === "contact") root = document.querySelector(".contact-panel") || document.querySelector("main.public-page") || document;
      else root = document.querySelector("main.public-page") || document;
      return Array.from(root.querySelectorAll<HTMLElement>(candidateSelector))
        .filter((element) => !used.has(element) && element.childElementCount === 0 && normalize(element.textContent || "") === initial)
        .filter((element) => !element.closest(".public-header") && !element.closest(".public-footer"))
        .slice(0, 1);
    }

    function apply(message: DraftMessage) {
      lastMessage = message;
      currentBaseline = message.baseline || {};
      const signature = message.keys.join("|");
      if (signature !== lastKeys) {
        for (const elements of mapping.values()) for (const element of elements) element.removeAttribute("data-studio-key");
        mapping.clear();
        const used = new Set<HTMLElement>();
        for (const key of message.keys) {
          const elements = findElements(key, used, message.scope);
          if (!elements.length) continue;
          for (const element of elements) { used.add(element); element.dataset.studioKey = key; }
          mapping.set(key, elements);
        }
        lastKeys = signature;
      }
      for (const [key, elements] of mapping) {
        const next = message.pageText[key];
        if (typeof next !== "string") continue;
        for (const element of elements) {
          if (element.textContent !== next) element.textContent = next;
          const fieldStyle = message.fieldStyles?.[key] || {};
          if (!element.dataset.copyBaseFontSize) element.dataset.copyBaseFontSize = getComputedStyle(element).fontSize;
          element.style.setProperty("display", fieldStyle.hidden ? "none" : "", fieldStyle.hidden ? "important" : "");
          element.style.setProperty("font-family", fieldStyle.font ? fontStack(fieldStyle.font) : "", fieldStyle.font ? "important" : "");
          element.style.setProperty("font-size", fieldStyle.sizeScale !== undefined ? `${Number.parseFloat(element.dataset.copyBaseFontSize) * fieldStyle.sizeScale}px` : "", fieldStyle.sizeScale !== undefined ? "important" : "");
          element.style.setProperty("letter-spacing", fieldStyle.letterSpacing !== undefined ? `${fieldStyle.letterSpacing}em` : "", fieldStyle.letterSpacing !== undefined ? "important" : "");
        }
      }
      if (message.typography) {
        const root = document.querySelector<HTMLElement>(".public-page");
        if (root) {
          const scale = Math.min(1.2, Math.max(.9, message.typography.bodyScale));
          root.style.setProperty("--reader-heading-font", fontStack(message.typography.headingFont));
          root.style.setProperty("--reader-body-font", fontStack(message.typography.bodyFont));
          root.style.setProperty("--reader-ui-font", fontStack(message.typography.uiFont));
          root.style.setProperty("--reader-heading-weight", String(Math.min(800, Math.max(400, message.typography.headingWeight))));
          root.style.setProperty("--reader-heading-letter-spacing", `${Math.min(.12, Math.max(-.06, message.typography.headingLetterSpacing))}em`);
          root.style.setProperty("--reader-body-weight", String(Math.min(600, Math.max(300, message.typography.bodyWeight))));
          root.style.setProperty("--reader-copy-size-offset", `${Math.round((scale - 1) * 160) / 10}px`);
          root.style.setProperty("--reader-copy-letter-spacing", `${Math.min(.12, Math.max(0, message.typography.letterSpacing))}em`);
          root.style.setProperty("--reader-copy-line-height", String(Math.min(2.25, Math.max(1.5, message.typography.lineHeight))));
        }
      }
    }

    function augmentMapping(message: DraftMessage) {
      lastMessage = message;
      currentBaseline = message.baseline || {};

      for (const [key, elements] of mapping) {
        const attached = elements.filter((element) => document.contains(element));
        if (attached.length) mapping.set(key, attached);
        else mapping.delete(key);
      }

      const used = new Set<HTMLElement>();
      for (const elements of mapping.values()) for (const element of elements) used.add(element);

      for (const key of message.keys) {
        const elements = findElements(key, used, message.scope);
        if (!elements.length) continue;
        for (const element of elements) {
          used.add(element);
          element.dataset.studioKey = key;
        }
        const existing = mapping.get(key) || [];
        mapping.set(key, [...existing, ...elements]);
      }

      for (const [key, elements] of mapping) {
        const next = message.pageText[key];
        if (typeof next !== "string") continue;
        for (const element of elements) if (element.textContent !== next) element.textContent = next;
      }
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; key?: unknown; position?: unknown; pageText?: Record<string, string>; baseline?: Record<string, string>; keys?: string[]; fieldStyles?: Record<string, PageTextStyle> };
      if (data?.type === "bubu-preview:focus" && typeof data.key === "string") {
        const target = mapping.get(data.key)?.find((element) => document.contains(element));
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (data?.type === "bubu-preview:scroll" && (data.position === "top" || data.position === "bottom")) {
        window.scrollTo({ top: data.position === "top" ? 0 : document.documentElement.scrollHeight, behavior: "smooth" });
        return;
      }
      if (data?.type === "bubu-preview:update" && data.pageText && data.baseline && Array.isArray(data.keys)) apply(data as DraftMessage);
    }

    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-studio-key]") : null;
      if (target?.dataset.studioKey) {
        event.preventDefault(); event.stopPropagation();
        window.parent.postMessage({ type: "bubu-preview:select", key: target.dataset.studioKey }, window.location.origin);
        return;
      }
      if (event.target instanceof Element && event.target.closest("a")) { event.preventDefault(); event.stopPropagation(); }
    }

    const observer = new MutationObserver((mutations) => {
      const structuralChange = mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some((node) => node.nodeType === Node.ELEMENT_NODE),
      );
      if (!structuralChange || !lastMessage || remapTimer !== null) return;
      remapTimer = window.setTimeout(() => {
        remapTimer = null;
        if (!lastMessage) return;
        augmentMapping(lastMessage);
      }, 20);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    window.parent.postMessage({ type: "bubu-preview:ready" }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      observer.disconnect();
      if (remapTimer !== null) window.clearTimeout(remapTimer);
      style.remove(); badge.remove(); document.documentElement.classList.remove("studio-preview-active");
    };
  }, []);

  return null;
}
