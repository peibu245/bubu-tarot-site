import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getSiteContent } from "../../lib/site-content";
import type { PriceItem, Promotion } from "../../lib/content-types";
import PublicTypography from "../../components/PublicTypography";
import CustomContentZone from "../../components/CustomContentZone";
import type { CSSProperties } from "react";

const sections = {
  dream: {
    index: "01",
    eyebrow: "DREAM READING",
    title: "梦向解读",
    lead: "梦占与传讯使用独立项目，也分别计价。",
    intro: "梦向解读会结合作品世界观、角色性格、梦设信息与具体情境。梦占侧重牌面和牌阵；传讯侧重角色口吻与信息表达，两者不会混成同一种服务。",
    items: ["梦角的反应与心理", "梦女、梦设与梦角对信息", "日常、搞笑与雷霆问题", "关系模式与角色一致性"],
    prepare: ["作品名称与角色", "梦设或梦女的必要信息", "希望讨论的具体情境", "需要避开的设定或内容"],
    subservices: [
      { label: "CARD READING", title: "梦占", copy: "通过抽牌、牌位与整组关系展开解读，适合具体问题、情境反应、关系模式和对信息。" },
      { label: "MESSAGE", title: "传讯", copy: "根据角色设定、情境与牌面整理角色向文字表达。它不等同于梦占，也不宣称真实通灵。" },
    ],
    priceSections: ["梦占", "传讯"] as PriceItem["section"][],
    promotionScope: "梦向解读" as Promotion["scope"],
    tone: "section-lilac",
  },
  reality: {
    index: "02",
    eyebrow: "REALITY CONSULTATION",
    title: "现实问题咨询",
    lead: "用于梳理现实处境、限制条件和下一步选择。",
    intro: "现实问题咨询会结合已知背景、牌位和整组牌的逻辑，区分事实、感受、限制条件与可执行的选择。信息不足时会先补问。这里使用独立定价，不与梦向项目共用。",
    items: ["情感与人际关系", "学业、工作与选择", "阶段变化与行动建议", "复杂问题的综合大牌阵"],
    prepare: ["已经发生的关键事实", "涉及的人物与关系", "希望查看的时间范围", "最需要解决的问题"],
    subservices: [],
    priceSections: ["现实问题咨询"] as PriceItem["section"][],
    promotionScope: "现实问题咨询" as Promotion["scope"],
    tone: "section-mint",
  },
  ideas: {
    index: "03",
    eyebrow: "CURIOUS CORNER",
    title: "奇思妙想",
    lead: "OC、宠物，以及常规分类放不下的题目。",
    intro: "这类项目偏向角色分析、创作辅助、纪念向内容或娱乐体验。接单前会确认问题是否适合，以及需要使用的牌组和问法。",
    items: ["OC性格与关系探索", "角色创作辅助", "宠物主题与纪念向", "新牌组与实验性玩法"],
    prepare: ["角色或对象的基础信息", "世界观和关系设定", "本次解读的用途", "希望得到的内容形式"],
    subservices: [],
    priceSections: ["奇思妙想"] as PriceItem["section"][],
    promotionScope: "奇思妙想" as Promotion["scope"],
    tone: "section-sand",
  },
} as const;

