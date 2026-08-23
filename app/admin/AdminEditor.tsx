"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { CardFact, FontChoice, KnowledgeCard, PriceItem, Promotion, SiteContent, SpreadGuide } from "../../lib/content-types";
import { lenormandCards, rwsCards } from "../../lib/card-decks";
import ContactPolicyEditor from "./ContactPolicyEditor";
import PageCopyStudio from "./PageCopyStudio";
import GuestbookManager from "./GuestbookManager";
import HistoryPanel from "./HistoryPanel";
import CollapsiblePanel from "./CollapsiblePanel";
import { fontOptions, fontStacks, typographyPresets } from "../../lib/typography";

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const cardLabels = new Map([...rwsCards, ...lenormandCards].map((card) => [card.id, `${card.number ? `${card.number} · ` : ""}${card.name}`]));

const priceGroups: Array<{ section: PriceItem["section"]; title: string; note: string }> = [
  { section: "梦占", title: "梦向解读 · 梦占", note: "卡牌抽取、牌阵与文字解读项目" },
  { section: "传讯", title: "梦向解读 · 传讯", note: "按时间或其他方式计价的传讯项目" },
  { section: "现实问题咨询", title: "现实问题咨询", note: "60 / 88 / 188 / 518 等现实项目" },
  { section: "奇思妙想", title: "奇思妙想", note: "OC、宠物及特殊主题" },
];



