'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { EASE } from '@/lib/motion';

/** Gone by the time the first section arrives; it has done its job by then. */
const FADE = [0, 140];

/**
 * The cue is a link, not an ornament: it points at the first section, so the
 * affordance it advertises is one anyone can actually take — by clicking it,
 * by tabbing to it, or by doing what it suggests and scrolling.
 */
export function ScrollCue() {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const opacity = useTransform(scrollY, FADE, [1, 0]);

  return (
    <motion.a
      href="#proof"
      style={{ opacity }}
      data-print-hide
      className="text-faint hover:text-text mt-16 inline-flex items-center gap-3 text-[0.62rem] tracking-[0.2em] uppercase transition-colors"
    >
      <span className="bg-hairline-strong relative block h-9 w-px overflow-hidden" aria-hidden>
        <motion.span
          className="bg-accent absolute inset-x-0 top-0 block h-3"
          animate={reduced ? { y: 0 } : { y: [-12, 36] }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 2.2, ease: EASE, repeat: Infinity, repeatDelay: 0.5 }
          }
        />
      </span>
      <span data-numeral>Scroll</span>
    </motion.a>
  );
}