function PriceCard({ item, featuredNote, bookingsOpen }: { item: PriceItem; featuredNote: string; bookingsOpen: boolean }) {
  const isNumber = /^\d+(?:\.\d+)?$/.test(item.price);
  const statusLabel = item.status === "paused" ? "暂不接单" : item.status === "waitlist" ? "可候补" : "开放预约";
  const actionLabel = item.status === "waitlist" ? "了解候补方式" : "查看预约方式";
  return (
    <article className={item.featured ? "booking-price-card featured-price" : "booking-price-card"}>
      <div className="booking-price-top">
        <div><span>{item.badge || item.section}</span><h3>{item.title}</h3><small>{item.section}</small></div>
        <div className="booking-money">{isNumber && <i>¥</i>}<b>{item.price}</b><small>{item.unit}</small></div>
      </div>
      <p>{item.description}</p>
      {(item.delivery || item.turnaround || item.followUp || item.suitableFor) && <dl className="service-meta">
        {item.delivery && <><dt>交付</dt><dd>{item.delivery}</dd></>}
        {item.turnaround && <><dt>预计</dt><dd>{item.turnaround}</dd></>}
        {item.followUp && <><dt>补充</dt><dd>{item.followUp}</dd></>}
        {item.suitableFor && <><dt>适合</dt><dd>{item.suitableFor}</dd></>}
      </dl>}
      <span className={`service-status status-${item.status}`}>{statusLabel}</span>
      {item.featured && <strong className="featured-note">{featuredNote}</strong>}
      {bookingsOpen && item.status !== "paused" && <Link className="service-card-cta" href="/booking#contact">{actionLabel}<span aria-hidden="true">→</span></Link>}
    </article>
  );
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const data = sections[section as keyof typeof sections];
  if (!data) notFound();

  const content = await getSiteContent();
  const copy = content.pageText;
  const t = (key: string, fallback: string) => copy[key] || fallback;
  const isDream = section === "dream";
  const prefix = isDream ? "dream" : section === "reality" ? "reality" : "ideas";
  const sectionCopy = {
    eyebrow: t(`${prefix}Eyebrow`, data.eyebrow), title: t(`${prefix}Title`, data.title), lead: t(`${prefix}Lead`, data.lead), intro: t(`${prefix}Intro`, data.intro),
    items: data.items.map((item, index) => t(`${prefix}Content${index + 1}`, item)),
    prepare: data.prepare.map((item, index) => t(`${prefix}Prepare${index + 1}`, item)),
    aboutEyebrow: t(`${prefix}AboutEyebrow`, "ABOUT THIS SERVICE"), aboutTitle: t(`${prefix}AboutTitle`, "这一类会怎么看"), contentHeading: t(`${prefix}ContentHeading`, "可看内容"), prepareHeading: t(`${prefix}PrepareHeading`, "预约时请准备"),
    priceEyebrow: t(`${prefix}PriceEyebrow`, "PROJECTS & PRICING"), priceTitle: t(`${prefix}PriceTitle`, "项目与价格"), offerEyebrow: t(`${prefix}OfferEyebrow`, "CURRENT OFFERS"), offerTitle: t(`${prefix}OfferTitle`, "适用活动"),
    ctaEyebrow: t(`${prefix}CtaEyebrow`, "NEXT STEP"), ctaTitle: t(`${prefix}CtaTitle`, "确认入口后再预约"), ctaText: t(`${prefix}CtaText`, "发送问题时请注明入口。"), ctaAction: t(`${prefix}CtaAction`, "查看预约方式"),
    pendingTitle: t(`${prefix}PendingTitle`, "定价尚未公布"), pendingDream: t(`${prefix}PendingDream`, t(`${prefix}PendingText`, "方案确定后会在这里单独更新。")), pendingMessage: t(`${prefix}PendingMessage`, t(`${prefix}PendingText`, "方案确定后会在这里单独更新。")),
  };
  const sectionDisplayName = (value: PriceItem["section"]) => value === "梦占" ? (copy.priceGroupDream || "梦占") : value === "传讯" ? (copy.priceGroupMessage || "传讯") : value === "现实问题咨询" ? (copy.priceGroupReality || "现实问题咨询") : (copy.priceGroupIdeas || "奇思妙想");
  const prices = content.prices.filter((item) => item.visible && data.priceSections.includes(item.section));
  const promotions = content.promotions.filter((item) => item.active && (item.scope === "全站" || item.scope === data.promotionScope));
  const priceNotice = section === "dream" ? content.dreamPriceNotice : content.priceNotice;

  return (
    <main className={`public-page service-page ${data.tone}`}>
      <PublicTypography settings={content.typography} pageText={content.pageText} fieldStyles={content.pageTextStyles} />
      <SiteHeader copy={copy} />
      <section className="service-hero">
        <div><p className="micro-label">{sectionCopy.eyebrow}</p><h1>{sectionCopy.title}</h1><p className="editable-copy">{sectionCopy.lead}</p></div>
        <span>{data.index}</span>
      </section>

      <CustomContentZone blocks={content.richBlocks} page={section as "dream" | "reality" | "ideas"} slot="afterHero" />

      {data.subservices.length > 0 && (
        <section className="dream-service-split" aria-label="梦向解读分类">
          {data.subservices.map((item, index) => (
            <article key={item.title}><div><span>{t(`dreamSub${index + 1}Label`, item.label)}</span><b>0{index + 1}</b></div><h2>{t(`dreamSub${index + 1}Title`, item.title)}</h2><p className="editable-copy">{t(`dreamSub${index + 1}Text`, item.copy)}</p></article>
          ))}
        </section>
      )}

      <section className="service-intro">
        <div><p className="micro-label">{sectionCopy.aboutEyebrow}</p><h2>{sectionCopy.aboutTitle}</h2></div>
        <p className="editable-copy">{sectionCopy.intro}</p>
      </section>
      <section className="service-details">
        <div className="service-detail-column"><p className="micro-label">{sectionCopy.contentHeading}</p>{sectionCopy.items.map((item, index) => <div className="detail-row" key={`${item}-${index}`}><span>0{index + 1}</span><p className="editable-copy">{item}</p></div>)}</div>
        <div className="service-detail-column"><p className="micro-label">{sectionCopy.prepareHeading}</p>{sectionCopy.prepare.map((item, index) => <div className="detail-row" key={`${item}-${index}`}><span>0{index + 1}</span><p className="editable-copy">{item}</p></div>)}</div>
      </section>

      <section className="service-pricing" id="pricing">
        <div className="clean-heading"><div><p className="micro-label">{sectionCopy.priceEyebrow}</p><h2>{sectionCopy.priceTitle}</h2></div><p className="editable-copy">{priceNotice}</p></div>
        <div className="service-price-groups">
          {data.priceSections.map((priceSection) => {
            const groupPrices = prices.filter((item) => item.section === priceSection);
            return (
              <section className="service-price-group" key={priceSection}>
                <div className="service-price-heading"><h3>{sectionDisplayName(priceSection)}</h3><span>{groupPrices.length ? `${groupPrices.length} ${copy.itemCountSuffix || "个项目"}` : (copy.pricingPending || "定价中")}</span></div>
                <div className="booking-price-list">
                  {groupPrices.length ? groupPrices.map((item) => <PriceCard item={item} featuredNote={copy.featuredNote || "当前主推项目"} bookingsOpen={content.bookingsOpen} key={item.id} />) : (
                    <div className="price-pending"><b>{sectionCopy.pendingTitle}</b><p>{priceSection === "传讯" ? sectionCopy.pendingMessage : sectionCopy.pendingDream}</p></div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="service-promotions"><div className="clean-heading compact-heading"><div><p className="micro-label">{sectionCopy.offerEyebrow}</p><h2>{sectionCopy.offerTitle}</h2></div></div><div className="offer-grid">{promotions.map((item) => <article className="offer-card" style={{ "--offer-badge-desktop": `${item.desktopBadgeSize ?? 14}px`, "--offer-title-desktop": `${item.desktopTitleSize ?? 34}px`, "--offer-description-desktop": `${item.desktopDescriptionSize ?? 18}px` } as CSSProperties} key={item.id}><span>{item.badge || item.scope}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>
      )}

      <section className="service-page-cta"><div><p className="micro-label">{sectionCopy.ctaEyebrow}</p><h2>{sectionCopy.ctaTitle}</h2><p className="editable-copy">{sectionCopy.ctaText}</p></div><Link className="primary-action" href="/booking#contact">{sectionCopy.ctaAction}</Link></section>
      <CustomContentZone blocks={content.richBlocks} page={section as "dream" | "reality" | "ideas"} slot="beforeFooter" />
      <SiteFooter copy={copy} />
    </main>
  );
}
