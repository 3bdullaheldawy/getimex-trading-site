"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Category, Locale } from "@/lib/content";
import { Arrow } from "@/components/Icons";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop: the section pins and the panels travel sideways with the scroll.
 * Touch / narrow / reduced motion: a native swipeable rail with snap points.
 */
export function SectorRail({ categories, locale, title, kicker, body }: { categories: Category[]; locale: Locale; title: string; kicker: string; body: string }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const rtl = locale === "ar";

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
      const el = track.current!, sec = section.current!;
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
      const tween = gsap.to(el, {
        x: () => (rtl ? distance() : -distance()),
        ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.current?.style.setProperty("transform", `scaleX(${self.progress})`);
            if (counter.current) counter.current.textContent = String(Math.min(categories.length, Math.floor(self.progress * categories.length) + 1)).padStart(2, "0");
          },
        },
      });
      if (!rtl) el.querySelectorAll<HTMLElement>(".rail-img-inner").forEach((img) => {
        gsap.fromTo(img, { xPercent: rtl ? 12 : -12 }, { xPercent: rtl ? -12 : 12, ease: "none", scrollTrigger: { trigger: img.closest(".rail-panel"), containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
      if (!rtl) el.querySelectorAll<HTMLElement>(".rail-panel").forEach((panel) => {
        gsap.from(panel.querySelectorAll(".rail-copy > *"), { y: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 85%", once: true } });
      });
      return () => { gsap.set(el, { clearProps: "transform" }); };
    });
    return () => mm.revert();
  }, [categories.length, rtl]);

  return <section className="rail" ref={section}>
    <div className="rail-head">
      <div>
        <p className="section-index"><span className="mono">03</span><i /><span>{kicker}</span></p>
        <h2 data-split>{title}</h2>
      </div>
      <div className="rail-meta">
        <p>{body}</p>
        <div className="rail-progress"><span className="mono"><span ref={counter}>01</span> / {String(categories.length).padStart(2, "0")}</span><b><span ref={progress} /></b></div>
      </div>
    </div>
    <div className="rail-viewport">
      <div className="rail-track" ref={track}>
        {categories.map((category, index) => <Link key={category.slug} href={`/${locale}/products/${category.slug}`} className="rail-panel" data-cursor={rtl ? "استكشف" : "Explore"} data-track="product_view" data-product-slug={category.slug}>
          <div className="rail-img"><div className="rail-img-inner"><Image src={category.image} alt={category.name[locale]} fill sizes="(max-width: 1024px) 85vw, 44vw" /></div></div>
          <div className="rail-copy">
            <span className="rail-no">{category.eyebrow}</span>
            <h3>{category.name[locale]}</h3>
            <p>{category.description[locale]}</p>
            <span className="rail-link">{rtl ? "استكشف الفئة" : "Explore the category"}<Arrow /></span>
          </div>
          <span className="rail-big" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </Link>)}
        <div className="rail-end">
          <p className="mono">{rtl ? "لم تجد ما تبحث عنه؟" : "Need something not listed?"}</p>
          <Link href={`/${locale}/request-quote`} className="rail-end-link" data-track="quote_open">{rtl ? "أرسل المواصفات وسنبحث عنه" : "Send the specification. We will source it."}<Arrow /></Link>
        </div>
      </div>
    </div>
  </section>;
}
