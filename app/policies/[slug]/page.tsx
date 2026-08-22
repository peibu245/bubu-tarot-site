import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PolicyBody from "../../../components/PolicyBody";
import PublicTypography from "../../../components/PublicTypography";
import { SiteFooter, SiteHeader } from "../../../components/SiteChrome";
import { getSiteContent } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

const policyMap = {
  service: { label: "SERVICE TERMS", title: "服务说明", key: "service" },
  risk: { label: "RISK NOTICE", title: "风险提示", key: "risk" },
  privacy: { label: "PRIVACY POLICY", title: "隐私政策", key: "privacy" },
  refund: { label: "REFUND POLICY", title: "退款规则", key: "refund" },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = policyMap[slug as keyof typeof policyMap];
  return { title: item ? `${item.title} · 不不tarot` : "预约前说明 · 不不tarot" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = policyMap[slug as keyof typeof policyMap];
  if (!item) notFound();
  const content = await getSiteContent();
  const body = content.policies[item.key];
  const copy = content.pageText;
  const t = (key: string, fallback: string) => copy[key] || fallback;
  const titleKey = `policies${slug.charAt(0).toUpperCase()}${slug.slice(1)}Title`;

  return (
    <main className="public-page policy-page">
      <PublicTypography settings={content.typography} />
      <SiteHeader copy={content.pageText} />
      <article className="policy-document">
        <div className="policy-document-head"><p className="micro-label">{t(`policies${slug.charAt(0).toUpperCase()}${slug.slice(1)}Label`, item.label)}</p><h1>{t(titleKey, item.title)}</h1><p>{content.policies.version} · {t("policyEffectiveLabel", "生效日期")} {content.policies.effectiveDate || t("policyMissingDate", "未填写")}</p></div>
        <PolicyBody text={body} />
        <div className="policy-document-nav"><Link href="/policies">{t("policyBackAll", "← 返回全部预约说明")}</Link><Link href="/booking#contact">{t("policyGoBooking", "前往预约入口 →")}</Link></div>
      </article>
      <SiteFooter copy={content.pageText} />
    </main>
  );
}
