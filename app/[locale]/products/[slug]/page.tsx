import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, LinkArrow, Mark, PageHero } from "@/components/SiteShell";
import { ProductGallery } from "@/components/ProductGallery";
import { getLocale, getLocalized } from "@/lib/content";
import { getPublicProduct, listPublicProducts } from "@/lib/repositories/public";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = getLocale(raw);
  const product = await getPublicProduct(slug, locale);
  if (!product) return {};
  return { title: getLocalized(product.name, locale), description: getLocalized(product.description, locale), openGraph: { title: getLocalized(product.name, locale), description: getLocalized(product.description, locale), images: [product.image] } };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = getLocale(raw);
  const en = locale === "en";
  const product = await getPublicProduct(slug, locale);
  if (!product) notFound();
  const related = (await listPublicProducts(locale)).filter((item) => product.relatedSlugs.includes(item.slug));
  const quoteHref = `/${locale}/request-quote?category=${encodeURIComponent(product.slug)}&productSlug=${encodeURIComponent(product.slug)}&source=product_detail`;
  const jsonLd = { "@context": "https://schema.org", "@type": "Service", name: getLocalized(product.name, locale), description: getLocalized(product.description, locale), areaServed: "United Arab Emirates", provider: { "@type": "Organization", name: "Getimex General Trading L.L.C." }, image: product.media.map((media) => media.src) };
  return <main>
    <PageHero index={product.eyebrow} label={en ? "Supply family" : "فئة توريد"} title={getLocalized(product.name, locale)} body={getLocalized(product.description, locale)} image={product.image}>
      <nav className="breadcrumbs" aria-label={en ? "Breadcrumb" : "مسار التنقل"}><Link href={`/${locale}`}>{en ? "Home" : "الرئيسية"}</Link><span aria-hidden="true">/</span><Link href={`/${locale}/products`}>{en ? "Products" : "المنتجات"}</Link><span aria-hidden="true">/</span><span>{getLocalized(product.name, locale)}</span></nav>
    </PageHero>
    <section className="section section-white">
      <div className="product-detail-layout">
        <ProductGallery product={product} locale={locale} />
        <div className="detail-copy detail-sticky">
          <div className="eyebrow" data-reveal><Mark />{product.eyebrow} / {en ? "Getimex supply" : "توريد Getimex"}</div>
          <h2 data-reveal>{getLocalized(product.title, locale)}</h2>
          <p data-reveal>{getLocalized(product.details, locale)}</p>
          <div className="spec-panel" data-reveal>
            <div className="spec-panel-head"><span>{en ? "Supply sheet" : "بطاقة التوريد"}</span><span>GTX-{product.eyebrow}</span></div>
            {product.specifications.map((specification) => <div className="spec-row" key={specification.label.en}><strong>{getLocalized(specification.label, locale)}</strong><span>{getLocalized(specification.value, locale)}</span></div>)}
          </div>
          <p className="availability-note" data-reveal>{getLocalized(product.availabilityNote, locale)}</p>
          <div className="detail-actions" data-reveal>
            <LinkArrow href={quoteHref} className="button button-orange button-large" track="quote_open">{en ? "Ask for a quotation" : "اطلب عرض سعر"}</LinkArrow>
            <a className="button button-line button-large" href="https://wa.me/971504205069" target="_blank" rel="noreferrer" data-track="whatsapp_click">WhatsApp<Arrow /></a>
          </div>
        </div>
      </div>
      {related.length > 0 && <div className="related-section">
        <div className="eyebrow" data-reveal><Mark />{en ? "Related supply areas" : "مجالات توريد مرتبطة"}</div>
        <div className="related-grid">{related.map((item, index) => <Link className="related-card" href={`/${locale}/products/${item.slug}`} key={item.slug} data-reveal style={{ "--d": index * 90 } as React.CSSProperties}><span className="category-number">{item.eyebrow}</span><h3>{getLocalized(item.name, locale)}</h3><p>{getLocalized(item.description, locale)}</p></Link>)}</div>
      </div>}
    </section>
    <div className="mobile-sticky-quote"><LinkArrow href={quoteHref} className="button button-orange" track="quote_open">{en ? "Request a quotation" : "اطلب عرض سعر"}</LinkArrow></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </main>;
}
