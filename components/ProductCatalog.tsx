"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Locale, Product } from "@/lib/content";
import { Arrow, SearchIcon } from "@/components/Icons";

export function ProductCatalog({ products, categories, locale, initialCategory, initialQuery }: { products: Product[]; categories: Category[]; locale: Locale; initialCategory?: string; initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const en = locale === "en";
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [query, setQuery] = useState(initialQuery ?? "");
  const text = (value: { en: string; ar: string }) => value[locale];
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "all" || product.slug === category;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matchesQuery = !normalizedQuery || [product.name.en, product.name.ar, product.description.en, product.description.ar].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    return matchesCategory && matchesQuery;
  }), [category, products, query]);

  function updateUrl(nextCategory: string, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
    if (nextCategory !== category) void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "category_filter", locale, category: nextCategory, path: pathname }) });
  }

  function pick(next: string) { setCategory(next); updateUrl(next, query); }
  function reset() { setCategory("all"); setQuery(""); updateUrl("all", ""); }
  const filterKey = `${category}|${query}`;

  return <div className="catalog-shell">
    <div className="catalog-controls" role="search">
      <label className="catalog-search">
        <span className="sr-only">{en ? "Search products" : "ابحث في المنتجات"}</span>
        <SearchIcon />
        <input value={query} onChange={(event) => { setQuery(event.target.value); updateUrl(category, event.target.value); }} placeholder={en ? "Search supply areas…" : "ابحث في مجالات التوريد…"} />
      </label>
      <div className="chip-row" role="group" aria-label={en ? "Filter by category" : "التصفية حسب الفئة"}>
        <button type="button" className="chip" aria-pressed={category === "all"} onClick={() => pick("all")}>{en ? "All" : "الكل"}</button>
        {categories.map((item) => <button type="button" key={item.slug} className="chip" aria-pressed={category === item.slug} onClick={() => pick(item.slug)}>{text(item.name)}</button>)}
      </div>
    </div>
    <div className="catalog-summary">
      <span><strong>{String(visibleProducts.length).padStart(2, "0")}</strong> {en ? "supply areas" : "مجالات توريد"}{(category !== "all" || query) && <> · <button type="button" className="reset-filter" onClick={reset}>{en ? "Reset" : "إعادة الضبط"}</button></>}</span>
      <span>{en ? "Availability is confirmed per enquiry" : "يتم تأكيد التوافر لكل طلب"}</span>
    </div>
    {visibleProducts.length ? <div className="category-grid" key={filterKey}>{visibleProducts.map((product, index) => <Link key={product.slug} href={`/${locale}/products/${product.slug}`} className="category-card card-enter" style={{ animationDelay: `${index * 60}ms` }} data-track="product_view" data-product-slug={product.slug}>
      <div className="category-image"><span className="category-tag">{product.eyebrow}</span><Image src={product.image} alt={text(product.name)} fill sizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, 33vw" /></div>
      <div className="category-content"><div><h3>{text(product.name)}</h3><p>{text(product.description)}</p>{product.featured && <span className="featured-label">{en ? "Featured supply area" : "مجال توريد مميز"}</span>}</div><span className="card-arrow" aria-hidden="true"><Arrow /></span></div>
    </Link>)}</div> : <div className="empty-state"><span>00 / {en ? "NO MATCH" : "لا نتائج"}</span><h3>{en ? "No supply area matches that search." : "لا توجد فئة توريد مطابقة للبحث."}</h3><p>{en ? "Try another term or return to all categories." : "جرّب كلمة أخرى أو ارجع إلى كل الفئات."}</p><button type="button" className="button button-orange" onClick={reset}>{en ? "View all categories" : "عرض كل الفئات"}</button></div>}
  </div>;
}
