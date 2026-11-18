import Image from "next/image";
import { LinkArrow, PageHero, SectionHeading } from "@/components/SiteShell";
import { getCopy, getLocale, mediaAssets, photos, type MediaAsset } from "@/lib/content";

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = getLocale(raw);
  const t = getCopy(locale);
  const en = locale === "en";
  const approvedProjects = mediaAssets.filter((asset) => asset.approved);
  const seen = new Set<string>();
  const sectorMedia = mediaAssets.filter((asset) => !asset.approved && !seen.has(asset.src) && seen.add(asset.src)).slice(0, 6);
  const card = (asset: MediaAsset, index: number) => <figure className="media-card" key={`${asset.category}-${asset.sortOrder}`} data-reveal style={{ "--d": (index % 2) * 90 } as React.CSSProperties}>
    <div className="media-card-image"><Image src={asset.src} alt={asset.alt[locale]} fill sizes="(max-width: 720px) 100vw, 50vw" /></div>
    <figcaption><span>{asset.caption[locale]}</span><small>{String(index + 1).padStart(2, "0")}</small></figcaption>
  </figure>;
  return <main>
    <PageHero index="05" label={t.nav.projects} title={t.projectsTitle} body={t.projectsBody} image={photos.ship} />
    <section className="section section-paper">
      <SectionHeading eyebrow={en ? "Sector gallery" : "معرض القطاعات"} title={en ? "A visual map of the supply areas." : "خريطة بصرية لمجالات التوريد."} body={en ? "The current images show the sectors Getimex supports. They are presented as sector references until approved project photography is available." : "تعرض الصور الحالية القطاعات التي تدعمها Getimex. تظهر كصور مرجعية للقطاعات إلى حين اعتماد صور المشروعات."} />
      <div className="media-grid">{sectorMedia.map(card)}</div>
    </section>
    <section className="section section-white">
      <SectionHeading eyebrow={en ? "Approved work" : "أعمال معتمدة"} title={en ? "Project proof will appear here after approval." : "ستظهر المشروعات هنا بعد اعتمادها."} />
      {approvedProjects.length ? <div className="media-grid">{approvedProjects.map(card)}</div> : <div className="approval-placeholder" data-reveal><span>{en ? "AWAITING APPROVAL" : "بانتظار الاعتماد"}</span><p>{en ? "No client projects are published yet. We only publish what the team has confirmed." : "لا توجد مشروعات عملاء منشورة حتى الآن. ننشر فقط ما يعتمده الفريق."}</p></div>}
      <LinkArrow href={`/${locale}/contact`} className="text-link">{t.nav.contact}</LinkArrow>
    </section>
  </main>;
}
