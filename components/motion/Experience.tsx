"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

declare global { interface Window { __lenis?: Lenis } }

/** Inertial scroll synced to GSAP's ticker. Off for reduced motion and touch. */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (prefersReduced() || !finePointer()) return;
    const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const observer = new MutationObserver(() => { if (document.body.classList.contains("menu-open")) lenis.stop(); else lenis.start(); });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => { observer.disconnect(); gsap.ticker.remove(raf); lenis.destroy(); window.__lenis = undefined; };
  }, []);
  useEffect(() => { window.__lenis?.scrollTo(0, { immediate: true, force: true }); }, [pathname]);
  return null;
}

/** Dot + trailing ring. Grows on interactive elements, shows a label for [data-cursor]. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!finePointer() || prefersReduced()) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!, r = ring.current!;
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" }), dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, input, select, textarea, [role=switch], label");
      setLabel(labelled?.dataset.cursor ?? "");
      r.dataset.state = labelled ? "label" : interactive ? "hover" : "";
      d.dataset.state = labelled || interactive ? "hide" : "";
      r.dataset.tone = target?.closest("[data-cursor-tone=light], .section-ink, .hero, .page-hero, .site-footer, .cta-band, .site-menu") ? "light" : "";
    };
    const down = () => r.classList.add("down"), up = () => r.classList.remove("down");
    const leave = () => { d.style.opacity = "0"; r.style.opacity = "0"; }, enter = () => { d.style.opacity = ""; r.style.opacity = ""; };
    const scrolled = () => { if (r.dataset.state === "label") { r.dataset.state = ""; d.dataset.state = ""; setLabel(""); } };
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => { window.removeEventListener("scroll", scrolled); document.documentElement.classList.remove("has-cursor"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over); window.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up); document.removeEventListener("pointerleave", leave); document.removeEventListener("pointerenter", enter); };
  }, []);
  return <>
    <div className="cursor-dot" ref={dot} aria-hidden="true" />
    <div className="cursor-ring" ref={ring} aria-hidden="true"><span>{label}</span></div>
  </>;
}

/** First visit of a session: count up, draw the mark, then release the hero. */
export function Preloader({ locale }: { locale: string }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("is-loading")) return;
    const release = () => { html.classList.remove("is-loading"); try { sessionStorage.setItem("gtx-intro", "1"); } catch {} };
    const failsafe = window.setTimeout(release, 4500);
    const counter = { v: 0 };
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    tl.to(counter, { v: 100, duration: 1.5, ease: "power2.inOut", onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0"); } })
      .to(".preloader-bar i", { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
      .from(".preloader-mark i", { xPercent: -140, opacity: 0, stagger: 0.12, duration: 0.8, ease: "expo.out" }, 0.1)
      .to(".preloader-inner", { yPercent: -30, opacity: 0, duration: 0.6, ease: "power3.in" }, 1.65)
      .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut", onStart: release }, 1.85);
    return () => { window.clearTimeout(failsafe); tl.kill(); };
  }, []);
  return <div className="preloader" ref={root} aria-hidden="true">
    <div className="preloader-inner">
      <div className="preloader-mark"><i /><i /><i /></div>
      <div className="preloader-word">GETIMEX<span>{locale === "ar" ? "تجارة عامة · دبي" : "General Trading · Dubai"}</span></div>
      <div className="preloader-foot"><span ref={count} className="mono">000</span><div className="preloader-bar"><i /></div></div>
    </div>
  </div>;
}

/** Page-level GSAP choreography; rebuilt on every route. */
export function Effects() {
  const pathname = usePathname();
  useEffect(() => {
    if (prefersReduced()) return;
    let splits: SplitText[] = [];
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      // Headings rise word by word from a line mask (word level keeps Arabic shaping intact).
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        const split = SplitText.create(el, { type: "lines,words", mask: "lines", linesClass: "split-line" });
        splits.push(split);
        gsap.from(split.words, { yPercent: 115, rotate: el.closest(".rtl") ? -3 : 3, duration: 1.15, ease: "expo.out", stagger: 0.045, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      // Count-up facts.
      document.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.counter);
        const obj = { v: 0 };
        gsap.to(obj, { v: target, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(2, "0"); } });
      });

      // Hero exits as you scroll: copy lifts and fades, photo pushes in.
      const hero = document.querySelector(".hero");
      if (hero) {
        gsap.to(".hero-inner", { yPercent: -18, opacity: 0.15, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-media", { scale: 1.12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".manifest", { yPercent: -40, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        if (finePointer()) {
          const mx = gsap.quickTo(".hero-media", "x", { duration: 1.2, ease: "power3" }), my = gsap.quickTo(".hero-media", "y", { duration: 1.2, ease: "power3" });
          const onMove = (e: Event) => { const p = e as PointerEvent; mx((p.clientX / window.innerWidth - 0.5) * -24); my((p.clientY / window.innerHeight - 0.5) * -16); };
          hero.addEventListener("pointermove", onMove);
          cleanups.push(() => hero.removeEventListener("pointermove", onMove));
        }
      }

      // Giant marquee: constant drift, nudged by scroll velocity and direction.
      document.querySelectorAll<HTMLElement>(".marquee-xl").forEach((band) => {
        const track = band.querySelector<HTMLElement>(".marquee-xl-track");
        if (!track) return;
        const rtl = !!band.closest(".rtl");
        const loop = gsap.fromTo(track, { xPercent: rtl ? -50 : 0 }, { xPercent: rtl ? 0 : -50, duration: 40, ease: "none", repeat: -1 });
        let dir = 1;
        ScrollTrigger.create({ trigger: band, start: "top bottom", end: "bottom top", onUpdate: (self) => {
          if (self.direction !== dir) dir = self.direction;
          const boost = Math.min(6, Math.abs(self.getVelocity()) / 300);
          gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.3, overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3, overwrite: false });
        } });
      });

      // Process cards: each earlier card recedes as the next one stacks over it.
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector(".stack-card-inner"), { scale: 0.92, filter: "brightness(.6)", ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true } });
      });

      // Footer wordmark letters rise in.
      document.querySelectorAll<HTMLElement>("[data-letters]").forEach((el) => {
        gsap.from(el.querySelectorAll("b"), { yPercent: 100, duration: 1.2, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: el, start: "top 95%", once: true } });
      });

      // Section index labels draw their hairline.
      gsap.utils.toArray<HTMLElement>(".section-index").forEach((el) => {
        gsap.from(el.querySelector("i"), { scaleX: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });
    });

    const refresh = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
    const t1 = window.setTimeout(refresh, 300);
    const t2 = window.setTimeout(refresh, 1500);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.removeEventListener("load", refresh); cleanups.forEach((fn) => fn()); ctx.revert(); splits.forEach((s) => s.revert()); splits = []; };
  }, [pathname]);
  return null;
}

/** Hairline at the very top that tracks reading progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; const max = document.documentElement.scrollHeight - window.innerHeight; bar.current?.style.setProperty("transform", `scaleX(${max > 0 ? window.scrollY / max : 0})`); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return <div className="scroll-progress" ref={bar} aria-hidden="true" />;
}
