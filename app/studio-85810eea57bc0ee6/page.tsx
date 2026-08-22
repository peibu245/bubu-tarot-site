import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import AdminEditor from "../admin/AdminEditor";
import { getSiteContent, isOwner } from "../../lib/site-content";

const ADMIN_PATH = "/studio-85810eea57bc0ee6";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "内容管理",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function PrivateStudioPage() {
  const user = await requireChatGPTUser(ADMIN_PATH);
  const allowed = await isOwner(user.email);

  if (!allowed) {
    return (
      <main className="admin-shell denied">
        <div className="admin-denied">
          <span>ACCESS DENIED</span>
          <h1>无法访问此页面。</h1>
          <p>当前登录账号没有编辑权限。</p>
          <Link href="/">回到网站　→</Link>
        </div>
      </main>
    );
  }

  const content = await getSiteContent();
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand dark-brand" href="/">
          <img src="/brand-mark.jpg" alt="" />
          <span>不不tarot</span>
        </Link>
        <div>
          <span>已作为 {user.displayName} 登录</span>
          <a href={chatGPTSignOutPath("/")}>退出</a>
        </div>
      </header>
      <section className="admin-intro">
        <p className="eyebrow dark">PRIVATE EDITOR</p>
        <h1>网站内容后台</h1>
        <p>这里现在更像你自己的轻量网页编辑器：页面文字可以边改边预览，公开页面可添加模块、拖动排序，并保留最近的发布历史以便回滚。价格、活动、联系方式和政策也继续集中管理。</p>
      </section>
      <AdminEditor initialContent={content} />
    </main>
  );
}
