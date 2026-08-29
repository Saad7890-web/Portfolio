import { CHIP_THRESHOLD, PILLARS, type Pillar, type Weights } from '@/content/types';

interface Weighted {
  weight: Weights;
}

/**
 * Order items by their relevance to the active lens. Array.sort is stable, so
 * equal weights keep the order they were authored in — the content files stay
 * the tie-breaker rather than some incidental property of the sort.
 */
export function rankBy<T extends Weighted>(items: readonly T[], pillar: Pillar): T[] {
  return [...items].sort((a, b) => b.weight[pillar] - a.weight[pillar]);
}

export function topBy<T extends Weighted>(items: readonly T[], pillar: Pillar, n: number): T[] {
  return rankBy(items, pillar).slice(0, n);
}

/** The pillars an item counts as real evidence for — drives its chips. */
export function chipsFor(weight: Weights): Pillar[] {
  return PILLARS.filter((p) => weight[p] >= CHIP_THRESHOLD);
}

/**
 * The floor for de-emphasis, and the reason it is not lower.
 *
 * Dimming a group sets opacity on the whole subtree, which composites its text
 * toward whatever is behind it — so de-emphasis is spent out of the contrast
 * budget. At the 0.55 this used to floor at, the muted chips in a dimmed stack
 * group landed at 3.1:1 against the page ground; the pillar cards, dimmed to
 * 0.72, put their evidence bullets at 3.9:1. Both are under AA, and neither is
 * visible in the tokens themselves — only in the composite.
 *
 * 0.85 is the lowest value at which every dimmed pair still clears 4.5:1 in
 * both themes. `pnpm check:contrast` asserts that, so a future hand reaching
 * for a more dramatic dim finds out here rather than in an audit.
 */
export const DIM = 0.85;

/**
 * Opacity for de-emphasis, never removal — the breadth is the point, so a
 * low-relevance group recedes rather than disappearing.
 */
export function emphasis(weight: Weights, pillar: Pillar): number {
  return DIM + (1 - DIM) * weight[pillar];
}
