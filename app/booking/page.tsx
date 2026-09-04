import Link from "next/link";
import Image from "next/image";
import ContactGate from "../../components/ContactGate";
import PublicTypography from "../../components/PublicTypography";
import CustomContentZone from "../../components/CustomContentZone";
import PriceCard from "../../components/PriceCard";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getSiteContent } from "../../lib/site-content";
import type { PriceItem } from "../../lib/content-types";
import type { CSSProperties } from "react";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import { dateKeyInTimeZone } from "../../lib/availability";

export const dynamic = "force-dynamic";

type Entry = { id: "dream" | "reality" | "ideas"; detailHref: string; eyebrow: string; title: string; summary: string; eyebrowKey: string; titleKey: string; summaryKey: string; sections: PriceItem["section"][]; className: string };

export default async function BookingPage() {
  const content = await getSiteContent();
  const todayKey = dateKeyInTimeZone();
  const copy = content.pageText;
  const t = (key: string) => copy[key] || "";
  const prices = content.prices.filter((item) => item.visible);
  const promotions = content.promotions.filter((item) => item.active);
  const entries: Entry[] = [
    { id: "dream", detailHref: "/dream", eyebrow: t("bookingDreamEyebrow"), title: t("bookingDreamTitle"), summary: t("bookingDreamSummary"), eyebrowKey: "bookingDreamEyebrow", titleKey: "bookingDreamTitle", summaryKey: "bookingDreamSummary", sections: ["梦占", "传讯"], className: "entry-dream" },
    { id: "reality", detailHref: "/reality", eyebrow: t("bookingRealityEyebrow"), title: t("bookingRealityTitle"), summary: t("bookingRealitySummary"), eyebrowKey: "bookingRealityEyebrow", titleKey: "bookingRealityTitle", summaryKey: "bookingRealitySummary", sections: ["现实问题咨询"], className: "entry-reality" },
    { id: "ideas", detailHref: "/ideas", eyebrow: t("bookingIdeasEyebrow"), title: t("bookingIdeasTitle"), summary: t("bookingIdeasSummary"), eyebrowKey: "bookingIdeasEyebrow", titleKey: "bookingIdeasTitle", summaryKey: "bookingIdeasSummary", sections: ["奇思妙想"], className: "entry-ideas" },
  ];
  const prepare = [
    { title: t("bookingPrepare1Title"), text: t("bookingPrepare1Text") },
    { title: t("bookingPrepare2Title"), text: t("bookingPrepare2Text") },
    { title: t("bookingPrepare3Title"), text: t("bookingPrepare3Text") },
  ];
  const boundaries = [1, 2, 3, 4].map((n) => ({ label: t(`bookingBoundary${n}Label`), text: t(`bookingBoundary${n}Text`) }));
  const sectionDisplayName = (value: PriceItem["section"]) => value === "梦占" ? (copy.priceGroupDream || "梦占") : value === "传讯" ? (copy.priceGroupMessage || "传讯") : value === "现实问题咨询" ? (copy.priceGroupReality || "现实问题咨询") : (copy.priceGroupIdeas || "奇思妙想");
  const contactStep = content.availability.visible ? 4 : 3;
  return (
    <main className="public-page booking-page">
      <PublicTypography settings={content.typography} pageText={content.pageText} fieldStyles={content.pageTextStyles} />
      <SiteHeader copy={copy} />
      <section className="booking-hero"><div className="booking-avatar"><Image src="/brand-mark.jpg" alt="" width={240} height={240} priority /></div><p className="micro-label" data-copy-key="bookingEyebrow">{t("bookingEyebrow")}</p><h1 data-copy-key="bookingTitle">{t("bookingTitle")}</h1><p className="editable-copy" data-copy-key="bookingLead">{t("bookingLead")}</p><span className={content.bookingsOpen ? "status-pill is-open" : "status-pill"}>{content.bookingsOpen ? t("statusOpen") : t("statusClosed")}</span></section>
      <CustomContentZone blocks={content.richBlocks} page="booking" slot="afterHero" />
      <div className="booking-flow">
        <section className="flow-step">
          <div className="flow-title"><span>1</span><p data-copy-key="bookingStep1Label">{t("bookingStep1Label")}</p><h2 data-copy-key="bookingStep1Title">{t("bookingStep1Title")}</h2></div>
          <div className="booking-entry-grid">{entries.map((entry) => {
            const count = prices.filter((item) => entry.sections.includes(item.section)).length;
            return <a className={`booking-entry-card ${entry.className}`} href={`#price-${entry.id}`} key={entry.id}><div className="booking-entry-meta"><span data-copy-key={entry.eyebrowKey}>{entry.eyebrow}</span><b>{count ? `${count} ${t("itemCountSuffix")}` : t("pricingPending")}</b></div><h3 data-copy-key={entry.titleKey}>{entry.title}</h3><p className="editable-copy" data-copy-key={entry.summaryKey}>{entry.summary}</p><strong>{t("bookingSelectAction")}</strong></a>;
          })}</div>
        </section>

        <section className="flow-step booking-pricing-step" id="pricing">
          <div className="flow-title"><span>2</span><p data-copy-key="bookingPricingLabel">{t("bookingPricingLabel")}</p><h2 data-copy-key="bookingPricingTitle">{t("bookingPricingTitle")}</h2></div>
          <div className="booking-pricing-groups">
            {entries.map((entry) => (
              <section className={`booking-price-group ${entry.className}`} id={`price-${entry.id}`} key={entry.id}>
                <div className="booking-price-group-head"><div><p>{entry.eyebrow}</p><h3>{entry.title}</h3></div><Link href={entry.detailHref}>{t("bookingPricingDetailAction")} <span aria-hidden="true">↗</span></Link></div>
                {entry.sections.map((priceSection) => {
                  const groupPrices = prices.filter((item) => item.section === priceSection);
                  return <div className="booking-price-subgroup" key={priceSection}><div className="booking-price-subgroup-title"><h4>{sectionDisplayName(priceSection)}</h4><span>{groupPrices.length ? `${groupPrices.length} ${t("itemCountSuffix")}` : t("pricingPending")}</span></div><div className="booking-price-list">{groupPrices.length ? groupPrices.map((item) => <PriceCard item={item} featuredNote={copy.featuredNote || "当前主推项目"} bookingsOpen={content.bookingsOpen} actionHref="#contact" key={item.id} />) : <div className="price-pending"><b>{t("pricingPending")}</b><p>项目与价格确定后会在这里更新。</p></div>}</div></div>;
                })}
              </section>
            ))}
          </div>
          {promotions.length > 0 && <div className="booking-price-offers"><div className="booking-price-offers-title"><p>{t("bookingPromoLabel")}</p><h3>{t("bookingPromoTitle")}</h3></div><div className="offer-grid booking-offers">{promotions.map((promotion) => <article className="offer-card" style={{ "--offer-badge-desktop": `${promotion.desktopBadgeSize ?? 14}px`, "--offer-title-desktop": `${promotion.desktopTitleSize ?? 34}px`, "--offer-description-desktop": `${promotion.desktopDescriptionSize ?? 18}px` } as CSSProperties} key={promotion.id}><span>{promotion.scope} · {promotion.badge || "NOW"}</span><h3>{promotion.title}</h3><p className="editable-copy">{promotion.description}</p></article>)}</div></div>}
        </section>

        {content.availability.visible && <section className="flow-step availability-section booking-narrow" id="availability"><div className="flow-title"><span>3</span><p data-copy-key="bookingAvailabilityLabel">{t("bookingAvailabilityLabel")}</p><h2>{content.availability.title}</h2></div><AvailabilityCalendar settings={content.availability} todayKey={todayKey} /><div className="availability-notes"><p><b>当前状态：</b>{content.availability.responseText}</p><p><b>加急说明：</b>{content.availability.rushText}</p></div></section>}
        <section className="flow-step contact-step booking-narrow" id="contact">
          <div className="flow-title"><span>{contactStep}</span><p data-copy-key="bookingContactLabel">{t("bookingContactLabel")}</p><h2 data-copy-key="bookingContactTitle">{t("bookingContactTitle")}</h2></div>
          <p className="booking-prepare-hint" data-copy-key="bookingPrepareHint">{t("bookingPrepareHint")}</p>
          <div className="booking-quick-start">{prepare.map((item, i) => <article key={i}><span>0{i + 1}</span><div><h3>{item.title}</h3><p className="editable-copy">{item.text}</p></div></article>)}</div>
          <div className="contact-panel"><p className="contact-reassurance" data-copy-key="bookingContactReassurance">{t("bookingContactReassurance")}</p><ContactGate bookingsOpen={content.bookingsOpen} contactNote={content.contactNote} channels={content.contactChannels} policies={content.policies} copy={copy} /></div>
        </section>
        <section className="service-boundary"><div><p className="micro-label">{t("bookingBoundaryEyebrow")}</p><h2>{t("bookingBoundaryTitle")}</h2></div><div className="boundary-list">{boundaries.map((item, i) => <p className="editable-copy" key={i}><b>{item.label}</b>{item.text}</p>)}</div></section>
      </div>
      <CustomContentZone blocks={content.richBlocks} page="booking" slot="beforeFooter" />
      <SiteFooter copy={copy} />
    </main>
  );
}
