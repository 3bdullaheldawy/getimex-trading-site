import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCopy, getLocale, homeCopy, type Locale } from "@/lib/content";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SiteHeader } from "@/components/SiteHeader";
import { DubaiClock, MotionProvider } from "@/components/Motion";
import { Cursor, Effects, Preloader, ScrollProgress, SmoothScroll } from "@/components/motion/Experience";
import { Arrow, ChatIcon, PhoneIcon, PinIcon } from "@/components/Icons";

export { Arrow };

function navItems(locale: Locale) {
  const t = getCopy(locale);
  return [
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/activities`, label: t.nav.activities },
    { href: `/${locale}/products`, label: t.nav.products },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/projects`, label: t.nav.projects },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];
}

export function SectionIndex({ index, label }: { index: string; label: string }) {
  return <p className="section-index"><span className="mono">{index}</span><i /><span>{label}</span></p>;
}

/** Two skewed bars borrowed from the Getimex mark. */
export function Mark({ className = "" }: { className?: string }) { return <span className={`mark ${className}`} aria-hidden="true"><i /><i /></span>; }

export function Footer({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const en = locale === "en";
  return <footer className="site-footer">
    <div className="footer-cta" data-reveal>
      <p className="mono-label">{en ? "Have a requirement?" : "لديك احتياج؟"}</p>
      <Link href={`/${locale}/request-quote`} className="footer-cta-link" data-track="quote_open"><span>{t.quote}</span><Arrow /></Link>
    </div>
    <div className="footer-grid">
      <div className="footer-brand">
        <Image src="/images/logo-light.png" alt="Getimex General Trading L.L.C." width={560} height={233} />
        <p>{t.footer}</p>
      </div>
      <div className="footer-col">
        <p className="mono-label">{en ? "Company" : "الشركة"}</p>
        {navItems(locale).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </div>
      <div className="footer-col">
        <p className="mono-label">{en ? "Office" : "المكتب"}</p>
        <a href="tel:+971504205069" data-track="phone_click" dir="ltr">{t.phone}</a>
        <a href="https://wa.me/971504205069" target="_blank" rel="noreferrer" data-track="whatsapp_click">WhatsApp</a>
        <span>{t.address}</span>
      </div>
      <div className="footer-col footer-time">
        <p className="mono-label">{en ? "Local time · Dubai" : "التوقيت المحلي · دبي"}</p>
        <DubaiClock withSeconds={false} />
        <span className="mono-small">25.2697° N · 55.3095° E</span>
      </div>
    </div>
    <div className="footer-word" aria-hidden="true" data-letters>{"GETIMEX".split("").map((ch, i) => <b key={i}>{ch}</b>)}<span /></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Getimex General Trading L.L.C.</span><span>{en ? "Dubai, United Arab Emirates" : "دبي، الإمارات العربية المتحدة"}</span></div>
  </footer>;
}

export function WhatsAppButton({ locale }: { locale: Locale }) {
  return <a className="whatsapp-fab" href="https://wa.me/971504205069" data-track="whatsapp_click" target="_blank" rel="noreferrer" aria-label={locale === "en" ? "Chat on WhatsApp" : "تواصل عبر واتساب"}><ChatIcon size={22} /><span className="whatsapp-label">{locale === "en" ? "Chat with us" : "تحدث معنا"}</span></a>;
}

export function PageFrame({ locale, children }: { locale: string; children: React.ReactNode }) {
  const current = getLocale(locale);
  const t = getCopy(current);
  return <div lang={current} dir={current === "ar" ? "rtl" : "ltr"} className={`site ${current === "ar" ? "rtl" : "ltr"}`}>
    <Preloader locale={current} />
    <ScrollProgress />
    <AnalyticsTracker />
    <MotionProvider />
    <SmoothScroll />
    <Effects />
    <Cursor />
    <SiteHeader locale={current} nav={navItems(current)} quote={t.quote} phone={t.phone} address={t.address} />
    {children}
    <WhatsAppButton locale={current} />
    <Footer locale={current} />
  </div>;
}

export function SectionHeading({ eyebrow, title, body, align = "left", tone }: { eyebrow: string; title: string; body?: string; align?: "left" | "center"; tone?: "dark" }) {
  return <div className={`section-heading ${align === "center" ? "center" : ""} ${tone === "dark" ? "on-dark" : ""}`}>
    <div className="eyebrow" data-reveal><Mark />{eyebrow}</div>
    <h2 data-split>{title}</h2>
    {body && <p data-reveal style={{ "--d": 160 } as React.CSSProperties}>{body}</p>}
  </div>;
}

export function PageHero({ index, label, title, body, image, children }: { index: string; label: string; title: string; body?: string; image?: string; children?: React.ReactNode }) {
  return <section className="page-hero">
    {image && <div className="page-hero-media"><div data-parallax="0.12" className="parallax-layer"><Image src={image} alt="" fill priority sizes="100vw" /></div></div>}
    <div className="rules" aria-hidden="true" />
    <div className="page-hero-inner">
      {children}
      <div className="eyebrow light"><Mark /><span className="mono">{index}</span>{label}</div>
      <h1 className="split-title">{title.split(" ").map((word, i) => <Fragment key={i}>{i > 0 && " "}<span className="w"><span style={{ animationDelay: `${120 + i * 55}ms` }}>{word}</span></span></Fragment>)}</h1>
      {body && <p className="page-hero-body">{body}</p>}
    </div>
  </section>;
}

export function ContactBand({ locale, title, body, href }: { locale: Locale; title: string; body: string; href?: string }) {
  const t = getCopy(locale);
  return <section className="cta-band">
    <div className="cta-stripes" aria-hidden="true" />
    <div className="cta-copy">
      <p className="mono cta-kicker" data-reveal>{homeCopy[locale].ctaKicker}</p>
      <h2 data-split>{title}</h2>
      <p>{body}</p>
    </div>
    <Link href={href ?? `/${locale}/request-quote`} className="cta-badge" data-magnetic data-track="quote_open" aria-label={t.quote}>
      <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id={`badge-${locale}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs><text><textPath href={`#badge-${locale}`} textLength="486">{homeCopy[locale].badge.repeat(2)}</textPath></text></svg>
      <span className="cta-badge-core"><Arrow /></span>
    </Link>
    <div className="cta-actions" data-reveal style={{ "--d": 120 } as React.CSSProperties}>
      <LinkArrow href={href ?? `/${locale}/request-quote`} className="button button-ink button-large">{t.quote}</LinkArrow>
      <a className="cta-line" href="tel:+971504205069" data-track="phone_click"><PhoneIcon size={16} /><span dir="ltr">{t.phone}</span></a>
      <span className="cta-line"><PinIcon size={16} />{t.address}</span>
    </div>
  </section>;
}

export function LinkArrow({ href, children, className = "text-link", track }: { href: string; children: React.ReactNode; className?: string; track?: string }) { return <Link href={href} className={className} data-track={track ?? (href.includes("request-quote") ? "quote_open" : undefined)}>{children}<Arrow /></Link>; }
