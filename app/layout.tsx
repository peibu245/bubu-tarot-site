import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "不不tarot｜梦向解读与现实问题咨询",
  description: "不不tarot的个人网站：梦占、传讯、现实问题咨询、OC与特殊主题、价格、预约流程和互动抽牌。",
  other: { "codex-preview": "development" },
  icons: { icon: "/brand-mark.jpg", shortcut: "/brand-mark.jpg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
