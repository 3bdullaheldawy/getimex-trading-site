import { QuoteForm } from "@/components/QuoteForm";
import { Mark, PageHero } from "@/components/SiteShell";
import { PhoneIcon } from "@/components/Icons";
import { getCopy, getLocale, photos } from "@/lib/content";

export default async function RequestQuotePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string; productSlug?: string; source?: string }> }) {
  const { locale: raw } = await params;
  const filters = await searchParams;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const en = locale === "en";
  const steps = en
    ? [["Send the brief", "Share the item, specification, quantity and where it needs to go."], ["We review it", "A member of the team checks the requirement and any open details."], ["You hear back directly", "We follow up with the right next step for your request."]]
    : [["أرسل الموجز", "شاركنا الصنف والمواصفات والكمية ومكان التسليم."], ["نراجع الطلب", "يراجع أحد أعضاء الفريق الاحتياج وأي تفاصيل ناقصة."], ["نتواصل معك مباشرة", "نعود إليك بالخطوة التالية المناسبة لطلبك."]];
  return <main>
    <PageHero index="07" label={t.requestTitle} title={en ? "One clear brief is a strong start." : "موجز واضح هو بداية قوية."} body={t.requestBody} image={photos.welding} />
    <section className="section section-paper">
      <div className="form-layout">
        <div>
          <div className="eyebrow" data-reveal><Mark />{en ? "What happens next" : "ماذا يحدث بعد ذلك"}</div>
          <h2 className="h2-like" data-reveal>{t.requestTitle}</h2>
          <p className="dark-copy" data-reveal>{t.requestBody}</p>
          <ol className="next-steps">{steps.map(([title, body], index) => <li key={title} data-reveal style={{ "--d": index * 90 } as React.CSSProperties}><span className="mono">0{index + 1}</span><div><strong>{title}</strong><p>{body}</p></div></li>)}</ol>
          <div className="contact-details" data-reveal>
            <a href="tel:+971504205069" data-track="phone_click"><span className="ico"><PhoneIcon /></span><span><strong>{en ? "Direct line" : "خط مباشر"}</strong><span dir="ltr">{t.phone}</span></span></a>
          </div>
        </div>
        <QuoteForm locale={locale} initialCategory={filters.category} productSlug={filters.productSlug} source={filters.source ?? "quote_page"} />
      </div>
    </section>
  </main>;
}
