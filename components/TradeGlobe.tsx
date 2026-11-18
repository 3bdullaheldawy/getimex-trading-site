"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import land from "@/lib/globe-land.json";
import type { Locale } from "@/lib/content";

const DEG = Math.PI / 180;
const DUBAI = { lat: 25.2048, lon: 55.2708 };
const HUBS = [
  { id: "rtm", en: "Rotterdam", ar: "روتردام", lat: 51.9244, lon: 4.4777 },
  { id: "ham", en: "Hamburg", ar: "هامبورغ", lat: 53.5511, lon: 9.9937 },
  { id: "ist", en: "Istanbul", ar: "إسطنبول", lat: 41.0082, lon: 28.9784 },
  { id: "jed", en: "Jeddah", ar: "جدة", lat: 21.4858, lon: 39.1925 },
  { id: "dur", en: "Durban", ar: "ديربان", lat: -29.8587, lon: 31.0218 },
  { id: "bom", en: "Mumbai", ar: "مومباي", lat: 18.9499, lon: 72.8355 },
  { id: "sin", en: "Singapore", ar: "سنغافورة", lat: 1.2903, lon: 103.8519 },
  { id: "sha", en: "Shanghai", ar: "شنغهاي", lat: 31.2304, lon: 121.4737 },
  { id: "hou", en: "Houston", ar: "هيوستن", lat: 29.7604, lon: -95.3698 },
];

type V3 = [number, number, number];
const LABEL_DY: Record<string, number> = { ham: -7, rtm: 8, ist: -2 };
const vec = (lat: number, lon: number): V3 => [Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG)];
const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const dLat = (b.lat - a.lat) * DEG, dLon = (b.lon - a.lon) * DEG;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
};

/** Great-circle points between a and b, lifted off the surface in the middle. */
function arcPoints(a: V3, b: V3, steps = 64): V3[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot), sin = Math.sin(omega) || 1;
  const lift = 0.05 + Math.min(omega, 1.3) * 0.15;
  const out: V3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = Math.sin((1 - t) * omega) / sin, k2 = Math.sin(t * omega) / sin;
    const h = 1 + lift * Math.sin(Math.PI * t);
    out.push([(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h]);
  }
  return out;
}

