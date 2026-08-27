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
 * Opacity for de-emphasis, never removal — the breadth is the point, so a
 * low-relevance group recedes rather than disappearing. Floors at 0.55 so
 * dimmed text stays readable.
 */
export function emphasis(weight: Weights, pillar: Pillar): number {
  return 0.55 + 0.45 * weight[pillar];
}
