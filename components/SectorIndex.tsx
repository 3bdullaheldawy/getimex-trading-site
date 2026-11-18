"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Category, Locale } from "@/lib/content";
import { Arrow } from "@/components/Icons";

/** Editorial index of supply families with a cursor-following image preview. */
export function SectorIndex({ categories, locale }: { categories: Category[]; locale: Locale }) {
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview || !window.matchMedia("(hover: hover)").matches) return;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    const loop = () => {
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      const tilt = Math.max(-6, Math.min(6, (target.x - current.x) * 0.06));
      preview.style.transform = `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      frame = requestAnimationFrame(loop);
    };
    const move = (event: PointerEvent) => {
      const box = list.getBoundingClientRect();
      target.x = event.clientX - box.left - preview.offsetWidth / 2;
      target.y = event.clientY - box.top - preview.offsetHeight / 2;
      if (!frame) { current.x = target.x; current.y = target.y; frame = requestAnimationFrame(loop); }
    };
    const leave = () => { cancelAnimationFrame(frame); frame = 0; };
    list.addEventListener("pointermove", move);
    list.addEventListener("pointerleave", leave);
    return () => { list.removeEventListener("pointermove", move); list.removeEventListener("pointerleave", leave); cancelAnimationFrame(frame); };
  }, []);

  return <div className={`sector-index ${active !== null ? "has-active" : ""}`} ref={listRef} onPointerLeave={() => setActive(null)}>
    {categories.map((category, index) => <Link
      key={category.slug}
      href={`/${locale}/products/${category.slug}`}
      className={`sector-row ${active === index ? "is-active" : ""}`}
      onPointerEnter={() => setActive(index)}
      onFocus={() => setActive(index)}
      onBlur={() => setActive(null)}
      data-reveal
      style={{ "--d": index * 70 } as React.CSSProperties}
    >
      <span className="sector-no">{category.eyebrow}</span>
      <span className="sector-thumb"><Image src={category.image} alt="" fill sizes="96px" /></span>
      <span className="sector-name">{category.name[locale]}</span>
      <span className="sector-desc">{category.description[locale]}</span>
      <span className="sector-go" aria-hidden="true"><Arrow /></span>
    </Link>)}
    <div className="sector-preview" ref={previewRef} aria-hidden="true" data-on={active !== null}>
      {categories.map((category, index) => <div key={category.slug} className={`sector-preview-img ${active === index ? "on" : ""}`}><Image src={category.image} alt="" fill sizes="360px" /></div>)}
    </div>
  </div>;
}

