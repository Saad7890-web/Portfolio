'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * How much motion this device has earned.
 *
 *  full   — WebGL2 event-mesh with postprocessing
 *  lite   — animated inline SVG mesh, no WebGL, no extra bytes
 *  static — one frame, no loop (reduced-motion, and the pre-hydration render)
 *
 * The tiers are a budget decision, not a capability guess: `lite` is a real
 * design, not a degraded one, so falling back costs the visitor nothing.
 */
export type MotionTier = 'full' | 'lite' | 'static';

const REDUCED = '(prefers-reduced-motion: reduce)';
const COARSE = '(pointer: coarse)';

let webgl2Probe: boolean | null = null;

/** Probed once per session — creating a context to throw it away is not free. */
export function hasWebGL2(): boolean {
  if (webgl2Probe !== null) return webgl2Probe;
  if (typeof document === 'undefined') return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    webgl2Probe = gl !== null;
    // Release the context immediately; some drivers cap the number alive.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2Probe = false;
  }
  return webgl2Probe;
}

/** Fields that exist on real navigators but not in lib.dom. */
interface ConstrainedNavigator extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function detectTier(): MotionTier {
  if (typeof window === 'undefined') return 'static';

  // Not a preference to negotiate with: no loop at all.
  if (window.matchMedia(REDUCED).matches) return 'static';

  const nav = navigator as ConstrainedNavigator;

  if (nav.connection?.saveData) return 'lite';
  // Mobile always takes the light path — the 3D chunk is never even requested.
  if (window.matchMedia(COARSE).matches) return 'lite';
  if ((nav.hardwareConcurrency ?? 8) <= 4) return 'lite';
  if ((nav.deviceMemory ?? 8) < 4) return 'lite';
  if (!hasWebGL2()) return 'lite';

  return 'full';
}

/**
 * Starts at 'static' on the server and for the first client render, so the
 * static HTML always contains the SVG mesh and hydration can never disagree.
 */
export function useMotionTier(): MotionTier {
  const [tier, setTier] = useState<MotionTier>('static');

  useEffect(() => {
    const sync = () => setTier(detectTier());
    sync();

    const queries = [window.matchMedia(REDUCED), window.matchMedia(COARSE)];
    queries.forEach((q) => q.addEventListener('change', sync));
    return () => queries.forEach((q) => q.removeEventListener('change', sync));
  }, []);

  return tier;
}

/** True while the element is near the viewport. Drives the render-loop pause. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '160px'): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

/** False in a background tab — no reason to burn a GPU nobody is looking at. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === 'visible');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return visible;
}

/**
 * Flips true once the main thread is idle after first paint. Gating the 3D
 * import on this is what keeps LCP off the WebGL critical path.
 */
export function useIdleAfterPaint(enabled: boolean, timeout = 1200): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Present everywhere current except older Safari, which gets a short timer.
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => setIdle(true), { timeout });
      return () => cancelIdleCallback(handle);
    }

    const t = setTimeout(() => setIdle(true), 300);
    return () => clearTimeout(t);
  }, [enabled, timeout]);

  return idle;
}
