"use client";

import { useState } from "react";
import { ApiState, PageHead, Switch, TableSkeleton, send, useApi, useToast } from "@/components/admin/ui";
import { IconExternal, IconLayers } from "@/components/admin/AdminIcons";

type Category = { id: string; slug: string; nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; image: string | null; sortOrder: number; isPublished: boolean; _count: { products: number } };

export default function AdminCategoriesPage() {
  const api = useApi<Category[]>("/api/admin/categories");
  const { node: toast, show } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const items = api.data ?? [];

  async function save(category: Category, patch: Partial<Category>, message: string) {
    setBusy(category.id);
    const next = { ...category, ...patch };
    try {
      await send(`/api/admin/categories/${category.id}`, "PATCH", { slug: next.slug, nameEn: next.nameEn, nameAr: next.nameAr, descriptionEn: next.descriptionEn, descriptionAr: next.descriptionAr, image: next.image ?? "", sortOrder: next.sortOrder, isPublished: next.isPublished });
      api.setData((current) => current?.map((row) => row.id === category.id ? next : row) ?? null);
      show(message);
    } catch (error) { show(error instanceof Error ? error.message : "Unable to save", true); }
    setBusy(null);
  }

  function move(index: number, direction: -1 | 1) {
    const a = items[index]; const b = items[index + direction];
    if (!a || !b) return;
    void (async () => {
      await save(a, { sortOrder: b.sortOrder }, "Order updated");
      await save(b, { sortOrder: a.sortOrder }, "Order updated");
      api.setData((current) => current ? [...current].sort((x, y) => x.sortOrder - y.sortOrder) : current);
    })();
  }

  return <>
    <PageHead title="Categories" body="The supply families that structure the catalogue. Order them as they should appear on the website.">
      <a className="btn" href="/en/activities" target="_blank"><IconExternal size={15} />View on website</a>
    </PageHead>
    <div className="panel">
      {api.loading ? <TableSkeleton cols={4} rows={6} /> : api.error ? <ApiState status={api.status} error={api.error} onRetry={api.reload} /> : !items.length ? <div className="state"><span className="state-ico"><IconLayers size={24} /></span><h3>No categories yet</h3><p>Run the seed script to load the six approved supply families.</p></div> :
        <div className="table-wrap"><table className="table"><thead><tr><th style={{ width: 70 }}>Order</th><th>Category</th><th>Slug</th><th>Products</th><th>Published</th><th className="actions">Move</th></tr></thead><tbody>
          {items.map((c, i) => <tr key={c.id}>
            <td className="num">{String(i + 1).padStart(2, "0")}</td>
            <td><span className="primary">{c.nameEn}</span><span className="sub" dir="rtl" style={{ textAlign: "left" }}>{c.nameAr}</span></td>
            <td className="num">/{c.slug}</td>
            <td><span className="pill pill-plain pill-draft">{c._count.products} product{c._count.products === 1 ? "" : "s"}</span></td>
            <td><Switch checked={c.isPublished} disabled={busy === c.id} label={`Publish ${c.nameEn}`} onChange={() => save(c, { isPublished: !c.isPublished }, c.isPublished ? "Hidden from the website" : "Published to the website")} /></td>
            <td className="actions"><button type="button" className="btn btn-ghost btn-sm" disabled={i === 0 || !!busy} onClick={() => move(i, -1)} aria-label={`Move ${c.nameEn} up`}>↑</button><button type="button" className="btn btn-ghost btn-sm" disabled={i === items.length - 1 || !!busy} onClick={() => move(i, 1)} aria-label={`Move ${c.nameEn} down`}>↓</button></td>
          </tr>)}
        </tbody></table></div>}
    </div>
    {toast}
  </>;
}
