"use client";

import { useMemo, useState } from "react";
import { ApiState, PageHead, Switch, TableSkeleton, relTime, send, useApi, useToast } from "@/components/admin/ui";
import { IconBox, IconExternal, IconSearch } from "@/components/admin/AdminIcons";

type Spec = { labelEn: string; labelAr: string; valueEn: string; valueAr: string; sortOrder: number };
type Product = {
  id: string; slug: string; categoryId: string; titleEn: string; titleAr: string;
  shortDescriptionEn: string; shortDescriptionAr: string; descriptionEn: string; descriptionAr: string;
  availabilityNoteEn: string; availabilityNoteAr: string; isFeatured: boolean; isPublished: boolean; sortOrder: number; updatedAt: string;
  category: { id: string; nameEn: string; image: string | null }; specifications: Spec[]; media: { url: string; approved: boolean }[];
};

/** The PATCH endpoint replaces the whole record, so always send every field from the current product. */
function payload(product: Product, patch: Partial<Product>) {
  const next = { ...product, ...patch };
  return {
    categoryId: next.categoryId, slug: next.slug, titleEn: next.titleEn, titleAr: next.titleAr,
    shortDescriptionEn: next.shortDescriptionEn, shortDescriptionAr: next.shortDescriptionAr,
    descriptionEn: next.descriptionEn, descriptionAr: next.descriptionAr,
    availabilityNoteEn: next.availabilityNoteEn, availabilityNoteAr: next.availabilityNoteAr,
    isFeatured: next.isFeatured, isPublished: next.isPublished, sortOrder: next.sortOrder,
    specifications: next.specifications.map(({ labelEn, labelAr, valueEn, valueAr, sortOrder }) => ({ labelEn, labelAr, valueEn, valueAr, sortOrder })),
  };
}

export function AdminProductsTable() {
  const api = useApi<Product[]>("/api/admin/products");
  const { node: toast, show } = useToast();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "live" | "draft" | "featured">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const items = useMemo(() => api.data ?? [], [api.data]);
  const visible = items.filter((p) => (view === "all" || (view === "live" && p.isPublished) || (view === "draft" && !p.isPublished) || (view === "featured" && p.isFeatured)) && (!query.trim() || [p.titleEn, p.titleAr, p.slug, p.category.nameEn].some((v) => v.toLowerCase().includes(query.trim().toLowerCase()))));

  async function save(product: Product, patch: Partial<Product>, message: string) {
    setBusy(product.id);
    try {
      await send(`/api/admin/products/${product.id}`, "PATCH", payload(product, patch));
      api.setData((current) => current?.map((row) => row.id === product.id ? { ...row, ...patch } : row) ?? null);
      show(message);
    } catch (error) { show(error instanceof Error ? error.message : "Unable to save this product", true); }
    setBusy(null);
  }

  const count = (fn: (p: Product) => boolean) => items.filter(fn).length;
  return <>
    <PageHead title="Products" body="Choose what appears in the public catalogue and which supply areas are featured.">
      <a className="btn" href="/en/products" target="_blank"><IconExternal size={15} />View catalogue</a>
    </PageHead>
    <div className="toolbar">
      <div className="tabs" role="group" aria-label="Filter products">
        {([["all", "All", items.length], ["live", "Published", count((p) => p.isPublished)], ["draft", "Drafts", count((p) => !p.isPublished)], ["featured", "Featured", count((p) => p.isFeatured)]] as const).map(([key, text, n]) => <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)}>{text} <span className="n">{n}</span></button>)}
      </div>
      <label className="search"><IconSearch size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" aria-label="Search products" /></label>
    </div>
    <div className="panel">
      {api.loading ? <TableSkeleton cols={5} /> : api.error ? <ApiState status={api.status} error={api.error} onRetry={api.reload} /> : !visible.length ? <div className="state"><span className="state-ico"><IconBox size={24} /></span><h3>{items.length ? "No products in this view" : "The catalogue is empty"}</h3><p>{items.length ? "Try another filter or clear the search." : "Run the seed script to load the six approved supply families."}</p></div> :
        <div className="table-wrap"><table className="table"><thead><tr><th>Product</th><th>Category</th><th>Status</th><th>Featured</th><th>Published</th><th style={{ textAlign: "right" }}>Updated</th></tr></thead><tbody>
          {visible.map((p) => {
            const image = p.media.find((m) => m.approved)?.url ?? p.category.image;
            return <tr key={p.id}>
              <td><div className="cell-media"><span className="thumb">{image && <img src={image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</span><div><span className="primary">{p.titleEn}</span><span className="sub" dir="rtl" style={{ textAlign: "left" }}>{p.titleAr}</span></div></div></td>
              <td>{p.category.nameEn}</td>
              <td><span className={`pill ${p.isPublished ? "pill-live" : "pill-draft"}`}>{p.isPublished ? "Live" : "Draft"}</span></td>
              <td><Switch checked={p.isFeatured} disabled={busy === p.id} label={`Feature ${p.titleEn}`} onChange={() => save(p, { isFeatured: !p.isFeatured }, p.isFeatured ? "Removed from featured" : "Marked as featured")} /></td>
              <td><Switch checked={p.isPublished} disabled={busy === p.id} label={`Publish ${p.titleEn}`} onChange={() => save(p, { isPublished: !p.isPublished }, p.isPublished ? "Moved to drafts" : "Published to the website")} /></td>
              <td className="num" style={{ textAlign: "right" }}>{relTime(p.updatedAt)}</td>
            </tr>;
          })}
        </tbody></table></div>}
    </div>
    {toast}
  </>;
}
