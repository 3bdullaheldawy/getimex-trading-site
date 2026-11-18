import { ContactBand, PageHero } from "@/components/SiteShell";
import { ProductCatalog } from "@/components/ProductCatalog";
import { getCopy, getLocale, photos } from "@/lib/content";
import { listPublicCategories, listPublicProducts } from "@/lib/repositories/public";

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string; q?: string }> }) {
  const { locale: raw } = await params;
  const filters = await searchParams;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const [categories, products] = await Promise.all([listPublicCategories(locale), listPublicProducts(locale)]);
  return <main>
    <PageHero index="03" label={t.nav.products} title={t.productsTitle} body={t.productsBody} image={photos.steel} />
    <section className="section section-paper"><ProductCatalog products={products} categories={categories} locale={locale} initialCategory={filters.category} initialQuery={filters.q} /></section>
    <ContactBand locale={locale} title={t.servicesTitle} body={t.servicesBody} />
  </main>;
}
