import { prisma, databaseConfigured } from "@/lib/db";
import { categories as snapshotCategories, photos, products as snapshotProducts, type Locale } from "@/lib/content";

function localeValue(locale: Locale, en: string, ar: string) { return locale === "ar" ? ar : en; }

export async function listPublicCategories(locale: Locale) {
  if (!databaseConfigured()) return snapshotCategories;
  const rows = await prisma.productCategory.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((row) => ({ slug: row.slug, image: row.image ?? photos.welding, eyebrow: String(row.sortOrder + 1).padStart(2, "0"), name: { en: row.nameEn, ar: row.nameAr }, description: { en: row.descriptionEn, ar: row.descriptionAr } }));
}

export async function listPublicProducts(locale: Locale, filters?: { category?: string; q?: string; featured?: boolean }) {
  if (!databaseConfigured()) {
    return snapshotProducts.filter((product) => {
      const categoryMatch = !filters?.category || filters.category === "all" || product.slug === filters.category;
      const featuredMatch = !filters?.featured || product.featured;
      const query = filters?.q?.toLocaleLowerCase() ?? "";
      const queryMatch = !query || [product.name.en, product.name.ar, product.description.en, product.description.ar].some((value) => value.toLocaleLowerCase().includes(query));
      return categoryMatch && featuredMatch && queryMatch;
    });
  }
  const rows = await prisma.product.findMany({
    where: { isPublished: true, ...(filters?.category && filters.category !== "all" ? { category: { slug: filters.category } } : {}), ...(filters?.featured ? { isFeatured: true } : {}), ...(filters?.q ? { OR: [{ titleEn: { contains: filters.q, mode: "insensitive" } }, { titleAr: { contains: filters.q, mode: "insensitive" } }, { shortDescriptionEn: { contains: filters.q, mode: "insensitive" } }, { shortDescriptionAr: { contains: filters.q, mode: "insensitive" } }] } : {}) },
    include: { category: true, specifications: { orderBy: { sortOrder: "asc" } }, media: { where: { approved: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((row) => ({
    slug: row.slug,
    image: row.media[0]?.url ?? row.category.image ?? photos.welding,
    eyebrow: String(row.sortOrder + 1).padStart(2, "0"),
    name: { en: row.titleEn, ar: row.titleAr },
    description: { en: row.shortDescriptionEn, ar: row.shortDescriptionAr },
    title: { en: row.titleEn, ar: row.titleAr },
    details: { en: row.descriptionEn, ar: row.descriptionAr },
    points: { en: ["Specification-led sourcing", "Supplier coordination", "Quotation support"], ar: ["توريد حسب المواصفات", "تنسيق مع الموردين", "دعم طلبات الأسعار"] },
    featured: row.isFeatured,
    specifications: row.specifications.map((spec) => ({ label: { en: spec.labelEn, ar: spec.labelAr }, value: { en: spec.valueEn, ar: spec.valueAr } })),
    media: row.media.map((media) => ({ src: media.url, alt: { en: media.altEn, ar: media.altAr }, caption: { en: media.captionEn ?? "", ar: media.captionAr ?? "" } })),
    availabilityNote: { en: row.availabilityNoteEn, ar: row.availabilityNoteAr },
    relatedSlugs: [],
    category: { slug: row.category.slug, name: { en: row.category.nameEn, ar: row.category.nameAr } },
  }));
}

export async function getPublicProduct(slug: string, locale: Locale) {
  const all = await listPublicProducts(locale);
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getPublicSettings() {
  if (!databaseConfigured()) return null;
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

export function localized(locale: Locale, value: { en: string; ar: string }) { return localeValue(locale, value.en, value.ar); }
