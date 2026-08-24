import Link from "next/link";
import PublicTypography from "../../components/PublicTypography";
import CustomContentZone from "../../components/CustomContentZone";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const content = await getSiteContent();
  const copy = content.pageText;
  const t = (key: string) => copy[key] || "";
  const cards = [
    { href: "/policies/service", label: t("policiesServiceLabel"), title: t("policiesServiceTitle"), text: t("policiesServiceText") },
    { href: "/policies/risk", label: t("policiesRiskLabel"), title: t("policiesRiskTitle"), text: t("policiesRiskText") },
    { href: "/policies/privacy", label: t("policiesPrivacyLabel"), title: t("policiesPrivacyTitle"), text: t("policiesPrivacyText") },
    { href: "/policies/refund", label: t("policiesRefundLabel"), title: t("policiesRefundTitle"), text: t("policiesRefundText") },
  ];
  return (
    <main className="public-page policy-page">
      <PublicTypography settings={content.typography} pageText={content.pageText} fieldStyles={content.pageTextStyles} />
      <SiteHeader copy={copy} />
      <section className="policy-hero"><p className="micro-label">{t("policiesEyebrow")}</p><h1>{t("policiesTitle")}</h1><p>{content.policies.version} · {t("policyEffectiveLabel")} {content.policies.effectiveDate || t("policyMissingDate")}</p></section>
      <CustomContentZone blocks={content.richBlocks} page="policies" slot="afterHero" />
      <section className="policy-card-grid">{cards.map((card) => <Link href={card.href} className="policy-card" key={card.href}><span>{card.label}</span><h2>{card.title}</h2><p>{card.text}</p><b>{t("policiesReadAction")}</b></Link>)}</section>
      <section className="policy-short-note"><b>{t("policiesShortTitle")}</b><p>{t("policiesShortText")}</p></section>
      <CustomContentZone blocks={content.richBlocks} page="policies" slot="beforeFooter" />
      <SiteFooter copy={copy} />
    </main>
  );
}
