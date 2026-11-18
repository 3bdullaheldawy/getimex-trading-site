"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ApiState, PageHead, Portal, TableSkeleton, fmtDate, relTime, send, useApi, useToast } from "@/components/admin/ui";
import { IconChat, IconClose, IconInbox, IconMail, IconPhone, IconSearch } from "@/components/admin/AdminIcons";
import { categories } from "@/lib/content";

const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name.en ?? slug;

type Status = "New" | "InReview" | "Replied" | "Closed";
type Inquiry = { id: string; name: string; company: string; phone: string; email: string | null; category: string; productSlug: string | null; source: string | null; message: string; locale: string; status: Status; salesNotes: string | null; createdAt: string; updatedAt: string; lastEditedBy?: { name: string } | null };

const statuses: Status[] = ["New", "InReview", "Replied", "Closed"];
const label: Record<Status, string> = { New: "New", InReview: "In review", Replied: "Replied", Closed: "Closed" };
const pill: Record<Status, string> = { New: "pill-new", InReview: "pill-review", Replied: "pill-replied", Closed: "pill-closed" };

function InquiriesInner() {
  const params = useSearchParams();
  const api = useApi<Inquiry[]>("/api/admin/inquiries");
  const { node: toast, show } = useToast();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));
  const items = useMemo(() => api.data ?? [], [api.data]);
  const counts = useMemo(() => Object.fromEntries(statuses.map((s) => [s, items.filter((i) => i.status === s).length])) as Record<Status, number>, [items]);
  const visible = items.filter((item) => (filter === "all" || item.status === filter) && (!query.trim() || [item.name, item.company, item.phone, item.email ?? "", item.category, categoryName(item.category), item.message].some((v) => v.toLowerCase().includes(query.trim().toLowerCase()))));
  const open = items.find((item) => item.id === openId) ?? null;

  async function update(item: Inquiry, patch: Partial<Pick<Inquiry, "status" | "salesNotes">>) {
    try {
      await send(`/api/admin/inquiries/${item.id}`, "PATCH", { ...patch, salesNotes: patch.salesNotes ?? undefined });
      api.setData((current) => current?.map((row) => row.id === item.id ? { ...row, ...patch } : row) ?? null);
      show(patch.status ? `Marked as ${label[patch.status].toLowerCase()}` : "Notes saved");
    } catch (error) { show(error instanceof Error ? error.message : "Unable to save", true); }
  }

  return <>
    <PageHead title="Quotation inbox" body="Every request sent from the website, with contact details, status and internal notes." />
    <div className="toolbar">
      <div className="tabs" role="group" aria-label="Filter by status">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All <span className="n">{items.length}</span></button>
        {statuses.map((s) => <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}>{label[s]} <span className="n">{counts[s] ?? 0}</span></button>)}
      </div>
      <label className="search"><IconSearch size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, company, phone…" aria-label="Search requests" /></label>
    </div>
    <div className="panel">
      {api.loading ? <TableSkeleton cols={5} /> : api.error ? <ApiState status={api.status} error={api.error} onRetry={api.reload} /> : !visible.length ? <div className="state"><span className="state-ico"><IconInbox size={24} /></span><h3>{items.length ? "Nothing matches this view" : "No requests yet"}</h3><p>{items.length ? "Try another status or clear the search." : "New quotation requests from the website will appear here."}</p></div> :
        <div className="table-wrap"><table className="table"><thead><tr><th>Contact</th><th>Category</th><th>Message</th><th>Status</th><th style={{ textAlign: "right" }}>Received</th></tr></thead><tbody>
          {visible.map((item) => <tr key={item.id} className="clickable" onClick={() => setOpenId(item.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenId(item.id); }}>
            <td><span className="primary">{item.name}</span><span className="sub">{item.company}</span></td>
            <td>{categoryName(item.category)}</td>
            <td style={{ maxWidth: 320 }}><span className="sub" dir="auto" style={{ marginTop: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.message}</span></td>
            <td><span className={`pill ${pill[item.status]}`}>{label[item.status]}</span></td>
            <td className="num" style={{ textAlign: "right" }} title={fmtDate(item.createdAt)}>{relTime(item.createdAt)}</td>
          </tr>)}
        </tbody></table></div>}
    </div>
    {open && <InquiryDrawer key={open.id} item={open} onClose={() => setOpenId(null)} onUpdate={update} />}
    {toast}
  </>;
}

function InquiryDrawer({ item, onClose, onUpdate }: { item: Inquiry; onClose: () => void; onUpdate: (item: Inquiry, patch: Partial<Pick<Inquiry, "status" | "salesNotes">>) => Promise<void> }) {
  const [notes, setNotes] = useState(item.salesNotes ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const phone = item.phone.replace(/[^\d+]/g, "");
  return <Portal>
    <div className="drawer-scrim" onClick={onClose} />
    <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Request from ${item.name}`}>
      <div className="drawer-head"><div><span className={`pill ${pill[item.status]}`}>{label[item.status]}</span><h2 style={{ marginTop: 10 }}>{item.name}</h2><p>{item.company} · {fmtDate(item.createdAt)}</p></div><button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><IconClose /></button></div>
      <div className="drawer-body">
        <div className="contact-actions-row">
          <a className="btn btn-sm" href={`tel:${phone}`}><IconPhone size={15} />Call</a>
          <a className="btn btn-sm" href={`https://wa.me/${phone.replace("+", "")}`} target="_blank" rel="noreferrer"><IconChat size={15} />WhatsApp</a>
          {item.email && <a className="btn btn-sm" href={`mailto:${item.email}?subject=${encodeURIComponent("Your Getimex quotation request")}`}><IconMail size={15} />Email</a>}
        </div>
        <dl className="dl">
          <dt>Phone</dt><dd dir="ltr">{item.phone}</dd>
          <dt>Email</dt><dd>{item.email || "—"}</dd>
          <dt>Category</dt><dd>{categoryName(item.category)}</dd>
          {item.productSlug && <><dt>Product</dt><dd>{item.productSlug}</dd></>}
          <dt>Source</dt><dd>{item.source || "Website"}</dd>
          <dt>Language</dt><dd>{item.locale === "ar" ? "Arabic" : "English"}</dd>
        </dl>
        <div><div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Message</div><div className="message-box" dir="auto">{item.message}</div></div>
        <div><div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Status</div>
          <div className="status-picker">{statuses.map((s) => <button key={s} type="button" aria-pressed={item.status === s} onClick={() => onUpdate(item, { status: s })}>{label[s]}</button>)}</div>
        </div>
        <label className="f"><span>Internal notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Supplier contacted, pricing sent, follow-up date…" /><small>Visible to the sales team only.{item.lastEditedBy?.name ? ` Last edited by ${item.lastEditedBy.name}.` : ""}</small></label>
      </div>
      <div className="drawer-foot"><button type="button" className="btn" onClick={onClose}>Close</button><button type="button" className="btn btn-primary" disabled={saving || notes === (item.salesNotes ?? "")} onClick={async () => { setSaving(true); await onUpdate(item, { salesNotes: notes }); setSaving(false); }}>{saving ? "Saving…" : "Save notes"}</button></div>
    </aside>
  </Portal>;
}

export default function InquiriesPage() { return <Suspense><InquiriesInner /></Suspense>; }
