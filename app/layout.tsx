import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bubu-tarot.com"),
  title: "不不tarot｜塔罗解读",
  description: "不不tarot提供梦向解读、现实问题咨询与奇思妙想服务，说明服务边界、预约流程与联系方式。",
  openGraph: {
    title: "不不tarot｜塔罗解读",
    description: "梦向解读与现实问题咨询。先了解服务范围，再选择适合自己的预约入口。",
    type: "website",
    locale: "zh_CN",
    url: "https://bubu-tarot.com",
    siteName: "不不tarot",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "不不tarot｜现实、梦向与OC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "不不tarot｜塔罗解读",
    description: "梦向解读与现实问题咨询。先了解服务范围，再选择适合自己的预约入口。",
    images: ["/og.png"],
  },
  icons: { icon: "/brand-mark.jpg", shortcut: "/brand-mark.jpg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
