'use client';

import { useCallback, useEffect, useRef } from 'react';
import { animate } from 'motion/react';
import { DUR, EASE } from '@/lib/motion';
import { prefersReducedMotion, useInView } from '@/lib/perf';

/** "350+" → "350" + "+" · "<300ms" → "<" + "300" + "ms" · "PyPI · npm" → no match. */
const PARTS = /^(\D*)(\d[\d,]*)(.*)$/;

/** Below this the climb reads as a flicker rather than a count. */
const MIN_TARGET = 10;

/**
 * Counts a metric up when it scrolls into view, keeping the prefix and suffix
 * of the authored string intact. Values with no number, or a small one
 * ("$0", "Round 2", "PyPI · npm"), render settled — the animation is not the
 * point, the number is.
 */
export function CountUp({ value }: { value: string }) {
  const match = PARTS.exec(value);
  const digits = match?.[2] ?? '';
  const target = digits ? Number(digits.replace(/,/g, '')) : 0;
  const grouped = digits.includes(',');
  const animatable = target >= MIN_TARGET;

  const node = useRef<HTMLSpanElement>(null);
  const primed = useRef(false);
  const started = useRef(false);
  const inView = useInView(node, '0px');

  const format = useCallback(
    (n: number) => (grouped ? n.toLocaleString('en-US') : String(n)),
    [grouped],
  );

  /**
   * Priming is imperative on purpose. The server renders the real number — so
   * no-JS, print and crawlers get the fact rather than a zero — and this ref
   * callback resets it before the browser paints, but only for metrics already
   * on screen. Anything below the fold is primed by the effect instead, while
   * it is still out of view, so a metric nobody scrolled to keeps its value.
   */
  const attach = useCallback(
    (el: HTMLSpanElement | null) => {
      node.current = el;
      if (!el || primed.current || !animatable || prefersReducedMotion()) return;
      // A background tab has no frame loop, so priming there would leave a zero
      // on screen until it is focused. Let the observer handle that case.
      if (document.visibilityState !== 'visible') return;
      if (el.getBoundingClientRect().top > window.innerHeight) return;
      primed.current = true;
      el.textContent = format(0);
    },
    [animatable, format],
  );

  useEffect(() => {
    const el = node.current;
    // `primed` means the ref callback found this one already on screen, so it
    // can start without waiting for the observer's first callback.
    if (!el || !animatable || started.current || !(inView || primed.current)) return;
    if (prefersReducedMotion()) return;
    started.current = true;
    primed.current = true;

    // Nothing paints between these two statements, so a metric primed here
    // snaps to zero and starts climbing within the same frame.
    el.textContent = format(0);

    const controls = animate(0, target, {
      duration: DUR.slow,
      ease: [...EASE],
      onUpdate: (n) => {
        el.textContent = format(Math.round(n));
      },
      onComplete: () => {
        el.textContent = digits;
      },
    });

    return () => controls.stop();
  }, [animatable, inView, target, digits, format]);

  if (!animatable) return <>{value}</>;

  return (
    <>
      {match?.[1]}
      {/* Tabular numerals plus a reserved width: digits fill in from the left
          and the suffix never moves while the number climbs. */}
      <span
        ref={attach}
        style={{ display: 'inline-block', minWidth: `${digits.length}ch`, textAlign: 'right' }}
      >
        {digits}
      </span>
      {match?.[3]}
    </>
  );
}