export default function AdminEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [factQuery, setFactQuery] = useState("");
  const [factDeck, setFactDeck] = useState<"all" | "rws" | "lenormand">("all");
  const [factAddCard, setFactAddCard] = useState(rwsCards[0]?.id || "rws-major-00");

  const patchPrice = (id: string, patch: Partial<PriceItem>) => setContent((current) => ({ ...current, prices: current.prices.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const patchPromo = (id: string, patch: Partial<Promotion>) => setContent((current) => ({ ...current, promotions: current.promotions.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const patchKnowledge = (id: string, patch: Partial<KnowledgeCard>) => setContent((current) => ({ ...current, knowledgeCards: current.knowledgeCards.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const patchFact = (id: string, patch: Partial<CardFact>) => setContent((current) => ({ ...current, cardFacts: current.cardFacts.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const patchSpread = (id: string, patch: Partial<SpreadGuide>) => setContent((current) => ({ ...current, spreadGuides: current.spreadGuides.map((item) => item.id === id ? { ...item, ...patch } : item) }));

  const addPrice = (section: PriceItem["section"]) => setContent((current) => ({ ...current, prices: [...current.prices, { id: makeId("price"), section, title: "新项目", description: "", price: "", unit: "元 / 次", badge: "", delivery: "", turnaround: "", followUp: "", suitableFor: "", status: "available", visible: true, featured: false }] }));
  const addPromo = () => setContent((current) => ({ ...current, promotions: [...current.promotions, { id: makeId("promo"), scope: "全站", title: "新活动", description: "", badge: "", startsAt: "", endsAt: "", active: true }] }));
  const addKnowledge = () => setContent((current) => ({ ...current, knowledgeCards: [...current.knowledgeCards, { id: makeId("tip"), tag: "Tips", title: "新的提醒", body: "", visible: true }] }));
  const addFact = () => {
    const deck: CardFact["deck"] = factAddCard.startsWith("lenormand-") ? "lenormand" : "rws";
    setContent((current) => ({ ...current, cardFacts: [...current.cardFacts, { id: makeId("fact"), deck, cardId: factAddCard, text: "新的牌面细节", visible: true }] }));
    setFactQuery(cardLabels.get(factAddCard) || factAddCard);
    setFactDeck(deck);
  };
  const addSpread = () => setContent((current) => ({ ...current, spreadGuides: [...current.spreadGuides, { id: makeId("spread"), system: "tarot", title: "新牌阵", subtitle: "", summary: "", bestFor: "", avoidFor: "", positions: ["位置 1", "位置 2", "位置 3"], relation: "", layout: "line3", visible: true }] }));

  async function save() {
    setState("saving");
    try {
      const response = await fetch("/api/studio-85810eea57bc0ee6/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) });
      if (!response.ok) throw new Error("save failed");
      const result = await response.json() as { content: SiteContent };
      setContent(result.content);
      window.dispatchEvent(new CustomEvent("bubu-content-saved", { detail: result.content.pageText }));
      setState("saved");
      window.setTimeout(() => setState("idle"), 2400);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="editor">
      <CollapsiblePanel label="01 / BOOKING" title="接单状态与预约说明" defaultOpen><section className="editor-section compact-editor">
        <div className="editor-title"><div><span>01 / STATUS</span><h2>接单状态与说明</h2></div><label className="switch-row"><input type="checkbox" checked={content.bookingsOpen} onChange={(event) => setContent({ ...content, bookingsOpen: event.target.checked })} /><i /><b>{content.bookingsOpen ? "开放预约" : "暂不接单"}</b></label></div>
        <label>梦向解读价格说明<textarea value={content.dreamPriceNotice} onChange={(event) => setContent({ ...content, dreamPriceNotice: event.target.value })} rows={2} /></label>
        <label>现实问题咨询价格说明<textarea value={content.priceNotice} onChange={(event) => setContent({ ...content, priceNotice: event.target.value })} rows={2} /></label>
        <label>预约方式说明<textarea value={content.contactNote} onChange={(event) => setContent({ ...content, contactNote: event.target.value })} rows={2} /></label>
        <p className="manager-hint">微信、闲鱼和其他预约入口已移动到下方“联系方式”区域；公开页面不会再直接显示旧的单一预约链接。</p>
      </section></CollapsiblePanel>

      <PageCopyStudio content={content} setContent={setContent} />

      <HistoryPanel setContent={setContent} />

      <CollapsiblePanel label="04 / DISPLAY" title="文字排版"><section className="editor-section compact-editor">
        <div className="editor-title"><div><span>04 / TYPE</span><h2>文字排版</h2></div></div>
        <p className="manager-hint">先选一套整体风格，再单独微调标题、正文和导航。这里使用访客设备自带的字体组合，不上传或重新分发字体文件。</p>
        <div className="typography-presets">
          {typographyPresets.map((preset) => {
            const active = Object.entries(preset.settings).every(([key, value]) => content.typography[key as keyof typeof content.typography] === value);
            return <button className={active ? "is-active" : ""} type="button" key={preset.id} onClick={() => setContent({ ...content, typography: { ...preset.settings } })}><b>{preset.name}</b><span>{preset.note}</span></button>;
          })}
        </div>
        <div className="typography-preview" style={{ "--preview-heading-font": fontStacks[content.typography.headingFont], "--preview-body-font": fontStacks[content.typography.bodyFont], "--preview-ui-font": fontStacks[content.typography.uiFont], "--preview-heading-weight": content.typography.headingWeight, "--preview-body-weight": content.typography.bodyWeight } as CSSProperties}>
          <span>LIVE TYPE PREVIEW</span><h3>先来聊聊，再决定</h3><p>不需要提前整理得很完整。你可以先发一句话过来，信息不足时我会再问。</p><button type="button">联系咨询</button>
        </div>
        <div className="form-grid typography-font-grid">
          <label>大标题字体<select value={content.typography.headingFont} onChange={(event) => setContent({ ...content, typography: { ...content.typography, headingFont: event.target.value as FontChoice } })}>{fontOptions.map((option) => <option value={option.value} key={option.value}>{option.label}｜{option.note}</option>)}</select></label>
          <label>正文说明字体<select value={content.typography.bodyFont} onChange={(event) => setContent({ ...content, typography: { ...content.typography, bodyFont: event.target.value as FontChoice } })}>{fontOptions.map((option) => <option value={option.value} key={option.value}>{option.label}｜{option.note}</option>)}</select></label>
          <label>导航与按钮字体<select value={content.typography.uiFont} onChange={(event) => setContent({ ...content, typography: { ...content.typography, uiFont: event.target.value as FontChoice } })}>{fontOptions.map((option) => <option value={option.value} key={option.value}>{option.label}｜{option.note}</option>)}</select></label>
          <label>标题粗细 <output>{content.typography.headingWeight}</output><input type="range" min="400" max="800" step="100" value={content.typography.headingWeight} onChange={(event) => setContent({ ...content, typography: { ...content.typography, headingWeight: Number(event.target.value) } })} /></label>
          <label>正文粗细 <output>{content.typography.bodyWeight}</output><input type="range" min="300" max="600" step="100" value={content.typography.bodyWeight} onChange={(event) => setContent({ ...content, typography: { ...content.typography, bodyWeight: Number(event.target.value) } })} /></label>
        </div>
        <div className="form-grid typography-grid">
          <label>正文字号比例 <output>{Math.round(content.typography.bodyScale * 100)}%</output><input type="range" min="0.9" max="1.2" step="0.01" value={content.typography.bodyScale} onChange={(event) => setContent({ ...content, typography: { ...content.typography, bodyScale: Number(event.target.value) } })} /></label>
          <label>字间距 <output>{content.typography.letterSpacing.toFixed(3)}em</output><input type="range" min="0" max="0.12" step="0.005" value={content.typography.letterSpacing} onChange={(event) => setContent({ ...content, typography: { ...content.typography, letterSpacing: Number(event.target.value) } })} /></label>
          <label>正文行距 <output>{content.typography.lineHeight.toFixed(2)}</output><input type="range" min="1.5" max="2.25" step="0.05" value={content.typography.lineHeight} onChange={(event) => setContent({ ...content, typography: { ...content.typography, lineHeight: Number(event.target.value) } })} /></label>
        </div>
      </section></CollapsiblePanel>

      <ContactPolicyEditor content={content} setContent={setContent} />

      <CollapsiblePanel label="07 / SERVICES" title="服务项目与定价" defaultOpen><section className="editor-section">
        <div className="editor-title"><div><span>07 / SERVICES</span><h2>服务项目与定价</h2></div></div>
        <div className="editor-price-groups">
          {priceGroups.map((group) => {
            const items = content.prices.filter((item) => item.section === group.section);
            return (
              <section className="editor-price-group" key={group.section}>
                <div className="price-group-heading"><div><h3>{group.title}</h3><p>{group.note}</p></div><button className="admin-add" type="button" onClick={() => addPrice(group.section)}>＋ 添加项目</button></div>
                <div className="editor-cards">
                  {items.length ? items.map((item) => {
                    const index = content.prices.findIndex((price) => price.id === item.id);
                    return (
                      <article className="editor-card" key={item.id}>
                        <div className="card-admin-top"><b>#{String(index + 1).padStart(2, "0")}</b><button type="button" onClick={() => setContent((current) => ({ ...current, prices: current.prices.filter((price) => price.id !== item.id) }))}>删除</button></div>
                        <div className="form-grid">
                          <label>所属板块<select value={item.section} onChange={(event) => patchPrice(item.id, { section: event.target.value as PriceItem["section"] })}><option>梦占</option><option>传讯</option><option>现实问题咨询</option><option>奇思妙想</option></select></label>
                          <label>项目名称<input value={item.title} onChange={(event) => patchPrice(item.id, { title: event.target.value })} /></label>
                          <label className="wide">项目说明<textarea value={item.description} onChange={(event) => patchPrice(item.id, { description: event.target.value })} rows={3} /></label>
                          <label>价格<input value={item.price} onChange={(event) => patchPrice(item.id, { price: event.target.value })} placeholder="例如 18；未定可填待定" /></label>
                          <label>单位<input value={item.unit} onChange={(event) => patchPrice(item.id, { unit: event.target.value })} placeholder="元 / 1问" /></label>
                          <label>英文小标签<input value={item.badge} onChange={(event) => patchPrice(item.id, { badge: event.target.value })} /></label>
                          <label>交付形式<input value={item.delivery} onChange={(event) => patchPrice(item.id, { delivery: event.target.value })} placeholder="例如：文字解读" /></label>
                          <label>预计交付<input value={item.turnaround} onChange={(event) => patchPrice(item.id, { turnaround: event.target.value })} placeholder="例如：24–48 小时" /></label>
                          <label>原题补充<input value={item.followUp} onChange={(event) => patchPrice(item.id, { followUp: event.target.value })} placeholder="例如：完成后可补充 1 次" /></label>
                          <label>适合什么情况<input value={item.suitableFor} onChange={(event) => patchPrice(item.id, { suitableFor: event.target.value })} placeholder="例如：有明确问题、希望梳理思路" /></label>
                          <label>当前接单状态<select value={item.status} onChange={(event) => patchPrice(item.id, { status: event.target.value as PriceItem["status"] })}><option value="available">可预约</option><option value="waitlist">可候补</option><option value="paused">暂不接单</option></select></label>
                        </div>
                        <div className="check-row"><label><input type="checkbox" checked={item.visible} onChange={(event) => patchPrice(item.id, { visible: event.target.checked })} /> 对访客显示</label><label><input type="checkbox" checked={item.featured} onChange={(event) => patchPrice(item.id, { featured: event.target.checked })} /> 标记为推荐</label></div>
                      </article>
                    );
                  }) : <p className="editor-empty">尚未设置项目，公开页面会显示“定价尚未公布”。</p>}
                </div>
              </section>
            );
          })}
        </div>
      </section></CollapsiblePanel>

      <CollapsiblePanel label="08 / OFFERS" title="优惠活动"><section className="editor-section">
        <div className="editor-title"><div><span>08 / OFFERS</span><h2>优惠活动</h2></div><button className="admin-add" type="button" onClick={addPromo}>＋ 添加活动</button></div>
        <div className="editor-cards promo-editors">
          {content.promotions.map((item, index) => (
            <article className="editor-card" key={item.id}>
              <div className="card-admin-top"><b>活动 #{String(index + 1).padStart(2, "0")}</b><button type="button" onClick={() => setContent((current) => ({ ...current, promotions: current.promotions.filter((promo) => promo.id !== item.id) }))}>删除</button></div>
              <div className="form-grid">
                <label>适用入口<select value={item.scope} onChange={(event) => patchPromo(item.id, { scope: event.target.value as Promotion["scope"] })}><option>全站</option><option>梦向解读</option><option>现实问题咨询</option><option>奇思妙想</option></select></label>
                <label>活动名称<input value={item.title} onChange={(event) => patchPromo(item.id, { title: event.target.value })} /></label>
                <label>小标签<input value={item.badge} onChange={(event) => patchPromo(item.id, { badge: event.target.value })} /></label>
                <label className="wide">活动说明<textarea value={item.description} onChange={(event) => patchPromo(item.id, { description: event.target.value })} rows={3} /></label>
                <label>开始日期<input type="date" value={item.startsAt} onChange={(event) => patchPromo(item.id, { startsAt: event.target.value })} /></label>
                <label>结束日期<input type="date" value={item.endsAt} onChange={(event) => patchPromo(item.id, { endsAt: event.target.value })} /></label>
              </div>
              <div className="check-row"><label><input type="checkbox" checked={item.active} onChange={(event) => patchPromo(item.id, { active: event.target.checked })} /> 活动正在进行</label></div>
            </article>
          ))}
        </div>
      </section></CollapsiblePanel>

      <CollapsiblePanel label="09 / CONTENT" title="Tips 横幅"><section className="editor-section">
        <div className="editor-title"><div><span>09 / TIPS</span><h2>Tips 横幅</h2></div><button className="admin-add" type="button" onClick={addKnowledge}>＋ 添加 Tips</button></div>
        <p className="manager-hint">这里已经不再是“知识牌堆”。访客点“换一个”时会按洗牌后的顺序轮播：这一轮尽量全部看过后才重新打乱。</p>
        <div className="editor-cards knowledge-editors">{content.knowledgeCards.map((item, index) => <article className="editor-card" key={item.id}><div className="card-admin-top"><b>Tips #{String(index + 1).padStart(2, "0")}</b><button type="button" onClick={() => setContent((current) => ({ ...current, knowledgeCards: current.knowledgeCards.filter((card) => card.id !== item.id) }))}>删除</button></div><div className="form-grid"><label>小标签<input value={item.tag} onChange={(event) => patchKnowledge(item.id, { tag: event.target.value })} /></label><label>短标题<input value={item.title} onChange={(event) => patchKnowledge(item.id, { title: event.target.value })} placeholder="可留空" /></label><label className="wide">Tips 内容<textarea rows={3} value={item.body} onChange={(event) => patchKnowledge(item.id, { body: event.target.value })} /></label></div><div className="check-row"><label><input type="checkbox" checked={item.visible} onChange={(event) => patchKnowledge(item.id, { visible: event.target.checked })} /> 对访客显示</label></div></article>)}</div>
      </section></CollapsiblePanel>

      <CollapsiblePanel label="10 / CARD DETAILS" title="牌面细节"><section className="editor-section">
        <div className="editor-title"><div><span>10 / CARD DETAILS</span><h2>“你知道吗？”牌面细节</h2></div><button className="admin-add" type="button" onClick={addFact}>＋ 给这张牌加细节</button></div>
        <p className="manager-hint">这里不是传统牌义词典。优先写牌面上真实存在、平时容易忽略的东西；也可以为同一张牌增加多条，访客会先看完这一轮再重复。</p>
        <div className="form-grid"><label>筛选牌系<select value={factDeck} onChange={(event) => setFactDeck(event.target.value as "all" | "rws" | "lenormand")}><option value="all">全部</option><option value="rws">韦特–史密斯</option><option value="lenormand">雷诺曼</option></select></label><label>搜索牌名 / ID<input value={factQuery} onChange={(event) => setFactQuery(event.target.value)} placeholder="例如 愚人、女祭司、lenormand-1" /></label><label className="wide">新增细节给哪张牌<select value={factAddCard} onChange={(event) => setFactAddCard(event.target.value)}><optgroup label="韦特–史密斯">{rwsCards.map((card) => <option key={card.id} value={card.id}>{cardLabels.get(card.id) || card.name}</option>)}</optgroup><optgroup label="雷诺曼">{lenormandCards.map((card) => <option key={card.id} value={card.id}>{cardLabels.get(card.id) || card.name}</option>)}</optgroup></select></label></div>
        <div className="editor-cards knowledge-editors">{content.cardFacts.filter((fact) => factDeck === "all" || fact.deck === factDeck).filter((fact) => { const q = factQuery.trim().toLowerCase(); return !q || fact.cardId.toLowerCase().includes(q) || (cardLabels.get(fact.cardId) || "").toLowerCase().includes(q); }).map((fact, index) => <article className="editor-card" key={fact.id}><div className="card-admin-top"><b>{cardLabels.get(fact.cardId) || fact.cardId} · #{index + 1}</b><div><span>{fact.deck === "rws" ? "RWS" : "LENORMAND"}</span><button type="button" onClick={() => setContent((current) => ({ ...current, cardFacts: current.cardFacts.filter((row) => row.id !== fact.id) }))}>删除</button></div></div><label>细节内容<textarea rows={4} value={fact.text} onChange={(event) => patchFact(fact.id, { text: event.target.value })} /></label><div className="check-row"><label><input type="checkbox" checked={fact.visible} onChange={(event) => patchFact(fact.id, { visible: event.target.checked })} /> 对访客显示</label></div></article>)}</div>
      </section></CollapsiblePanel>

      <CollapsiblePanel label="11 / SPREADS" title="牌阵小册"><section className="editor-section">
        <div className="editor-title"><div><span>11 / SPREAD NOTES</span><h2>牌阵小册</h2></div><button className="admin-add" type="button" onClick={addSpread}>＋ 添加牌阵</button></div>
        <p className="manager-hint">公开页先分成“塔罗牌阵 / 雷诺曼牌阵”两个区。每个牌阵可以选择所属体系和示意图；牌位每行一条。</p>
        <div className="editor-cards">{content.spreadGuides.map((spread, index) => <article className="editor-card" key={spread.id}><div className="card-admin-top"><b>牌阵 #{String(index + 1).padStart(2, "0")}</b><button type="button" onClick={() => setContent((current) => ({ ...current, spreadGuides: current.spreadGuides.filter((row) => row.id !== spread.id) }))}>删除</button></div><div className="form-grid"><label>所属体系<select value={spread.system} onChange={(event) => patchSpread(spread.id, { system: event.target.value as SpreadGuide["system"] })}><option value="tarot">塔罗</option><option value="lenormand">雷诺曼</option></select></label><label>名称<input value={spread.title} onChange={(event) => patchSpread(spread.id, { title: event.target.value })} /></label><label>一句小注<input value={spread.subtitle} onChange={(event) => patchSpread(spread.id, { subtitle: event.target.value })} /></label><label>示意图<select value={spread.layout} onChange={(event) => patchSpread(spread.id, { layout: event.target.value as SpreadGuide["layout"] })}><option value="line3">三张横排</option><option value="timeline3">时间三张</option><option value="choice5">A/B 选择</option><option value="relationship5">双人关系</option><option value="inner5">内心五张</option><option value="celtic10">凯尔特十字</option><option value="line5">五张横排</option><option value="grid9">3×3 九宫格</option><option value="grandtableau36">Grand Tableau 4×9</option></select></label><label className="wide">简介<textarea rows={2} value={spread.summary} onChange={(event) => patchSpread(spread.id, { summary: event.target.value })} /></label><label className="wide">适合<textarea rows={2} value={spread.bestFor} onChange={(event) => patchSpread(spread.id, { bestFor: event.target.value })} /></label><label className="wide">不太适合<textarea rows={2} value={spread.avoidFor} onChange={(event) => patchSpread(spread.id, { avoidFor: event.target.value })} /></label><label className="wide">牌位（每行一条）<textarea rows={6} value={spread.positions.join("\n")} onChange={(event) => patchSpread(spread.id, { positions: event.target.value.split("\n").filter((row) => row.trim()) })} /></label><label className="wide">怎么串起来看<textarea rows={3} value={spread.relation} onChange={(event) => patchSpread(spread.id, { relation: event.target.value })} /></label></div><div className="check-row"><label><input type="checkbox" checked={spread.visible} onChange={(event) => patchSpread(spread.id, { visible: event.target.checked })} /> 对访客显示</label></div></article>)}</div>
      </section></CollapsiblePanel>
      <GuestbookManager />

      <div className="save-bar"><p>{state === "saved" ? "已保存，公开页面已经更新。" : state === "error" ? "保存失败，请稍后重试。" : "修改只会在点击保存后公开。"}</p><a href="/" target="_blank" rel="noreferrer">查看公开页 ↗</a><button type="button" disabled={state === "saving"} onClick={save}>{state === "saving" ? "保存中…" : "保存并发布"}</button></div>
    </div>
  );
}
