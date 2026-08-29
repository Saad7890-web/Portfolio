'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/** Soft enough to lag the scroll a little, which is what makes it read as a gauge. */
const TRACKING = { stiffness: 220, damping: 34, restDelta: 0.001 };

/**
 * A hairline gauge along the bottom of the header. It is the one piece of
 * chrome that is honestly an instrument: it reports position and nothing else.
 * Decorative, so it is hidden from assistive tech and from print.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const smoothed = useSpring(scrollYProgress, TRACKING);

  return (
    <motion.div
      aria-hidden
      data-print-hide
      style={{ scaleX: reduced ? scrollYProgress : smoothed }}
      className="bg-accent absolute inset-x-0 bottom-0 h-px origin-left"
    />
  );
}
