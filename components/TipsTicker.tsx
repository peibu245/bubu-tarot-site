"use client";

import { useEffect, useMemo, useState } from "react";
import type { KnowledgeCard } from "../lib/content-types";

type Copy = Record<string, string>;
const t = (copy: Copy, key: string, fallback: string) => copy[key] || fallback;
const STORAGE_KEY = "bubu-tips-v10";

type Bag = { ids: string[]; cursor: number };

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function validBag(raw: unknown, ids: string[]): Bag | null {
  if (!raw || typeof raw !== "object") return null;
  const bag = raw as Partial<Bag>;
  if (!Array.isArray(bag.ids) || typeof bag.cursor !== "number") return null;
  const expected = new Set(ids);
  if (expected.size !== ids.length || bag.ids.length !== ids.length || new Set(bag.ids).size !== ids.length || bag.ids.some((id) => typeof id !== "string" || !expected.has(id))) return null;
  return { ids: bag.ids, cursor: Math.max(0, Math.min(ids.length, Math.floor(bag.cursor))) };
}

export default function TipsTicker({ cards, copy }: { cards: KnowledgeCard[]; copy: Copy }) {
  const tips = useMemo(() => cards.filter((card) => card.visible && (card.body.trim() || card.title.trim())), [cards]);
  const ids = useMemo(() => tips.map((tip) => tip.id), [tips]);
  const [currentId, setCurrentId] = useState<string | null>(tips[0]?.id ?? null);
  const [changing, setChanging] = useState(false);

  function nextTip(immediate = false) {
    if (!tips.length) return;
    let bag: Bag | null = null;
    try { bag = validBag(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"), ids); } catch { bag = null; }
    if (!bag || bag.cursor >= bag.ids.length) bag = { ids: shuffle(ids), cursor: 0 };
    const id = bag.ids[bag.cursor] || ids[0];
    bag.cursor += 1;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bag)); } catch { /* localStorage can be unavailable in strict privacy modes */ }
    if (immediate) setCurrentId(id);
    else {
      setChanging(true);
      window.setTimeout(() => { setCurrentId(id); setChanging(false); }, 135);
    }
  }

  useEffect(() => { nextTip(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ids.join("|")]);

  if (!tips.length) return null;
  const current = tips.find((tip) => tip.id === currentId) || tips[0];
  const text = current.title.trim() ? `${current.title.trim()}：${current.body.trim()}` : current.body.trim();

  return (
    <aside className="tips-strip" aria-label={t(copy, "tipsAria", "随机小提示")}>
      <span className="tips-label"><i aria-hidden="true">✦</i>{t(copy, "tipsLabel", "TIPS")}</span>
      <p className={changing ? "is-changing" : ""}>{text}</p>
      <button type="button" onClick={() => nextTip(false)}>{t(copy, "tipsChange", "换一个 ↻")}</button>
    </aside>
  );
}