export function TradeGlobe({ locale }: { locale: Locale }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  activeRef.current = active;
  const hubs = useMemo(() => HUBS.map((h) => ({ ...h, km: km(DUBAI, h) })), []);

  useEffect(() => {
    const el = canvas.current!, box = wrap.current!;
    const ctx = el.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
    const raw = land as number[];
    const pts = new Float32Array((raw.length / 2) * 3);
    for (let i = 0, j = 0; i < raw.length; i += 2, j += 3) { const v = vec(raw[i] / 10, raw[i + 1] / 10); pts[j] = v[0]; pts[j + 1] = v[1]; pts[j + 2] = v[2]; }
    const origin = vec(DUBAI.lat, DUBAI.lon);
    const arcs = HUBS.map((h, i) => ({ id: h.id, hub: vec(h.lat, h.lon), pts: arcPoints(origin, vec(h.lat, h.lon)), offset: i * 0.37, label: locale === "ar" ? h.ar : h.en }));

    const view = { lon: 38, lat: 18, vLon: 0, vLat: 0 };
    let w = 0, h = 0, dpr = 1, R = 0, cx = 0, cy = 0, frame = 0, visible = true, dragging = false, last = { x: 0, y: 0 }, idle = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = box.clientWidth; h = box.clientHeight;
      el.width = w * dpr; el.height = h * dpr; el.style.width = `${w}px`; el.style.height = `${h}px`;
      R = Math.min(w, h) * 0.43; cx = w / 2; cy = h / 2;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(box);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !frame) frame = requestAnimationFrame(draw); }, { rootMargin: "100px" });
    io.observe(box);

    const basis = () => {
      const l = view.lon * DEG, p = view.lat * DEG;
      return { e: [-Math.sin(l), Math.cos(l), 0], n: [-Math.sin(p) * Math.cos(l), -Math.sin(p) * Math.sin(l), Math.cos(p)], f: [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)] };
    };

    function draw(time: number) {
      frame = 0;
      if (!visible) return;
      const t = time / 1000;
      // Steer toward the hovered lane, otherwise drift east.
      const target = activeRef.current ? HUBS.find((x) => x.id === activeRef.current) : null;
      if (target && !dragging) {
        const midLon = (DUBAI.lon + target.lon) / 2 + (Math.abs(DUBAI.lon - target.lon) > 180 ? 180 : 0);
        const dLon = ((midLon - view.lon + 540) % 360) - 180;
        view.lon += dLon * 0.05; view.lat += ((DUBAI.lat + target.lat) / 2 - view.lat) * 0.05;
      } else if (!dragging) {
        view.lon += view.vLon; view.lat += view.vLat; view.vLon *= 0.94; view.vLat *= 0.94;
        if (!reduced && t - idle > 0.6) view.lon += 0.045;
      }
      view.lat = Math.max(-15, Math.min(55, view.lat));

      const { e, n, f } = basis();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Atmosphere + sphere body.
      const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
      glow.addColorStop(0, "rgba(238,106,27,0.10)"); glow.addColorStop(1, "rgba(238,106,27,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "#15345e"); body.addColorStop(1, "#071629");
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();

      // Land dots, bucketed by depth to keep fill changes cheap.
      const buckets: number[][] = [[], [], [], []];
      for (let j = 0; j < pts.length; j += 3) {
        const px = pts[j], py = pts[j + 1], pz = pts[j + 2];
        const d = px * f[0] + py * f[1] + pz * f[2];
        if (d <= 0.02) continue;
        const sx = cx + R * (px * e[0] + py * e[1] + pz * e[2]);
        const sy = cy - R * (px * n[0] + py * n[1] + pz * n[2]);
        buckets[Math.min(3, Math.floor(d * 4))].push(sx, sy);
      }
      buckets.forEach((list, b) => {
        ctx.fillStyle = `rgba(170,190,214,${0.18 + b * 0.2})`;
        const r = 0.7 + b * 0.22;
        ctx.beginPath();
        for (let k = 0; k < list.length; k += 2) { ctx.moveTo(list[k] + r, list[k + 1]); ctx.arc(list[k], list[k + 1], r, 0, Math.PI * 2); }
        ctx.fill();
      });

      const project = (p: V3) => {
        const x = p[0] * e[0] + p[1] * e[1] + p[2] * e[2];
        const y = p[0] * n[0] + p[1] * n[1] + p[2] * n[2];
        const d = p[0] * f[0] + p[1] * f[1] + p[2] * f[2];
        return { x: cx + R * x, y: cy - R * y, show: d > 0 || x * x + y * y > 1.0 };
      };

      // Lanes: faint full arc + a travelling bright packet.
      ctx.lineCap = "round"; ctx.textAlign = "left"; ctx.direction = "ltr";
      ctx.font = `500 10.5px ${mono}`;
      for (const arc of arcs) {
        const hot = activeRef.current === arc.id;
        const screen = arc.pts.map(project);
        ctx.strokeStyle = hot ? "rgba(255,138,61,0.85)" : "rgba(238,106,27,0.42)";
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.beginPath();
        let pen = false;
        for (const s of screen) { if (!s.show) { pen = false; continue; } if (pen) ctx.lineTo(s.x, s.y); else { ctx.moveTo(s.x, s.y); pen = true; } }
        ctx.stroke();
        const cycle = ((t * 0.32 + arc.offset) % 1.5);
        if (cycle <= 1 && !reduced) {
          const head = Math.floor(cycle * (screen.length - 1));
          const tail = Math.max(0, head - 12);
          ctx.strokeStyle = "rgba(255,190,140,0.95)"; ctx.lineWidth = hot ? 2.6 : 2;
          ctx.beginPath(); pen = false;
          for (let k = tail; k <= head; k++) { const s = screen[k]; if (!s.show) { pen = false; continue; } if (pen) ctx.lineTo(s.x, s.y); else { ctx.moveTo(s.x, s.y); pen = true; } }
          ctx.stroke();
        }
        const end = project(arc.hub);
        const d = arc.hub[0] * f[0] + arc.hub[1] * f[1] + arc.hub[2] * f[2];
        if (d > 0.05) {
          ctx.fillStyle = hot ? "#ffb27a" : "rgba(255,255,255,0.85)";
          ctx.beginPath(); ctx.arc(end.x, end.y, hot ? 3.2 : 2.2, 0, Math.PI * 2); ctx.fill();
          if (d > 0.25 || hot) { ctx.fillStyle = hot ? "#fff" : "rgba(214,226,240,0.7)"; ctx.fillText(arc.label.toUpperCase(), end.x + 7, end.y + 3.5 + (LABEL_DY[arc.id] ?? 0)); }
        }
      }

      // Dubai, pulsing.
      const dxb = project(origin);
      const od = origin[0] * f[0] + origin[1] * f[1] + origin[2] * f[2];
      if (od > 0) {
        const pulse = (t * 0.8) % 1;
        ctx.strokeStyle = `rgba(238,106,27,${0.7 * (1 - pulse)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(dxb.x, dxb.y, 4 + pulse * 22, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#ee6a1b"; ctx.beginPath(); ctx.arc(dxb.x, dxb.y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `600 11px ${mono}`;
        ctx.fillText(locale === "ar" ? "دبي" : "DUBAI", dxb.x + 10, dxb.y - 8);
      }
      if (!reduced || dragging || activeRef.current) frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    const down = (ev: PointerEvent) => { dragging = true; last = { x: ev.clientX, y: ev.clientY }; el.setPointerCapture(ev.pointerId); box.dataset.drag = "1"; if (!frame) frame = requestAnimationFrame(draw); };
    const move = (ev: PointerEvent) => {
      if (!dragging) return;
      const dx = ev.clientX - last.x, dy = ev.clientY - last.y; last = { x: ev.clientX, y: ev.clientY };
      view.vLon = -dx * 0.28; view.vLat = dy * 0.2; view.lon += view.vLon; view.lat += view.vLat;
    };
    const up = () => { dragging = false; idle = performance.now() / 1000; delete box.dataset.drag; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    return () => { cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
  }, [locale]);

  const en = locale === "en";
  return <div className="globe-layout">
    <div className="globe-stage" ref={wrap} data-cursor={en ? "Drag" : "اسحب"}>
      <canvas ref={canvas} role="img" aria-label={en ? "Globe showing major trade lanes connected to Dubai" : "كرة أرضية تعرض خطوط التجارة الرئيسية المتصلة بدبي"} />
      <span className="globe-hint mono">{en ? "Drag to rotate" : "اسحب للتدوير"}</span>
    </div>
    <ul className="hub-list" onPointerLeave={() => setActive(null)}>
      {hubs.map((hub, i) => <li key={hub.id}>
        <button type="button" className={active === hub.id ? "on" : ""} onPointerEnter={() => setActive(hub.id)} onFocus={() => setActive(hub.id)} onBlur={() => setActive(null)} onClick={() => setActive(hub.id)}>
          <span className="mono">{String(i + 1).padStart(2, "0")}</span>
          <strong>{en ? hub.en : hub.ar}</strong>
          <span className="hub-km mono">{hub.km.toLocaleString("en-US")} km</span>
        </button>
      </li>)}
    </ul>
  </div>;
}
