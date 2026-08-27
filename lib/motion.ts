import type { Transition } from 'motion/react';

/**
 * One easing curve and one duration scale for the whole site. Consistency in
 * motion reads as deliberate; variety reads as a showreel.
 * Mirrors --ease / --dur-* in globals.css.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DUR = { fast: 0.18, base: 0.32, slow: 0.62 } as const;

export const spring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 40,
  mass: 0.9,
};

export const ease = (duration: number = DUR.base): Transition => ({
  duration,
  ease: EASE,
});

/** Cards travelling to new positions when the lens re-ranks them. */
export const flip: Transition = {
  layout: { type: 'spring', stiffness: 300, damping: 34, mass: 0.9 },
  opacity: { duration: DUR.fast, ease: EASE },
};
