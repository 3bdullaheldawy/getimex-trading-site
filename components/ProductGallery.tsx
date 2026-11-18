"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale, Product } from "@/lib/content";

export function ProductGallery({ product, locale }: { product: Product; locale: Locale }) {
  const [active, setActive] = useState(0);
  const selected = product.media[active] ?? product.media[0];
  if (!selected) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return <div className="product-gallery" data-reveal>
    <div className="product-gallery-main">
      <Image key={selected.src} src={selected.src} alt={selected.alt[locale]} fill sizes="(max-width: 1024px) 100vw, 55vw" priority />
      <span className="gallery-index">{pad(active + 1)} / {pad(product.media.length)}</span>
    </div>
    {product.media.length > 1 && <div className="product-gallery-thumbs" role="group" aria-label={locale === "en" ? "Product images" : "صور الفئة"}>
      {product.media.map((media, index) => <button key={media.src} type="button" className={index === active ? "gallery-thumb active" : "gallery-thumb"} onClick={() => setActive(index)} aria-pressed={index === active} aria-label={`${locale === "en" ? "View image" : "عرض الصورة"} ${index + 1}`}><Image src={media.src} alt="" fill sizes="96px" /></button>)}
    </div>}
    {selected.caption[locale] && <p className="gallery-caption">{selected.caption[locale]}</p>}
  </div>;
}
