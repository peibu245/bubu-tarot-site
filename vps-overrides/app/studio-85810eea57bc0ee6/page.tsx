import type { Metadata } from "next";
import Link from "next/link";
import AdminEditor from "../admin/AdminEditor";
import { getSiteContent } from "../../lib/site-content";
import { requireAdmin } from "../vps-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "内容管理",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PrivateStudioPage() {
  await requireAdmin();
  const content = await getSiteContent();

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand dark-brand" href="/">
          <img src="/brand-mark.jpg" alt="" />
          <span>不不tarot</span>
        </Link>
        <div>
          <span>管理后台已登录</span>
          <a href="/api/studio-85810eea57bc0ee6/logout">退出</a>
        </div>
      </header>
      <section className="admin-intro">
        <p className="eyebrow dark">PRIVATE EDITOR</p>
        <h1>网站内容后台</h1>
        <p>页面文字现在可以边改边实时预览；内容模块支持拖动排序，最近 30 个发布版本可以回滚。保存后才会正式更新公开页面。后台不会出现在网站导航中。</p>
      </section>
      <AdminEditor initialContent={content} />
    </main>
  );
}
