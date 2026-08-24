"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type Props = { copy?: Record<string, string> };
const subscribeToBrowser = () => () => {};
const browserSnapshot = () => true;
const serverSnapshot = () => false;

export default function MobileNav({ copy = {} }: Props) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToBrowser, browserSnapshot, serverSnapshot);
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

  const viewportLayer = <>
    {open && <div className="mobile-menu-layer" onMouseDown={close}>
      <nav className="mobile-menu" id="mobile-site-menu" aria-label="手机网站导航" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mobile-menu-head"><b>{brand}</b><button type="button" onClick={close} aria-label="关闭菜单">×</button></div>
        <Link href="/" onClick={close}>首页</Link>
        <Link href="/#about" onClick={close}>关于</Link>
        <Link href="/#services" onClick={close}>服务</Link>
        <Link href="/booking" onClick={close}>预约</Link>
        <Link href="/#guestbook" onClick={close}>留言</Link>
      </nav>
    </div>}
    <div className="mobile-bottom-actions" aria-label="快速操作">
      <Link href="/#services">查看服务</Link>
      <Link href="/booking#contact">联系咨询</Link>
    </div>
  </>;

  return <>
    <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen(true)}>
      <span aria-hidden="true">☰</span><span>菜单</span>
    </button>
    {mounted && createPortal(viewportLayer, document.body)}
  </>;
}
