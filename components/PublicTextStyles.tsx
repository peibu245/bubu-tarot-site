"use client";

import { useEffect } from "react";
import type { PageTextStyle } from "../lib/content-types";
import { fontStack } from "../lib/typography";

const candidates = "h1,h2,h3,h4,p,a,button,span,strong,b,small,i,li,label";
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

export default function PublicTextStyles({ pageText, styles }: { pageText: Record<string, string>; styles: Record<string, PageTextStyle> }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("main.public-page");
    if (!root) return;
    const used = new Set<HTMLElement>();
    const touched: HTMLElement[] = [];

    for (const [key, setting] of Object.entries(styles || {})) {
      const text = normalize(pageText[key] || "");
      if (!text) continue;
      const explicit = Array.from(root.querySelectorAll<HTMLElement>(`[data-copy-key="${CSS.escape(key)}"]`)).filter((element) => !used.has(element));
      const matches = explicit.length ? explicit : Array.from(root.querySelectorAll<HTMLElement>(candidates)).filter((element) =>
        !used.has(element) && element.childElementCount === 0 && normalize(element.textContent || "") === text,
      ).slice(0, 1);
      for (const element of matches) {
        used.add(element); touched.push(element);
        element.dataset.copyStyleKey = key;
        element.dataset.copyBaseFontSize = getComputedStyle(element).fontSize;
        if (setting.hidden) element.style.setProperty("display", "none", "important");
        if (setting.font) element.style.setProperty("font-family", fontStack(setting.font), "important");
        if (setting.sizeScale !== undefined) element.style.setProperty("font-size", `${Number.parseFloat(element.dataset.copyBaseFontSize) * setting.sizeScale}px`, "important");
        if (setting.letterSpacing !== undefined) element.style.setProperty("letter-spacing", `${setting.letterSpacing}em`, "important");
      }
    }
    return () => touched.forEach((element) => {
      delete element.dataset.copyStyleKey;
      delete element.dataset.copyBaseFontSize;
      element.style.removeProperty("display"); element.style.removeProperty("font-family");
      element.style.removeProperty("font-size"); element.style.removeProperty("letter-spacing");
    });
  }, [pageText, styles]);
  return null;
}
