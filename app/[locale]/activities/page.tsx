import { SectorIndex } from "@/components/SectorIndex";
import { ContactBand, PageHero, SectionHeading } from "@/components/SiteShell";
import { getCopy, getLocale, photos } from "@/lib/content";
import { listPublicCategories } from "@/lib/repositories/public";

export default async function ActivitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const categories = await listPublicCategories(locale);
  return <main>
    <PageHero index="02" label={t.nav.activities} title={t.activitiesTitle} body={t.sectionCategoriesBody} image={photos.construction} />
    <section className="section section-paper">
      <SectionHeading eyebrow={locale === "en" ? "Supply areas" : "مجالات التوريد"} title={t.sectionCategories} body={t.productsBody} />
      <SectorIndex categories={categories} locale={locale} />
    </section>
    <ContactBand locale={locale} title={t.contactTitle} body={t.contactBody} />
  </main>;
}
