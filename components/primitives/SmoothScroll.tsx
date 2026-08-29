'use client';

import { useEffect } from 'react';
import { cubicBezier } from 'motion/react';
import { EASE } from '@/lib/motion';
import { prefersReducedMotion } from '@/lib/perf';

/** The site's one curve, sampled as a function — Lenis wants `(t) => t'`. */
const easing = cubicBezier(...EASE);

/** Long enough to read as travel between sections, short enough to not annoy. */
const ANCHOR_DURATION = 0.9;

/**
 * How closely the scroll follows the wheel. Lower is smoother and laggier;
 * this is deliberately near the top of the usable range — the point is to take
 * the stepping out of a wheel scroll, not to make the page feel underwater.
 */
const LERP = 0.12;

const COARSE = '(pointer: coarse)';

/**
 * Smooth scrolling, on the devices that benefit from it.
 *
 * Touch devices are excluded on purpose: their scroll is already inertial and
 * hardware-composited, and hijacking it costs responsiveness, rubber-banding
 * and the browser's own address-bar behaviour to buy nothing. Reduced-motion
 * visitors are excluded for the obvious reason. In both cases the module is
 * never even fetched — Lenis is a dynamic import behind the check, so the
 * people who do not get the effect do not pay for it either.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia(COARSE).matches) return;

    let lenis: import('lenis').default | undefined;
    let frame = 0;
    let cancelled = false;

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        lerp: LERP,
        // Handled below instead: Lenis's own anchor support animates the
        // scroll but leaves the hash and the focus ring where they were, which
        // silently breaks the skip link and every keyboard visitor's sense of
        // place.
        anchors: false,
        // The rAF loop is driven here so it can be cancelled with the effect.
        autoRaf: false,
      });

      const tick = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    /**
     * Native hash navigation moves focus as well as the viewport. Animating the
     * scroll ourselves means doing that part ourselves too, or the skip link
     * scrolls the page and leaves the keyboard behind it.
     */
    const focusTarget = (target: HTMLElement) => {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      // Same document, and actually pointing at something on it.
      const url = new URL(link.href);
      const here = new URL(window.location.href);
      if (url.origin !== here.origin || url.pathname !== here.pathname || !url.hash) return;

      let target: Element | null = null;
      try {
        target = document.querySelector(url.hash);
      } catch {
        return; // A hash that is not a valid selector is not ours to handle.
      }
      if (!(target instanceof HTMLElement) || !lenis) return;

      event.preventDefault();
      // Relative, so the lens in the query string survives the navigation.
      history.pushState(null, '', url.hash);
      lenis.scrollTo(target, {
        duration: ANCHOR_DURATION,
        easing,
        onComplete: () => focusTarget(target as HTMLElement),
      });
    };

    document.addEventListener('click', onClick);

    return () => {
      cancelled = true;
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return null;
}
