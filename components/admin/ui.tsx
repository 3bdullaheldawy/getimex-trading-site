"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconDatabase, IconLock } from "@/components/admin/AdminIcons";

export type ApiResult<T> = { data: T | null; status: number; error: string; loading: boolean; reload: () => void; setData: React.Dispatch<React.SetStateAction<T | null>> };

export function useApi<T>(url: string): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!alive) return;
        setStatus(response.status);
        if (!response.ok) { setError(payload.error ?? "Request failed"); setData(null); }
        else { setError(""); setData(payload.data ?? null); }
      })
      .catch(() => { if (alive) { setStatus(0); setError("Network error"); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [url, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { data, status, error, loading, reload, setData };
}

export async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, { method, headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" }, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload.data;
}

export function useToast() {
  const [toast, setToast] = useState<{ text: string; err?: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((text: string, err = false) => {
    setToast({ text, err });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);
  const node = toast ? <Portal><div className={`toast ${toast.err ? "err" : ""}`} role="status"><i />{toast.text}</div></Portal> : null;
  return { node, show };
}

/** Renders overlays on document.body so page transitions can never trap them. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(<div className="cms-portal">{children}</div>, document.body) : null;
}

export function PageHead({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return <div className="cms-head"><div><h1>{title}</h1>{body && <p>{body}</p>}</div>{children && <div className="cms-head-actions">{children}</div>}</div>;
}

export function ApiState({ status, error, onRetry }: { status: number; error: string; onRetry?: () => void }) {
  if (status === 503) return <div className="state"><span className="state-ico warn"><IconDatabase size={24} /></span><h3>Connect the database to manage this area</h3><p>Set <code>DATABASE_URL</code> and <code>DIRECT_URL</code> in <code>.env.local</code>, then run <code>npx prisma migrate deploy</code>. The public site keeps serving its approved snapshot meanwhile.</p></div>;
  if (status === 401 || status === 403) return <div className="state"><span className="state-ico"><IconLock size={24} /></span><h3>{status === 401 ? "Your session has ended" : "This area is outside your role"}</h3><p>{status === 401 ? "Sign in again to continue where you left off." : "Ask a super admin if you need access to this workspace."}</p>{status === 401 && <a className="btn btn-primary" href="/admin/login">Sign in</a>}</div>;
  return <div className="state"><span className="state-ico warn"><IconDatabase size={24} /></span><h3>Something went wrong</h3><p>{error || "The request could not be completed."}</p>{onRetry && <button type="button" className="btn" onClick={onRetry}>Try again</button>}</div>;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return <div className="panel-body" style={{ display: "grid", gap: 18 }}>{Array.from({ length: rows }, (_, r) => <div key={r} style={{ display: "grid", gridTemplateColumns: `2fr repeat(${cols - 1}, 1fr)`, gap: 24 }}>{Array.from({ length: cols }, (_, c) => <div key={c} className="skeleton" style={{ width: c === 0 ? "70%" : "50%" }} />)}</div>)}</div>;
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return <button type="button" role="switch" className="switch" aria-checked={checked} aria-label={label} onClick={onChange} disabled={disabled} />;
}

export const fmtDate = (value: string | Date | null | undefined) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" }).format(new Date(value)) : "—";
export const relTime = (value: string | Date) => {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(value).split(",")[0];
};
