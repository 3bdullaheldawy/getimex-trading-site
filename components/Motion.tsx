"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One observer for the whole page: reveals [data-reveal], drives [data-parallax]
 * and writes scroll progress into --p on [data-progress]. Re-scans on navigation.
 */
export function MotionProvider() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (reduced()) { root.classList.remove("motion"); return; }
    root.classList.add("motion");

    let pending = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.in = ""; io.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    pending.forEach((el) => io.observe(el));

    const parallax = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
    const progress = [...document.querySelectorAll<HTMLElement>("[data-progress]")];
    let frame = 0;
    const tick = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (pending.length) {
        // Fast flings can skip the observer; anything already above the fold is revealed.
        pending = pending.filter((el) => {
          if (el.dataset.in !== undefined) return false;
          if (el.getBoundingClientRect().top < vh * 0.94) { el.dataset.in = ""; io.unobserve(el); return false; }
          return true;
        });
      }
      for (const el of parallax) {
        const box = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) continue;
        const speed = Number(el.dataset.parallax || 0.15);
        const offset = (box.top + box.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
      for (const el of progress) {
        const box = el.getBoundingClientRect();
        const value = Math.min(1, Math.max(0, (vh * 0.78 - box.top) / (box.height + vh * 0.35)));
        el.style.setProperty("--p", value.toFixed(3));
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const magnets = [...document.querySelectorAll<HTMLElement>("[data-magnetic]")];
    const cleanups = magnets.map((el) => {
      const move = (event: PointerEvent) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${((event.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((event.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`; };
      const leave = () => { el.style.transform = ""; };
      el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
      return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
    });

    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); cleanups.forEach((fn) => fn()); };
  }, [pathname]);
  return null;
}

export function DubaiClock({ withSeconds = true }: { withSeconds?: boolean }) {
  const [time, setTime] = useState<string>("--:--");
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", second: withSeconds ? "2-digit" : undefined, hour12: false });
    const update = () => setTime(format.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [withSeconds]);
  return <time className="clock" suppressHydrationWarning>{time}</time>;
}

/** Words light up as the paragraph travels through the viewport. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = [...el.querySelectorAll<HTMLElement>("span")];
    if (reduced()) { words.forEach((w) => w.classList.add("lit")); return; }
    let frame = 0;
    const tick = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - box.top) / (box.height + vh * 0.35)));
      const lit = Math.round(p * words.length * 1.15);
      words.forEach((w, i) => w.classList.toggle("lit", i < lit));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [text]);
  return <p ref={ref} className={`scroll-words ${className}`}>{text.split(" ").map((word, i) => <span key={i}>{word} </span>)}</p>;
}
