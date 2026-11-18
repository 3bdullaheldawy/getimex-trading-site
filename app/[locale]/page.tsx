import Image from "next/image";
import { SectorRail } from "@/components/SectorRail";
import { TradeGlobe } from "@/components/TradeGlobe";
import { ContactBand, LinkArrow, Mark, SectionIndex } from "@/components/SiteShell";
import { DubaiClock, ScrollWords } from "@/components/Motion";
import { getCopy, getLocale, homeCopy, photos } from "@/lib/content";
import { listPublicCategories } from "@/lib/repositories/public";

const css = (vars: Record<string, string | number>) => vars as React.CSSProperties;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const h = homeCopy[locale];
  const en = locale === "en";
  const categories = await listPublicCategories(locale);
  const titleLines = en ? ["Connecting Global Markets", "with Quality Products", "and Reliable Supply Solutions."] : ["نربط الأسواق", "بمنتجات عالية الجودة", "وحلول التوريد الموثوقة."];
  const stepImages = [photos.valves, photos.steel, photos.containers, photos.ship];
  let n = 0;

  return <main className="home">
    <section className="hero">
      <div className="hero-media"><div className="parallax-layer" data-parallax="0.18"><Image src={photos.hero} alt={en ? "Refinery towers lit at dusk" : "أبراج مصفاة مضاءة عند الغروب"} fill priority sizes="100vw" /></div></div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="rules" aria-hidden="true" />
      <div className="hero-inner">
        <p className="hero-kicker"><Mark /><span>{t.heroKicker}</span></p>
        <h1 className="hero-title" aria-label={titleLines.join(" ")}>
          {titleLines.map((line, li) => <span className={`line ${li === 1 ? "accent" : ""}`} key={line} aria-hidden="true">
            {en
              ? [...line].map((ch, ci) => <span className="ch" key={ci} style={css({ "--i": n++ })}>{ch === " " ? " " : ch}</span>)
              : line.split(" ").map((word, wi) => <span className="ch" key={wi} style={css({ "--i": (n++) * 2.4 })}>{word}{wi < line.split(" ").length - 1 ? " " : ""}</span>)}
          </span>)}
        </h1>
        <div className="hero-foot">
          <p className="hero-body">{t.heroBody}</p>
          <div className="hero-actions">
            <span data-magnetic className="magnet"><LinkArrow href={`/${locale}/request-quote`} className="button button-orange button-large">{t.quote}</LinkArrow></span>
            <LinkArrow href={`/${locale}/products`} className="button button-ghost">{t.discover}</LinkArrow>
          </div>
        </div>
      </div>
      <aside className="manifest" aria-label={h.manifest}>
        <div className="manifest-head"><span>{h.manifest}</span><span className="mono">GTX / DXB</span></div>
        <dl>
          {h.rows.map((row) => <div key={row.k}><dt>{row.k}</dt><dd>{row.v}</dd></div>)}
          <div><dt>{h.localTime}</dt><dd className="live"><i aria-hidden="true" /><DubaiClock /></dd></div>
        </dl>
      </aside>
      <div className="scroll-cue" aria-hidden="true"><span className="mono">{t.scroll}</span><i /></div>
    </section>

    <div className="marquee-xl" aria-hidden="true">
      <div className="marquee-xl-track">{[0, 1].map((copy) => <div className="marquee-xl-group" key={copy}>{h.marquee.map((word) => <span key={word}>{word}<Mark /></span>)}</div>)}</div>
    </div>

    <section className="statement section">
      <SectionIndex index="01" label={t.sectionBusiness} />
      <ScrollWords text={h.statement} className="statement-text" />
      <dl className="facts">
        {h.facts.map((fact) => <div key={fact.l} className="fact"><dd><span data-counter={fact.n}>00</span></dd><dt>{fact.l}</dt></div>)}
      </dl>
    </section>

    <section className="section section-ink globe-section" data-cursor-tone="light">
      <div className="globe-head">
        <SectionIndex index="02" label={h.globeKicker} />
        <h2 data-split>{h.globeTitle}</h2>
        <p>{h.globeBody}</p>
      </div>
      <TradeGlobe locale={locale} />
      <p className="globe-note mono">{h.globeNote}</p>
    </section>

    <SectorRail categories={categories} locale={locale} title={h.indexTitle} kicker={t.sectionCategories} body={h.railBody} />

    <section className="section section-paper process-stack">
      <div className="process-stack-head">
        <SectionIndex index="04" label={h.processEyebrow} />
        <h2 data-split>{h.processTitle}</h2>
        <p>{t.servicesBody}</p>
      </div>
      <div className="stack">
        {h.steps.map((step, i) => <article className="stack-card" key={step.title} style={css({ "--i": i })}>
          <div className="stack-card-inner">
            <div className="stack-copy">
              <span className="stack-no">0{i + 1}<small>/0{h.steps.length}</small></span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              {i === h.steps.length - 1 && <LinkArrow href={`/${locale}/services`} className="text-link light">{t.nav.services}</LinkArrow>}
            </div>
            <div className="stack-img"><Image src={stepImages[i]} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" /></div>
          </div>
        </article>)}
      </div>
    </section>

    <section className="section section-white about-split">
      <figure className="about-figure" data-reveal="clip">
        <div className="about-figure-img"><div className="parallax-layer" data-parallax="0.08"><Image src={photos.ship} alt={en ? "Container vessel at a port crane" : "سفينة حاويات عند رافعة ميناء"} fill sizes="(max-width: 900px) 100vw, 45vw" /></div></div>
        <figcaption className="mono">{h.figure}</figcaption>
      </figure>
      <div className="about-copy">
        <SectionIndex index="05" label={t.readAbout} />
        <h2 data-split>{t.sectionAbout}</h2>
        <p className="lead" data-reveal>{t.aboutBody}</p>
        <dl className="proof-row" data-reveal style={css({ "--d": 100 })}>{t.proof.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        <ul className="principles">{h.principles.map((p, i) => <li key={p.n} data-reveal style={css({ "--d": 160 + i * 80 })}><span className="mono">{p.n}</span><div><strong>{p.t}</strong><p>{p.d}</p></div></li>)}</ul>
        <LinkArrow href={`/${locale}/about`} className="text-link">{t.readAbout}</LinkArrow>
      </div>
    </section>

    <ContactBand locale={locale} title={t.contactTitle} body={t.contactBody} />
  </main>;
}
