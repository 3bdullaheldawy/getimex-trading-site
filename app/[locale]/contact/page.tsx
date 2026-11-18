import Image from "next/image";
import { ContactBand, Mark, PageHero } from "@/components/SiteShell";
import { ChatIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { getCopy, getLocale, photos } from "@/lib/content";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const en = locale === "en";
  return <main>
    <PageHero index="06" label={t.nav.contact} title={t.contactPageTitle} body={t.contactBody} image={photos.dubai} />
    <section className="section section-white">
      <div className="form-layout">
        <div>
          <div className="eyebrow" data-reveal><Mark />{en ? "Getimex office" : "مكتب Getimex"}</div>
          <h2 className="h2-like" data-reveal>{t.contactTitle}</h2>
          <p className="dark-copy" data-reveal>{t.contactBody}</p>
          <div className="contact-details" data-reveal>
            <a href="tel:+971504205069" data-track="phone_click"><span className="ico"><PhoneIcon /></span><span><strong>{en ? "Phone" : "الهاتف"}</strong><span dir="ltr">{t.phone}</span></span></a>
            <a href="https://wa.me/971504205069" data-track="whatsapp_click" target="_blank" rel="noreferrer"><span className="ico"><ChatIcon /></span><span><strong>{en ? "WhatsApp" : "واتساب"}</strong><span>{en ? "Start a chat" : "ابدأ محادثة"}</span></span></a>
            <div><span className="ico"><PinIcon /></span><span><strong>{en ? "Address" : "العنوان"}</strong><span>{t.address}</span></span></div>
          </div>
        </div>
        <div className="contact-map" data-reveal="clip">
          <Image src={photos.dubai} alt="" fill sizes="(max-width: 1024px) 100vw, 55vw" />
          <div className="map-grid" aria-hidden="true" />
          <span className="map-pin" aria-hidden="true" />
          <div className="map-label"><strong>{en ? "Deira, Dubai" : "ديرة، دبي"}</strong><span>25.2697° N · 55.3095° E</span></div>
        </div>
      </div>
    </section>
    <ContactBand locale={locale} title={t.requestTitle} body={t.requestBody} />
  </main>;
}
