import Image from "next/image";
import { ContactBand, LinkArrow, Mark, PageHero, SectionHeading } from "@/components/SiteShell";
import { getCopy, getLocale, homeCopy, photos } from "@/lib/content";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const h = homeCopy[locale];
  const en = locale === "en";
  return <main>
    <PageHero index="01" label={t.nav.about} title={t.aboutTitle} body={t.aboutIntro} image={photos.dubai} />
    <section className="section section-white about-split">
      <div className="about-copy">
        <div className="eyebrow" data-reveal><Mark />{en ? "Vision · Mission · Values" : "الرؤية · الرسالة · القيم"}</div>
        <h2 data-reveal>{en ? "A partner shaped by reliability." : "شريك تصنعه الموثوقية."}</h2>
        <p className="lead" data-reveal>{t.aboutBody}</p>
        <dl className="proof-row" data-reveal>{t.proof.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        <div className="about-cta" data-reveal><LinkArrow href={`/${locale}/request-quote`} className="button button-orange button-large">{t.quote}</LinkArrow></div>
      </div>
      <figure className="about-figure" data-reveal="clip">
        <div className="about-figure-img"><div className="parallax-layer" data-parallax="0.08"><Image src={photos.valves} alt={en ? "Industrial valves and piping" : "صمامات وأنابيب صناعية"} fill sizes="(max-width: 1024px) 100vw, 45vw" /></div></div>
        <figcaption className="mono">{en ? "Fig. 02 — Valves & piping" : "شكل 02 — الصمامات والأنابيب"}</figcaption>
      </figure>
    </section>
    <section className="section section-paper">
      <div className="mission-grid">
        <article className="mission-card" data-reveal><p className="mono-label">{en ? "Vision" : "الرؤية"}</p><p>{en ? "To become a trusted regional leader in general trading and supply solutions." : "أن نصبح شريكًا إقليميًا موثوقًا ورائدًا في التجارة العامة وحلول التوريد."}</p></article>
        <article className="mission-card" data-reveal style={{ "--d": 120 } as React.CSSProperties}><p className="mono-label">{en ? "Mission" : "الرسالة"}</p><p>{en ? "To bring the right products, sourced responsibly, with a professional response at every step." : "توفير المنتجات المناسبة بمصادر مسؤولة واستجابة احترافية في كل خطوة."}</p></article>
      </div>
    </section>
    <section className="section section-white">
      <SectionHeading eyebrow={en ? "What guides us" : "ما يوجّهنا"} title={en ? "Clear priorities. Practical service." : "أولويات واضحة. خدمة عملية."} body={en ? "We work with integrity, quality, customer focus and a steady commitment to improvement." : "نعمل بالنزاهة والجودة والتركيز على العميل والالتزام المستمر بالتطوير."} />
      <div className="values-grid">{h.principles.map((item, index) => <article className="value-item" key={item.n} data-reveal style={{ "--d": index * 100 } as React.CSSProperties}><span className="big">{item.n}</span><h3>{item.t}</h3><p>{item.d}</p></article>)}</div>
    </section>
    <ContactBand locale={locale} title={t.contactTitle} body={t.contactBody} />
  </main>;
}
