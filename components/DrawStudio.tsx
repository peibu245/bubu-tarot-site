"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { CardFact } from "../lib/content-types";
import { drawDeckOptions, lenormandCards, rwsCards, type DrawCardMeta, type DrawDeckId } from "../lib/card-decks";

type Copy = Record<string, string>;
const t = (copy: Copy, key: string, fallback: string) => copy[key] || fallback;

type FanPoint = { index: number; x: number; y: number; rotation: number; shuffleX: number; shuffleY: number; shuffleRotation: number };
type FanStyle = CSSProperties & { "--x": string; "--y": string; "--rot": string; "--sx": string; "--sy": string; "--srot": string; "--delay": string };
type Bag = { order: number[]; cursor: number };

const deckCopyKeys: Record<DrawDeckId, { label: string; subtitle: string }> = {
  rws: { label: "deckRwsLabel", subtitle: "deckRwsSubtitle" },
  lenormand: { label: "deckLenormandLabel", subtitle: "deckLenormandSubtitle" },
  marseille: { label: "deckMarseilleLabel", subtitle: "deckMarseilleSubtitle" },
  thoth: { label: "deckThothLabel", subtitle: "deckThothSubtitle" },
};

function deckText(copy: Copy, id: DrawDeckId, fallbackLabel: string, fallbackSubtitle: string) {
  const keys = deckCopyKeys[id];
  return { label: t(copy, keys.label, fallbackLabel), subtitle: t(copy, keys.subtitle, fallbackSubtitle) };
}

function shuffleOrder(count: number): number[] {
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
  }
  return order;
}

function readBag(id: DrawDeckId, count: number): Bag {
  const key = `bubu-draw-v10:${id}`;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null") as Partial<Bag> | null;
    if (raw && Array.isArray(raw.order) && typeof raw.cursor === "number" && raw.order.length === count) {
      const valid = new Set(raw.order).size === count && raw.order.every((value) => Number.isInteger(value) && value >= 0 && value < count);
      if (valid) return { order: raw.order, cursor: Math.max(0, Math.min(count, Math.floor(raw.cursor))) };
    }
  } catch { /* ignore invalid local state */ }
  return { order: shuffleOrder(count), cursor: 0 };
}

function saveBag(id: DrawDeckId, bag: Bag) {
  try { localStorage.setItem(`bubu-draw-v10:${id}`, JSON.stringify(bag)); } catch { /* ignore */ }
}

function makeFan(visibleCount: number, seed: number, mobile: boolean): FanPoint[] {
  return Array.from({ length: visibleCount }, (_, index) => {
    const progress = visibleCount <= 1 ? 0.5 : index / (visibleCount - 1);
    const normalized = progress * 2 - 1;
    const arc = Math.cos(normalized * Math.PI / 2);
    const jitter = Math.sin((index + 1) * 4.731 + seed * 1.81);
    // The fan intentionally extends beyond the frame. We render a beautiful window
    // into the deck rather than forcing every physical card to fit on screen.
    const x = (mobile ? 12 : 18) + progress * (mobile ? 76 : 64);
    const y = (mobile ? 70 : 68) - arc * (mobile ? 18 : 28) + jitter * 0.35;
    const rotation = (mobile ? -22 : -28) + progress * (mobile ? 44 : 56) + jitter * 0.5;
    const angle = progress * Math.PI * 2 + seed * 0.61;
    const radius = (mobile ? 40 : 60) + ((jitter + 1) / 2) * (mobile ? 40 : 60);
    return {
      index, x, y, rotation,
      shuffleX: Math.cos(angle) * radius,
      shuffleY: Math.sin(angle) * radius * 0.5,
      shuffleRotation: rotation + jitter * 80 + (index % 2 ? 40 : -40),
    };
  });
}

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 680px)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return mobile;
}

function pickFact(facts: CardFact[], cardId: string, reset = false) {
  const list = facts.filter((fact) => fact.visible && fact.cardId === cardId && fact.text.trim());
  if (!list.length) return null;
  const key = `bubu-fact-v10:${cardId}`;
  let bag: { ids: string[]; cursor: number } | null = null;
  try { bag = reset ? null : JSON.parse(localStorage.getItem(key) || "null"); } catch { bag = null; }
  const ids = list.map((fact) => fact.id);
  const valid = bag && Array.isArray(bag.ids) && typeof bag.cursor === "number" && bag.ids.length === ids.length && new Set(bag.ids).size === ids.length && bag.ids.every((id) => ids.includes(id));
  if (!valid || !bag || bag.cursor >= bag.ids.length) bag = { ids: shuffleOrder(ids.length).map((index) => ids[index]), cursor: 0 };
  const id = bag.ids[bag.cursor] || ids[0]; bag.cursor += 1;
  try { localStorage.setItem(key, JSON.stringify(bag)); } catch { /* ignore */ }
  return list.find((fact) => fact.id === id) || list[0];
}

