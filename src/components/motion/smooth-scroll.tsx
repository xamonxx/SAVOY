"use client";

import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Keeps GSAP's ScrollTrigger in sync with Lenis.
 *
 * Two document-scrolling loops running independently - Lenis's own
 * `requestAnimationFrame` and ScrollTrigger's scroll listener - do not stay in
 * step: a pinned ScrollTrigger (the homepage's horizontal portfolio gallery)
 * reads a correct `start`/`end` range but its `progress` simply never leaves
 * `0` while Lenis is the one moving the page. This is GSAP's own documented
 * fix: let `gsap.ticker` drive Lenis's frame loop instead of Lenis's built-in
 * one, so every Lenis tick and every ScrollTrigger update happen on the same
 * clock. `lagSmoothing(0)` matters here specifically - GSAP's default lag
 * compensation skips ticks after the tab was backgrounded, which would leave
 * Lenis's own scroll position stuck until the browser tab regains focus.
 *
 * A no-op on every page that has no ScrollTrigger instances at all - ticking
 * Lenis costs the same either way - so this can live here, above every route,
 * rather than inside the one component that currently needs it.
 */
function LenisScrollTriggerBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const raf = (time: number) => {
      lenis.raf(time * 1000);
      // Belt and suspenders: ScrollTrigger's own scroll listener should pick
      // up the native `scrollTo` calls Lenis makes each tick, but a pinned,
      // scrubbed trigger has been observed sitting at `progress: 0` until
      // something explicitly calls `update()` - so this calls it directly,
      // every tick, rather than trusting that listener alone.
      ScrollTrigger.update();
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
    };
  }, [lenis]);

  return null;
}

/**
 * Soft smooth scrolling (pasal 4 & 21).
 *
 * Deliberately conservative: Lenis only takes over the wheel on pointer
 * devices. On touch screens the native scroll is already smooth and hijacking
 * it introduces the lag that makes sites feel broken on phones. It also stands
 * down entirely when the visitor prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const update = () => setEnabled(!reduced.matches && !coarse.matches);
    update();

    reduced.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        smoothWheel: true,
        // Native touch scrolling stays untouched.
        syncTouch: false,
        // `LenisScrollTriggerBridge` below drives the frame loop instead, off
        // `gsap.ticker` rather than Lenis's own `requestAnimationFrame`.
        autoRaf: false,
      }}
    >
      <LenisScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
