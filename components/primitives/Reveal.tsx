'use client';

import { useCallback, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/perf';

/**
 * Fires once, when the element has come far enough into view to be worth
 * looking at. The negative bottom inset is the difference between "a pixel of
 * this has appeared" and "this has arrived".
 */
const MARGIN = '0px 0px -10% 0px';

/** Comfortably past `--dur-slow`, so it only fires when the event did not. */
const SETTLE_TIMEOUT = 900;

/**
 * One observer for every reveal on the page rather than one each. Reveals are
 * cheap individually and there are dozens of them; the observers are not.
 */
const pending = new WeakMap<Element, () => void>();
let shared: IntersectionObserver | null | undefined;

function observer(): IntersectionObserver | null {
  if (shared !== undefined) return shared;
  shared =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              pending.get(entry.target)?.();
            }
          },
          { rootMargin: MARGIN },
        );
  return shared;
}

/**
 * Rises its children into place when they scroll into view.
 *
 * The hidden state is applied imperatively, in the ref callback, and only to
 * elements that are below the fold at the moment the page hydrates. Three
 * things fall out of that:
 *
 *  - Nothing is ever hidden by the server. No-JS visitors, print and crawlers
 *    get the finished page; the reveal is decoration a script adds, not a
 *    curtain a script has to remove.
 *  - Whatever is already on screen — the whole hero — never animates, so the
 *    LCP element paints once and stays painted.
 *  - If `IntersectionObserver` is missing nothing is primed in the first place,
 *    so there is no way to strand content in the hidden state.
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  const node = useRef<HTMLDivElement>(null);
  const primed = useRef(false);

  const attach = useCallback((el: HTMLDivElement | null) => {
    node.current = el;
    if (!el || primed.current || !observer() || prefersReducedMotion()) return;
    // Already on screen: leave it settled. Priming it here would hide content
    // the visitor is looking at and animate it back a frame later.
    if (el.getBoundingClientRect().top <= window.innerHeight) return;
    primed.current = true;
    el.dataset.reveal = '';
  }, []);

  useEffect(() => {
    const el = node.current;
    const io = observer();
    if (!el || !primed.current || !io) return;

    let fallback = 0;

    // Once it has arrived the element is an ordinary div again: no attribute,
    // no transition, no `will-change` holding a compositor layer open for an
    // animation that has finished, and — the part that matters — no transform,
    // which would make it a containing block and break `sticky` inside it.
    const settle = () => delete el.dataset.reveal;

    const onEnd = (event: TransitionEvent) => {
      if (event.target === el && event.propertyName === 'transform') settle();
    };

    const reveal = () => {
      el.dataset.reveal = 'shown';
      pending.delete(el);
      io.unobserve(el);
      // `transitionend` does not arrive if the element was revealed in a hidden
      // tab, or if the reduced-motion override collapsed the transition to
      // nothing. The timer is what guarantees the cleanup always happens.
      fallback = window.setTimeout(settle, SETTLE_TIMEOUT);
    };

    pending.set(el, reveal);
    io.observe(el);
    el.addEventListener('transitionend', onEnd);

    return () => {
      pending.delete(el);
      io.unobserve(el);
      clearTimeout(fallback);
      el.removeEventListener('transitionend', onEnd);
    };
  }, []);

  return <div ref={attach}>{children}</div>;
}
