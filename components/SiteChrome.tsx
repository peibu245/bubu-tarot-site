import Link from "next/link";
import MobileNav from "./MobileNav";
import StudioPreviewBridge from "./StudioPreviewBridge";

type ChromeProps = { copy?: Record<string, string> };
const text = (copy: Record<string, string> | undefined, key: string, fallback: string) => copy?.[key] || fallback;

export function SiteHeader({ copy }: ChromeProps) {
  return (
    <>
      <StudioPreviewBridge />
      <header className="public-header">
      <Link className="public-brand" href="/" aria-label="不不tarot首页">
        <img src="/brand-mark.jpg" alt="" />
        <span>{text(copy, "siteBrand", "不不tarot")}</span>
      </Link>
      <nav className="public-nav" aria-label="网站导航">
        <Link href="/dream">{text(copy, "navDream", "梦向解读")}</Link>
        <Link href="/reality">{text(copy, "navReality", "现实问题咨询")}</Link>
        <Link href="/booking">{text(copy, "navBooking", "预约入口")}</Link>
      </nav>
      <Link className="header-booking" href="/booking">{text(copy, "navAction", "选择入口")}</Link>
      <MobileNav copy={copy} />
      </header>
    </>
  );
}

export function SiteFooter({ copy }: ChromeProps) {
  return (
    <footer className="public-footer">
      <div className="footer-intro">
        <Link className="public-brand footer-public-brand" href="/">
          <img src="/brand-mark.jpg" alt="" />
          <span>{text(copy, "siteBrand", "不不tarot")}</span>
        </Link>
        <p>{text(copy, "footerIntro", "梦向解读、现实问题咨询与奇思妙想。以文字解读为主。")}</p>
      </div>
      <div className="footer-column">
        <b>{text(copy, "footerServiceTitle", "服务")}</b>
        <Link href="/dream">{text(copy, "navDream", "梦向解读")}</Link>
        <Link href="/reality">{text(copy, "navReality", "现实问题咨询")}</Link>
        <Link href="/ideas">{text(copy, "navIdeas", "奇思妙想")}</Link>
      </div>
      <div className="footer-column">
        <b>{text(copy, "footerBookingTitle", "预约")}</b>
        <Link href="/booking">{text(copy, "footerBookingLink", "价格与流程")}</Link>
        <Link href="/policies">{text(copy, "footerPoliciesLink", "条款与隐私")}</Link>
      </div>
      <p className="footer-copyright">{text(copy, "footerCopyright", "© 2026 不不tarot · 解读内容仅供个人参考与娱乐")}</p>
    </footer>
  );
}