export default function DrawStudio({ facts, copy }: { facts: CardFact[]; copy: Copy }) {
  const mobile = useMobile();
  const [deckId, setDeckId] = useState<DrawDeckId>("rws");
  const [pickedSlot, setPickedSlot] = useState<number | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<DrawCardMeta | null>(null);
  const [selectedFact, setSelectedFact] = useState<CardFact | null>(null);
  const [factOpen, setFactOpen] = useState(false);
  const [drawToken, setDrawToken] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [shuffling, setShuffling] = useState(false);

  const activeDeck = drawDeckOptions.find((deck) => deck.id === deckId) ?? drawDeckOptions[0];
  const activeDeckText = deckText(copy, activeDeck.id, activeDeck.label, activeDeck.subtitle);
  const totalCount = deckId === "lenormand" ? 36 : 78;
  const visibleCount = deckId === "lenormand" ? (mobile ? 13 : 23) : (mobile ? 15 : 27);
  const fan = useMemo(() => makeFan(visibleCount, shuffleSeed, mobile), [visibleCount, shuffleSeed, mobile]);

  useEffect(() => {
    if (!shuffling) return;
    const timer = window.setTimeout(() => setShuffling(false), 2150);
    return () => window.clearTimeout(timer);
  }, [shuffling, shuffleSeed]);

  function chooseDeck(next: DrawDeckId) {
    const option = drawDeckOptions.find((deck) => deck.id === next);
    if (!option?.available || shuffling) return;
    setDeckId(next); setPickedSlot(null); setSelectedMeta(null); setSelectedFact(null); setFactOpen(false); setDrawToken((value) => value + 1);
  }

  function draw(slot: number) {
    if (shuffling || (deckId !== "rws" && deckId !== "lenormand")) return;
    let bag = readBag(deckId, totalCount);
    if (bag.cursor >= bag.order.length) bag = { order: shuffleOrder(totalCount), cursor: 0 };

    // The shuffled order is the real hidden deck. The place the visitor taps chooses
    // a position from the cards that remain, then that card is removed from this cycle.
    const remaining = bag.order.length - bag.cursor;
    const slotProgress = fan.length <= 1 ? 0 : Math.max(0, Math.min(1, slot / (fan.length - 1)));
    const offset = remaining <= 1 ? 0 : Math.round(slotProgress * (remaining - 1));
    const selectedPosition = bag.cursor + offset;
    const cardIndex = bag.order[selectedPosition];
    [bag.order[bag.cursor], bag.order[selectedPosition]] = [bag.order[selectedPosition], bag.order[bag.cursor]];
    bag.cursor += 1;
    saveBag(deckId, bag);

    const meta = deckId === "rws" ? rwsCards[cardIndex] : lenormandCards[cardIndex];
    setPickedSlot(slot); setSelectedMeta(meta); setSelectedFact(pickFact(facts, meta.id)); setFactOpen(false); setDrawToken((value) => value + 1);
  }

  function shuffle() {
    if (shuffling || (deckId !== "rws" && deckId !== "lenormand")) return;
    saveBag(deckId, { order: shuffleOrder(totalCount), cursor: 0 });
    setPickedSlot(null); setSelectedMeta(null); setSelectedFact(null); setFactOpen(false); setShuffleSeed((value) => value + 1); setShuffling(true);
  }

  function nextFact() {
    if (!selectedMeta) return;
    const next = pickFact(facts, selectedMeta.id);
    if (next) { setSelectedFact(next); setFactOpen(true); }
  }

  const pickedPoint = pickedSlot === null ? null : fan[pickedSlot];
  const drawnStyle = pickedPoint ? ({ "--from-x": `${pickedPoint.x}%`, "--from-y": `${pickedPoint.y}%`, "--from-rot": "0deg" } as CSSProperties) : undefined;
  const factCount = selectedMeta ? facts.filter((fact) => fact.visible && fact.cardId === selectedMeta.id && fact.text.trim()).length : 0;

  return (
    <section className="draw-zone" aria-label={t(copy, "deckAriaLabel", "抽一张看看")}>
      <header className="draw-zone-intro">
        <div><p className="micro-label">{t(copy, "deckEyebrow", "PICK A DECK")}</p><h2>{t(copy, "deckTitle", "选一副牌，随手抽一张")}</h2></div>
        <p>{t(copy, "deckLead", "不用把整副牌挤进屏幕。你看到的是摊开的一个窗口，背后仍然按完整牌组无放回抽取。")}</p>
      </header>

      <nav className="deck-selector" aria-label={t(copy, "deckChooseLabel", "选择牌堆")}>
        {drawDeckOptions.map((deck) => {
          const text = deckText(copy, deck.id, deck.label, deck.subtitle);
          return <button key={deck.id} type="button" className={`deck-choice ${deckId === deck.id ? "is-active" : ""} ${!deck.available ? "is-disabled" : ""}`} onClick={() => chooseDeck(deck.id)} disabled={!deck.available} aria-pressed={deckId === deck.id}>
            <span className={`deck-mini-stack deck-mini-${deck.id}`} aria-hidden="true"><i /><i /><i /></span>
            <span><b>{text.label}</b><small>{text.subtitle}</small></span>
            <em>{deck.available ? `${deck.count} 张` : t(copy, "deckComingSoon", "准备中")}</em>
          </button>;
        })}
      </nav>

      <div className={`draw-table ${shuffling ? "is-shuffling" : ""} deck-${deckId} ${selectedMeta ? "has-result" : ""}`}>
        <div className="draw-table-toolbar">
          <div><span>{activeDeckText.label}</span><small>{activeDeckText.subtitle}</small></div>
          <button type="button" className="shuffle-button" onClick={shuffle} disabled={shuffling || !activeDeck.available}><span aria-hidden="true">↻</span>{shuffling ? t(copy, "deckShuffling", "洗牌中…") : t(copy, "deckShuffle", "洗牌")}</button>
        </div>

        <div className="draw-table-stage" role="group" aria-label={`${activeDeckText.label} ${totalCount} 张牌`}>
          <div className="fan-window" aria-hidden="true">
            {fan.map((item) => {
              const style: FanStyle = {
                "--x": `${item.x}%`, "--y": `${item.y}%`, "--rot": `${item.rotation}deg`, "--sx": `${item.shuffleX.toFixed(1)}px`, "--sy": `${item.shuffleY.toFixed(1)}px`, "--srot": `${item.shuffleRotation.toFixed(1)}deg`, "--delay": `${(item.index % 12) * 0.008}s`, zIndex: item.index + 1,
              };
              return <span key={`${deckId}-${item.index}`} className={`table-card ${pickedSlot === item.index ? "is-picked" : ""}`} style={style}><span className="table-card-pattern" /></span>;
            })}
          </div>
          <div className="fan-hit-grid" aria-label={t(copy, "deckHint", "点牌扇里的任意一张。")}>{Array.from({ length: mobile ? 7 : 11 }, (_, index) => <button key={index} type="button" onClick={() => draw(Math.min(fan.length - 1, Math.round(index / ((mobile ? 7 : 11) - 1) * (fan.length - 1))))} disabled={shuffling} aria-label={`${t(copy, "deckDrawPrefix", "抽取")} ${activeDeckText.label} ${t(copy, "deckDrawSuffix", "中的一张")}`} />)}</div>

          {selectedMeta && pickedPoint && <article key={`${deckId}-${selectedMeta.id}-${drawToken}`} className={`drawn-result ${deckId === "lenormand" ? "is-lenormand" : "is-rws"}`} style={drawnStyle} aria-live="polite">
            <div className="drawn-card-shell">
              <div className="drawn-flip-inner">
                <div className="drawn-card-back"><span className="drawn-card-pattern" /></div>
                <div className="drawn-card-front">{selectedMeta.image && <img src={selectedMeta.image} alt={`${selectedMeta.name} ${selectedMeta.english}`} />}</div>
              </div>
            </div>
            <div className="drawn-card-meta">
              <h3>{selectedMeta.name}</h3>
              <p><span>{selectedMeta.number || selectedMeta.group}</span><small>{selectedMeta.english}</small></p>
            </div>
            <div className={`card-fact ${factOpen ? "is-open" : ""}`}>
              <div className="card-fact-heading"><b>{t(copy, "factTitle", "你知道吗？")}</b>{factOpen && factCount > 1 && <button type="button" onClick={nextFact}>{t(copy, "factNext", "换一个细节 ↻")}</button>}</div>
              {!factOpen ? <button className="fact-spoiler" type="button" onClick={() => setFactOpen(true)} aria-label={t(copy, "factReveal", "点一下揭开")}><span>{t(copy, "factReveal", "点一下揭开")}</span></button> : <div className="fact-revealed"><span>{selectedFact?.text || t(copy, "factEmpty", "这张牌的小细节还在整理中。")}</span><button type="button" onClick={() => setFactOpen(false)}>{t(copy, "factHide", "收起")}</button></div>}
            </div>
          </article>}
        </div>

        <p className="draw-table-hint">{shuffling ? t(copy, "deckShuffleHint", "收牌、洗散，再重新摊开。") : selectedMeta ? t(copy, "deckAfterDrawHint", "想继续就再点一张；主动洗牌会把本轮已经抽过的牌重新放回去。") : t(copy, "deckHint", "点牌扇里的任意一张。")}</p>
      </div>

      <details className="card-source-note">
        <summary>{t(copy, "deckSourceSummary", "图像来源与公版说明")}</summary>
        <div>
          <p>{t(copy, "deckSourceRws", "韦特–史密斯使用历史公版图像。")}</p>
          <p>{t(copy, "deckSourceLenormand", "雷诺曼使用 B. Dondorf 19 世纪历史牌组的公版扫描。")}</p>
          <p className="source-links"><a href="https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)" target="_blank" rel="noreferrer">{t(copy, "deckSourceRwsLink", "Waite–Smith source ↗")}</a><a href="https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308).jpg" target="_blank" rel="noreferrer">{t(copy, "deckSourceLenormandLink", "B. Dondorf Lenormand source ↗")}</a></p>
        </div>
      </details>
    </section>
  );
}
