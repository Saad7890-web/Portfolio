'use client';

import { useMemo } from 'react';
import { chipsFor, emphasis, rankBy, topBy } from '@/lib/rank';
import type { Pillar, Weights } from '@/content/types';
import { useLens } from './LensProvider';

interface Weighted {
  weight: Weights;
}

/** Items ordered by relevance to the active lens. */
export function useRanked<T extends Weighted>(items: readonly T[]): T[] {
  const { lens } = useLens();
  return useMemo(() => rankBy(items, lens), [items, lens]);
}

export function useTopRanked<T extends Weighted>(items: readonly T[], n: number): T[] {
  const { lens } = useLens();
  return useMemo(() => topBy(items, lens, n), [items, lens, n]);
}

/** Opacity for de-emphasis under the active lens. Never hides. */
export function useEmphasis(weight: Weights): number {
  const { lens } = useLens();
  return emphasis(weight, lens);
}

export function usePillarChips(weight: Weights): Pillar[] {
  return useMemo(() => chipsFor(weight), [weight]);
}
