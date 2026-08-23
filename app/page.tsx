import { getSiteContent } from "../lib/site-content";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import Link from "next/link";
import PublicTypography from "../components/PublicTypography";
import CustomContentZone from "../components/CustomContentZone";

export const dynamic = "force-dynamic";

const serviceMeta = [
  {
    number: "01",
    labelKey: "homeDreamLabel",
    titleKey: "homeDreamTitle",
    summaryKey: "homeDreamSummary",
    detailKey: "homeDreamDetail",
    href: "/dream",
    tone: "service-lilac",
  },
  {
    number: "02",
    labelKey: "homeRealityLabel",
    titleKey: "homeRealityTitle",
    summaryKey: "homeRealitySummary",
    detailKey: "homeRealityDetail",
    href: "/reality",
    tone: "service-mint",
  },
  {
    number: "03",
    labelKey: "homeIdeasLabel",
    titleKey: "homeIdeasTitle",
    summaryKey: "homeIdeasSummary",
    detailKey: "homeIdeasDetail",
    href: "/ideas",
    tone: "service-sand",
  },
];

export default async function Home() {
  const content = await getSiteContent();
  const activePromotions = content.promotions.filter((item) => item.active);
  const copy = content.pageText;
  const t = (key: string) => copy[key];
  const methods = [
    ["01", "homeMethod1Title", "homeMethod1Text"],
    ["02", "homeMethod2Title", "homeMethod2Text"],
    ["03", "homeMethod3Title", "homeMethod3Text"],
  ];
  

  return (
    <main className="public-page">
      <PublicTypography settings={content.typography} />
      <SiteHeader copy={copy} />

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="micro-label">{t("homeEyebrow")}</p>
          <h1>{t("homeTitle")}</h1>
          <p className="home-deckline editable-copy">{t("homeDeckline")}</p>
          <p className="home-lead editable-copy">{t("homeLead")}</p>
          <div className="home-actions">
            <Link className="primary-action" href="/booking">{t("homePrimaryAction")}</Link>
            <a className="text-action" href="#services">{t("homeSecondaryAction")}</a>
          </div>
        </div>
        <div className="reader-card">
          <div className="reader-card-top"><span>{t("homeReaderEst")}</span><i>{content.bookingsOpen ? t("statusOpen") : t("statusClosed")}</i></div>
          <div className="reader-avatar"><img src="/brand-mark.jpg" alt="不不tarot头像" /></div>
          <h2>{t("homeReaderName")}</h2>
          <p className="editable-copy">{t("homeReaderRole")}</p>
          <div className="reader-card-notes">
            <span className="editable-copy">{t("homeReaderNote1")}</span>
            <span className="editable-copy">{t("homeReaderNote2")}</span>
            <span className="editable-copy">{t("homeReaderNote3")}</span>
          </div>
        </div>
      </section>

      <CustomContentZone blocks={content.richBlocks} page="home" slot="afterHero" />

      <section className="home-section services-section" id="services">
        <div className="clean-heading">
          <div><p className="micro-label">{t("homeServiceEyebrow")}</p><h2>{t("homeServiceTitle")}</h2></div>
          <p className="editable-copy">{t("homeServiceLead")}</p>
        </div>
        <div className="service-card-grid">
          {serviceMeta.map((service) => (
            <Link className={`service-card ${service.tone}`} href={service.href} key={service.titleKey}>
              <div className="service-card-meta"><span>{t(service.labelKey)}</span><b>{service.number}</b></div>
              <div><h3>{t(service.titleKey)}</h3><strong className="editable-copy">{t(service.summaryKey)}</strong><p className="editable-copy">{t(service.detailKey)}</p></div>
              <span className="card-link">{t("homeCardLink")}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-portrait"><img src="/brand-mark.jpg" alt="不不tarot头像" /><span>{t("homePortraitMark")}</span></div>
        <div className="about-copy">
          <p className="micro-label">{t("homeAboutEyebrow")}</p>
          <h2>{t("homeAboutTitle")}</h2>
          <p className="editable-copy">{t("homeAboutText")}</p>
        </div>
        <ol className="method-list">{methods.map(([number, title, description]) => <li key={number}><span>{number}</span><div><b>{t(title)}</b><p className="editable-copy">{t(description)}</p></div></li>)}</ol>
      </section>

      {activePromotions.length > 0 && (
        <section className="home-section offer-section">
          <div className="clean-heading compact-heading">
            <div><p className="micro-label">{t("homeOfferEyebrow")}</p><h2>{t("homeOfferTitle")}</h2></div>
            <Link href="/booking">{t("homeOfferLink")}</Link>
          </div>
          <div className="offer-grid">
            {activePromotions.map((promotion) => (
              <article className="offer-card" key={promotion.id}>
                <span>{promotion.scope} · {promotion.badge || "NOW"}</span>
                <h3>{promotion.title}</h3>
                <p>{promotion.description}</p>
                {(promotion.startsAt || promotion.endsAt) && <small>{promotion.startsAt || t("promoNow")} — {promotion.endsAt || t("promoTbd")}</small>}
              </article>
            ))}
          </div>
        </section>
      )}


      <section className="booking-banner">
        <div><p className="micro-label">{t("homeBookingEyebrow")}</p><h2>{t("homeBookingTitle")}</h2><p className="editable-copy">{content.contactNote}</p></div>
        <Link className="primary-action" href="/booking">{t("homeBookingAction")}</Link>
      </section>

      <CustomContentZone blocks={content.richBlocks} page="home" slot="beforeFooter" />
      <SiteFooter copy={copy} />
    </main>
  );
}
