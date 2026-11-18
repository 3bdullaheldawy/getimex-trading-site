"use client";

import { useEffect } from "react";

export function trackEvent(event: string, data: Record<string, string | undefined> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, path: window.location.pathname, locale: document.documentElement.lang === "ar" ? "ar" : "en", ...data };
  void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => undefined);
}

export function AnalyticsTracker() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track]") : null;
      const name = target?.dataset.track;
      if (name) trackEvent(name, { category: target.dataset.category, productSlug: target.dataset.productSlug });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return null;
}
