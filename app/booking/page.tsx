import Link from "next/link";
import ContactGate from "../../components/ContactGate";
import PublicTypography from "../../components/PublicTypography";
import CustomContentZone from "../../components/CustomContentZone";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getSiteContent } from "../../lib/site-content";
import type { PriceItem } from "../../lib/content-types";

export const dynamic = "force-dynamic";

type Entry = { href: string; eyebrow: string; title: string; summary: string; sections: PriceItem["section"][]; className: string };

export default async function BookingPage() {
  const content = await getSiteContent();
  const copy = content.pageText;
  const t = (key: string) => copy[key] || "";
  const prices = content.prices.filter((item) => item.visible);
  const promotions = content.promotions.filter((item) => item.active);
  const entries: Entry[] = [
    { href: "/dream", eyebrow: t("bookingDreamEyebrow"), title: t("bookingDreamTitle"), summary: t("bookingDreamSummary"), sections: ["梦占", "传讯"], className: "entry-dream" },
    { href: "/reality", eyebrow: t("bookingRealityEyebrow"), title: t("bookingRealityTitle"), summary: t("bookingRealitySummary"), sections: ["现实问题咨询"], className: "entry-reality" },
    { href: "/ideas", eyebrow: t("bookingIdeasEyebrow"), title: t("bookingIdeasTitle"), summary: t("bookingIdeasSummary"), sections: ["奇思妙想"], className: "entry-ideas" },
  ];
  const prepare = [1, 2, 3].map((n) => ({ title: t(`bookingPrepare${n}Title`), text: t(`bookingPrepare${n}Text`) }));
  const boundaries = [1, 2, 3, 4].map((n) => ({ label: t(`bookingBoundary${n}Label`), text: t(`bookingBoundary${n}Text`) }));
  return (
    <main className="public-page booking-page">
      <PublicTypography settings={content.typography} />
      <SiteHeader copy={copy} />
      <section className="booking-hero"><div className="booking-avatar"><img src="/brand-mark.jpg" alt="" /></div><p className="micro-label">{t("bookingEyebrow")}</p><h1>{t("bookingTitle")}</h1><p className="editable-copy">{t("bookingLead")}</p><span className={content.bookingsOpen ? "status-pill is-open" : "status-pill"}>{content.bookingsOpen ? t("statusOpen") : t("statusClosed")}</span></section>
      <CustomContentZone blocks={content.richBlocks} page="booking" slot="afterHero" />
      <div className="booking-flow">
        <section className="flow-step"><div className="flow-title"><span>1</span><p>{t("bookingStep1Label")}</p><h2>{t("bookingStep1Title")}</h2></div><div className="booking-entry-grid">{entries.map((entry) => { const count = prices.filter((item) => entry.sections.includes(item.section)).length; return <Link className={`booking-entry-card ${entry.className}`} href={entry.href} key={entry.href}><div className="booking-entry-meta"><span>{entry.eyebrow}</span><b>{count ? `${count} ${t("itemCountSuffix")}` : t("pricingPending")}</b></div><h3>{entry.title}</h3><p className="editable-copy">{entry.summary}</p><strong>{t("bookingEntryAction")}</strong></Link>; })}</div></section>
        <section className="flow-step"><div className="flow-title"><span>2</span><p>{t("bookingStep2Label")}</p><h2>{t("bookingStep2Title")}</h2></div><div className="prepare-grid">{prepare.map((item, i) => <article key={i}><span>0{i + 1}</span><h3>{item.title}</h3><p className="editable-copy">{item.text}</p></article>)}</div></section>
        {promotions.length > 0 && <section className="flow-step"><div className="flow-title"><span>3</span><p>{t("bookingPromoLabel")}</p><h2>{t("bookingPromoTitle")}</h2></div><div className="offer-grid booking-offers">{promotions.map((promotion) => <article className="offer-card" key={promotion.id}><span>{promotion.scope} · {promotion.badge || "NOW"}</span><h3>{promotion.title}</h3><p className="editable-copy">{promotion.description}</p></article>)}</div></section>}
        <section className="flow-step contact-step" id="contact"><div className="flow-title"><span>{promotions.length > 0 ? "4" : "3"}</span><p>{t("bookingContactLabel")}</p><h2>{t("bookingContactTitle")}</h2></div><div className="contact-panel"><ContactGate bookingsOpen={content.bookingsOpen} contactNote={content.contactNote} channels={content.contactChannels} policies={content.policies} copy={copy} /></div></section>
        <section className="service-boundary"><div><p className="micro-label">{t("bookingBoundaryEyebrow")}</p><h2>{t("bookingBoundaryTitle")}</h2></div><div className="boundary-list">{boundaries.map((item, i) => <p className="editable-copy" key={i}><b>{item.label}</b>{item.text}</p>)}</div></section>
      </div>
      <CustomContentZone blocks={content.richBlocks} page="booking" slot="beforeFooter" />
      <SiteFooter copy={copy} />
    </main>
  );
}
