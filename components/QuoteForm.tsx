"use client";

import { FormEvent, useState } from "react";
import { categories, getCopy, type Locale } from "@/lib/content";
import { trackEvent } from "@/components/AnalyticsTracker";
import { Arrow } from "@/components/Icons";

export function QuoteForm({ locale, initialCategory = "", productSlug = "", source = "quote_page" }: { locale: Locale; initialCategory?: string; productSlug?: string; source?: string }) {
  const t = getCopy(locale);
  const en = locale === "en";
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [startedAt] = useState(() => String(Date.now()));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setState("sending");
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, locale, productSlug, source }) });
      if (!response.ok) throw new Error("request");
      formElement.reset();
      setState("success");
      trackEvent("quote_submit", { category: String(payload.category ?? ""), productSlug, source });
    } catch { setState("error"); }
  }
  const req = <i aria-hidden="true"> *</i>;
  return <form className="quote-form" onSubmit={submit} data-reveal>
    <div className="quote-form-head"><span>{en ? "Quotation brief" : "موجز طلب السعر"}</span><b>{en ? "* Required" : "* حقل مطلوب"}</b></div>
    <div className="form-grid">
      <label className="field"><span>{t.form.name}{req}</span><input name="name" required autoComplete="name" /></label>
      <label className="field"><span>{t.form.company}{req}</span><input name="company" required autoComplete="organization" /></label>
      <label className="field"><span>{t.form.phone}{req}</span><input name="phone" required type="tel" autoComplete="tel" placeholder="+971" dir="ltr" /></label>
      <label className="field"><span>{t.form.email}</span><input name="email" type="email" autoComplete="email" placeholder="name@company.com" dir="ltr" /></label>
    </div>
    <label className="field"><span>{t.form.category}{req}</span><select name="category" defaultValue={initialCategory} required><option value="" disabled>{en ? "Select a supply family" : "اختر فئة التوريد"}</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name[locale]}</option>)}</select></label>
    <input type="hidden" name="productSlug" value={productSlug} /><input type="hidden" name="source" value={source} /><input type="hidden" name="formStartedAt" value={startedAt} /><label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="field"><span>{t.form.message}{req}</span><textarea name="message" required minLength={10} rows={5} placeholder={en ? "Item, specification, quantity, delivery location and timing…" : "الصنف، المواصفات، الكمية، موقع التسليم والتوقيت…"} /></label>
    <div className="form-footer">
      <button className="button button-orange button-large" disabled={state === "sending"}>{state === "sending" ? (en ? "Sending…" : "جارٍ الإرسال…") : t.form.submit}<Arrow /></button>
      <div aria-live="polite">{state === "success" && <p className="form-success">{t.form.success}</p>}{state === "error" && <p className="form-error" role="alert">{t.form.error}</p>}</div>
    </div>
  </form>;
}
