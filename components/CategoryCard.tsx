import Image from "next/image";
import Link from "next/link";
import { getLocalized, type Category, type Locale } from "@/lib/content";
import { Arrow } from "@/components/Icons";

export function CategoryCard({ category, locale, index = 0, featured }: { category: Category; locale: Locale; index?: number; featured?: boolean }) {
  return <Link href={`/${locale}/products/${category.slug}`} className="category-card" data-reveal data-track="product_view" style={{ "--d": (index % 3) * 90 } as React.CSSProperties}>
    <div className="category-image">
      <span className="category-tag">{category.eyebrow}</span>
      <Image src={category.image} alt={getLocalized(category.name, locale)} fill sizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, 33vw" />
    </div>
    <div className="category-content">
      <div>
        <h3>{getLocalized(category.name, locale)}</h3>
        <p>{getLocalized(category.description, locale)}</p>
        {featured && <span className="featured-label">{locale === "en" ? "Featured supply area" : "مجال توريد مميز"}</span>}
      </div>
      <span className="card-arrow" aria-hidden="true"><Arrow /></span>
    </div>
  </Link>;
}
