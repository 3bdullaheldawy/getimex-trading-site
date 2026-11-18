"use client";

import { useState } from "react";
import { ApiState, PageHead, TableSkeleton, send, useApi, useToast } from "@/components/admin/ui";

type Settings = { phone: string; whatsapp: string; address: string; mapUrl: string | null; email: string | null; legalRegistration: string | null; updatedAt?: string };
const fallback: Settings = { phone: "+971 50 420 5069", whatsapp: "971504205069", address: "Dubai, Deira · Bani Yas City Centre · Twin Towers · Office 125–08", mapUrl: "", email: "", legalRegistration: "" };

export default function AdminSettingsPage() {
  const api = useApi<Settings>("/api/admin/settings");
  const { node: toast, show } = useToast();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const values = api.data ?? fallback;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(["phone", "whatsapp", "address", "mapUrl", "email", "legalRegistration"].map((k) => [k, String(form.get(k) ?? "").trim()]));
    setSaving(true);
    try { const data = await send("/api/admin/settings", "PATCH", body); api.setData(data); setDirty(false); show("Settings saved"); }
    catch (error) { show(error instanceof Error ? error.message : "Unable to save settings", true); }
    setSaving(false);
  }

  return <>
    <PageHead title="Site settings" body="Contact details shown across the website, footer and quotation pages." />
    <div className="panel">
      {api.loading ? <TableSkeleton rows={4} cols={2} /> : api.error && api.status !== 200 ? <ApiState status={api.status} error={api.error} onRetry={api.reload} /> :
        <form onSubmit={save} onChange={() => setDirty(true)} key={values.updatedAt ?? "new"}>
          <div className="form-section"><div><h3>Contact</h3><p>Used by call buttons, WhatsApp links and the footer.</p></div>
            <div className="form">
              <div className="form-row"><label className="f"><span>Phone</span><input name="phone" defaultValue={values.phone} required dir="ltr" /></label><label className="f"><span>WhatsApp number</span><input name="whatsapp" defaultValue={values.whatsapp} required dir="ltr" /><small>International format without “+”, e.g. 971504205069</small></label></div>
              <label className="f"><span>Public email</span><input name="email" type="email" defaultValue={values.email ?? ""} /></label>
            </div>
          </div>
          <div className="form-section"><div><h3>Location</h3><p>The office address and an optional Google Maps embed URL.</p></div>
            <div className="form">
              <label className="f"><span>Address</span><textarea name="address" defaultValue={values.address} required style={{ minHeight: 80 }} /></label>
              <label className="f"><span>Map embed URL</span><input name="mapUrl" type="url" defaultValue={values.mapUrl ?? ""} placeholder="https://www.google.com/maps/embed?…" /></label>
            </div>
          </div>
          <div className="form-section"><div><h3>Legal</h3><p>Trade licence or registration shown in the footer.</p></div>
            <div className="form"><label className="f"><span>Registration</span><input name="legalRegistration" defaultValue={values.legalRegistration ?? ""} /></label></div>
          </div>
          <div className="form-bar">{dirty && <span style={{ color: "var(--muted)", fontSize: 13, marginRight: "auto" }}>Unsaved changes</span>}<button className="btn btn-primary" disabled={saving || !dirty}>{saving ? "Saving…" : "Save settings"}</button></div>
        </form>}
    </div>
    {toast}
  </>;
}
