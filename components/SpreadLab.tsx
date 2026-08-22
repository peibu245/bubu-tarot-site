"use client";

import { useMemo, useState } from "react";
import type { SpreadGuide, SpreadSystem } from "../lib/content-types";

type Copy = Record<string, string>;
const t = (copy: Copy, key: string, fallback: string) => copy[key] || fallback;

function SpreadDiagram({ spread, active, onPick }: { spread: SpreadGuide; active: number; onPick: (index: number) => void }) {
  return <div className={`spread-diagram layout-${spread.layout}`} aria-label={`${spread.title} 牌位示意`}>
    {spread.positions.map((_, index) => <button key={index} type="button" className={active === index ? "is-active" : ""} onClick={() => onPick(index)} aria-label={`牌位 ${index + 1}`}><span>{index + 1}</span></button>)}
  </div>;
}

export default function SpreadLab({ guides, copy }: { guides: SpreadGuide[]; copy: Copy }) {
  const visible = useMemo(() => guides.filter((guide) => guide.visible), [guides]);
  const systems = useMemo(() => (["tarot", "lenormand"] as SpreadSystem[]).filter((system) => visible.some((guide) => guide.system === system)), [visible]);
  const [activeSystem, setActiveSystem] = useState<SpreadSystem>(systems[0] || "tarot");
  const resolvedSystem = systems.includes(activeSystem) ? activeSystem : (systems[0] || "tarot");
  const systemGuides = useMemo(() => visible.filter((guide) => guide.system === resolvedSystem), [visible, resolvedSystem]);
  const [activeId, setActiveId] = useState("");
  const [position, setPosition] = useState(0);
  if (!visible.length || !systemGuides.length) return null;
  const active = systemGuides.find((guide) => guide.id === activeId) || systemGuides[0];
  const select = (id: string) => { setActiveId(id); setPosition(0); };
  const selectSystem = (system: SpreadSystem) => {
    setActiveSystem(system);
    const first = visible.find((guide) => guide.system === system);
    setActiveId(first?.id || "");
    setPosition(0);
  };
  return <section className="spread-lab">
    <header className="spread-lab-head"><p className="micro-label">{t(copy, "spreadEyebrow", "SPREAD NOTES")}</p><h2>{t(copy, "spreadTitle", "牌阵小册")}</h2><p>{t(copy, "spreadLead", "牌阵不是越大越准。塔罗和雷诺曼的阅读逻辑不同，所以先分开看。")}</p></header>
    {systems.length > 1 && <div className="spread-system-tabs" role="tablist" aria-label={t(copy, "spreadSystemAria", "选择牌阵体系")}>
      <button type="button" role="tab" aria-selected={resolvedSystem === "tarot"} className={resolvedSystem === "tarot" ? "is-active" : ""} onClick={() => selectSystem("tarot")}>{t(copy, "spreadTarotTab", "塔罗牌阵")}</button>
      <button type="button" role="tab" aria-selected={resolvedSystem === "lenormand"} className={resolvedSystem === "lenormand" ? "is-active" : ""} onClick={() => selectSystem("lenormand")}>{t(copy, "spreadLenormandTab", "雷诺曼牌阵")}</button>
    </div>}
    <div className="spread-tabs" role="tablist" aria-label={`${t(copy, "spreadTitle", "牌阵小册")} · ${resolvedSystem}`}>{systemGuides.map((guide) => <button key={guide.id} role="tab" aria-selected={guide.id === active.id} className={guide.id === active.id ? "is-active" : ""} onClick={() => select(guide.id)}><b>{guide.title}</b><small>{guide.subtitle}</small></button>)}</div>
    <article className="spread-sheet">
      <div className="spread-visual"><SpreadDiagram spread={active} active={position} onPick={setPosition} /><p>{active.positions[position] || ""}</p></div>
      <div className="spread-copy">
        <div><span>{t(copy, "spreadBestLabel", "适合")}</span><p>{active.bestFor}</p></div>
        <div><span>{t(copy, "spreadAvoidLabel", "不太适合")}</span><p>{active.avoidFor}</p></div>
        <div className="spread-summary"><span>{t(copy, "spreadPositionsLabel", "牌位")}</span><p>{active.summary}</p></div>
        <div className="spread-relation"><span>{t(copy, "spreadRelationLabel", "怎么串起来看")}</span><p>{active.relation}</p></div>
      </div>
    </article>
  </section>;
}
