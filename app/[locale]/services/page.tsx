import { ContactBand, LinkArrow, PageHero, SectionHeading } from "@/components/SiteShell";
import { getCopy, getLocale, photos, services } from "@/lib/content";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const en = locale === "en";
  const serviceItems = services[locale];
  return <main>
    <PageHero index="04" label={t.nav.services} title={t.servicesPageTitle} body={t.servicesBody} image={photos.containers} />
    <section className="section section-white">
      <div className="services-layout">
        <SectionHeading eyebrow={en ? "How we help" : "كيف نساعدك"} title={t.servicesTitle} body={t.servicesBody} />
        <div className="service-detail-list">{serviceItems.map((service, index) => <article className="service-detail-card" key={service.slug} data-reveal style={{ "--d": index * 80 } as React.CSSProperties}>
          <div className="service-detail-number">{service.number}</div>
          <div>
            <h2>{service.title}</h2>
            <p className="service-problem">{service.problem}</p>
            <div className="service-detail-columns"><div><strong>{en ? "Scope" : "النطاق"}</strong><p>{service.scope}</p></div><div><strong>{en ? "Outcome" : "المخرج"}</strong><p>{service.outcome}</p></div></div>
            <LinkArrow href={`/${locale}/request-quote?source=service_${service.slug}`} className="text-link">{t.quote}</LinkArrow>
          </div>
        </article>)}</div>
      </div>
    </section>
    <ContactBand locale={locale} title={t.requestTitle} body={t.requestBody} href={`/${locale}/request-quote?source=services`} />
  </main>;
}
