"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { copy?: Record<string, string> };

export default function MobileNav({ copy = {} }: Props) {
  const [open, setOpen] = useState(false);
  const brand = copy.siteBrand || "不不tarot";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => setOpen(false);

  return <>
    <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen(true)}>
      <span aria-hidden="true">☰</span><span>菜单</span>
    </button>
    {open && <div className="mobile-menu-layer" onMouseDown={close}>
      <nav className="mobile-menu" id="mobile-site-menu" aria-label="手机网站导航" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mobile-menu-head"><b>{brand}</b><button type="button" onClick={close} aria-label="关闭菜单">×</button></div>
        <Link href="/" onClick={close}>首页</Link>
        <Link href="/dream" onClick={close}>{copy.navDream || "梦向解读"}</Link>
        <Link href="/reality" onClick={close}>{copy.navReality || "现实问题咨询"}</Link>
        <Link href="/ideas" onClick={close}>其他主题</Link>
        <Link href="/booking" onClick={close}>预约与联系方式</Link>
        <Link href="/policies" onClick={close}>服务说明与隐私规则</Link>
        <Link href="/#guestbook" onClick={close}>留言板</Link>
      </nav>
    </div>}
    <div className="mobile-bottom-actions" aria-label="快速操作">
      <Link href="/#services">查看服务</Link>
      <Link href="/booking#contact">联系咨询</Link>
    </div>
  </>;
}
