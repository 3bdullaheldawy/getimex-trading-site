"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/content";
import { Arrow } from "@/components/Icons";

type NavItem = { href: string; label: string };

export function SiteHeader({ locale, nav, quote, phone, address }: { locale: Locale; nav: NavItem[]; quote: string; phone: string; address: string }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const opposite = locale === "en" ? "ar" : "en";
  const switchHref = pathname.replace(/^\/(en|ar)/, `/${opposite}`) || `/${opposite}`;

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (y > 320 && y > last + 4) setHidden(true);
      else if (y < last - 4 || y <= 320) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return <>
    <header className={`site-header ${solid ? "is-solid" : ""} ${hidden && !open ? "is-hidden" : ""} ${open ? "is-open" : ""}`}>
      <Link href={`/${locale}`} className="brand" aria-label="Getimex home">
        <Image className="brand-light" src="/images/logo-light.png" alt="Getimex General Trading L.L.C." width={560} height={233} priority />
        <Image className="brand-ink" src="/images/logo-ink.png" alt="" width={560} height={233} priority />
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {nav.map((item) => <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : undefined} aria-current={isActive(item.href) ? "page" : undefined}><span>{item.label}</span></Link>)}
      </nav>
      <div className="header-actions">
        <Link className="language-switch" href={switchHref} data-track="language_switch" hrefLang={opposite} aria-label={opposite === "ar" ? "التبديل إلى العربية" : "Switch to English"}>
          <span className={locale === "en" ? "on" : ""}>EN</span><span className={locale === "ar" ? "on" : ""}>ع</span>
        </Link>
        <Link className="button button-orange button-small header-cta" href={`/${locale}/request-quote`} data-track="quote_open">{quote}<Arrow /></Link>
        <button type="button" className="burger" aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}><span /><span /></button>
      </div>
    </header>
    <div id="site-menu" className={`site-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <nav className="site-menu-nav">
        {nav.map((item, index) => <Link key={item.href} href={item.href} tabIndex={open ? 0 : -1} style={{ "--i": index } as React.CSSProperties}><small>0{index + 1}</small>{item.label}</Link>)}
      </nav>
      <div className="site-menu-foot">
        <a href="tel:+971504205069" tabIndex={open ? 0 : -1} data-track="phone_click" dir="ltr">{phone}</a>
        <span>{address}</span>
        <Link className="button button-orange" href={`/${locale}/request-quote`} tabIndex={open ? 0 : -1}>{quote}<Arrow /></Link>
      </div>
    </div>
  </>;
}
