"use client";

import { useRef, useState } from "react";
import { ApiState, PageHead, relTime, send, useApi, useToast } from "@/components/admin/ui";
import { IconImage, IconUpload } from "@/components/admin/AdminIcons";

type Media = { id: string; type: "image" | "video"; url: string; altEn: string; altAr: string; captionEn: string | null; mimeType: string; size: number; approved: boolean; createdAt: string; product: { slug: string; titleEn: string } | null };
const kb = (n: number) => n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;

export default function AdminMediaPage() {
  const api = useApi<Media[]>("/api/admin/media");
  const { node: toast, show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [sending, setSending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const items = api.data ?? [];

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { show("Choose a file first", true); return; }
    const form = new FormData(event.currentTarget);
    form.set("file", file);
    form.set("approved", form.get("approved") ? "true" : "false");
    setSending(true);
    try {
      const created = await send("/api/admin/media", "POST", form);
      api.setData((current) => [{ ...created, product: null }, ...(current ?? [])]);
      setFile(null); setShowForm(false); show("Upload complete");
    } catch (error) { show(error instanceof Error ? error.message : "Upload failed", true); }
    setSending(false);
  }

  async function remove(item: Media) {
    if (!window.confirm(`Delete "${item.altEn}"? This removes the file from storage and cannot be undone.`)) return;
    try { await send("/api/admin/media", "DELETE", { id: item.id }); api.setData((current) => current?.filter((m) => m.id !== item.id) ?? null); show("Media deleted"); }
    catch (error) { show(error instanceof Error ? error.message : "Unable to delete", true); }
  }

  return <>
    <PageHead title="Media library" body="Approved photography and video for the catalogue. Every asset needs English and Arabic alt text.">
      <button type="button" className="btn btn-accent" onClick={() => setShowForm((v) => !v)}><IconUpload size={15} />{showForm ? "Cancel upload" : "Upload media"}</button>
    </PageHead>

    {showForm && <form className="panel" onSubmit={upload}>
      <div className="form-section">
        <div><h3>File</h3><p>JPG, PNG, WebP or AVIF up to 10 MB. MP4 video up to 50 MB.</p></div>
        <button type="button" className={`dropzone ${drag ? "drag" : ""}`} onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0] ?? null); }}>
          <IconUpload size={22} />
          {file ? <><strong>{file.name}</strong><span>{kb(file.size)} · click to replace</span></> : <><strong>Drop a file here or click to browse</strong><span>One file at a time</span></>}
          <input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif,video/mp4" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </button>
      </div>
      <div className="form-section">
        <div><h3>Description</h3><p>Alt text describes the image for screen readers and search engines.</p></div>
        <div className="form">
          <div className="form-row"><label className="f"><span>Alt text (English)</span><input name="altEn" required minLength={2} /></label><label className="f"><span>Alt text (Arabic)</span><input name="altAr" required minLength={2} dir="rtl" /></label></div>
          <div className="form-row"><label className="f"><span>Caption (English)</span><input name="captionEn" /></label><label className="f"><span>Caption (Arabic)</span><input name="captionAr" dir="rtl" /></label></div>
          <label className="f-check"><input type="checkbox" name="approved" /> Approved for publishing</label>
        </div>
      </div>
      <div className="form-bar"><button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" disabled={sending}>{sending ? "Uploading…" : "Upload"}</button></div>
    </form>}

    <div className={items.length || api.loading ? "" : "panel"}>
      {api.loading ? <div className="media-tiles">{Array.from({ length: 8 }, (_, i) => <div key={i} className="tile"><div className="tile-img skeleton" style={{ height: "auto", borderRadius: 0 }} /><div className="tile-body"><div className="skeleton" style={{ width: "70%" }} /></div></div>)}</div>
        : api.error ? <div className="panel"><ApiState status={api.status} error={api.error} onRetry={api.reload} /></div>
        : !items.length ? <div className="state"><span className="state-ico"><IconImage size={24} /></span><h3>No media yet</h3><p>Upload approved project photography to replace the reference images on the website.</p></div>
        : <div className="media-tiles">{items.map((m) => <figure className="tile" key={m.id} style={{ margin: 0 }}>
            <div className="tile-img">{m.type === "video" ? <video src={m.url} muted playsInline /> : <img src={m.url} alt={m.altEn} loading="lazy" />}<span className={`pill ${m.approved ? "pill-live" : "pill-draft"}`}>{m.approved ? "Approved" : "Pending"}</span></div>
            <figcaption className="tile-body"><strong title={m.altEn}>{m.altEn}</strong><small>{m.product?.titleEn ?? "Unassigned"} · {kb(m.size)} · {relTime(m.createdAt)}</small><button type="button" className="btn btn-ghost btn-sm btn-danger" style={{ justifySelf: "start", marginTop: 4, paddingInline: 0 }} onClick={() => remove(m)}>Delete</button></figcaption>
          </figure>)}</div>}
    </div>
    {toast}
  </>;
}
