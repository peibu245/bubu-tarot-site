import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminPath, isAdminSession, publicUrl } from "../../vps-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "后台登录",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminSession()) redirect(publicUrl(adminPath()));
  const { error } = await searchParams;

  return (
    <main className="admin-shell denied">
      <section className="admin-denied">
        <span>PRIVATE EDITOR</span>
        <h1>登录内容后台</h1>
        <p>{error === "locked" ? "尝试次数过多，请稍后再试。" : error ? "密码不正确。" : "输入管理密码后才能修改价格和活动。"}</p>
        <form className="editor" style={{ width: "100%", marginTop: 28 }} action="/api/studio-85810eea57bc0ee6/login" method="post">
          <label style={{ textAlign: "left" }}>
            管理密码
            <input name="password" type="password" autoComplete="current-password" required minLength={12} autoFocus />
          </label>
          <button className="admin-add" style={{ marginTop: 20, minHeight: 44, paddingInline: 24 }} type="submit">登录</button>
        </form>
        <Link href="/">返回公开网站</Link>
      </section>
    </main>
  );
}
