'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PILLARS, type Pillar } from '@/content/types';

export const DEFAULT_LENS: Pillar = 'fullstack';

const PARAM = 'lens';

interface LensContextValue {
  lens: Pillar;
  setLens: (next: Pillar) => void;
  /**
   * False during the first client render. Layout animations read this to skip
   * animating into the URL's lens — landing on ?lens=ai should look settled,
   * not like the page rearranged itself on arrival.
   */
  settled: boolean;
  /** True once the visitor has changed the lens themselves. */
  touched: boolean;
}

const LensContext = createContext<LensContextValue | null>(null);

const isPillar = (v: string | null): v is Pillar =>
  v !== null && (PILLARS as readonly string[]).includes(v);

function readLensFromUrl(): Pillar | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get(PARAM);
  return isPillar(value) ? value : null;
}

export function LensProvider({ children }: { children: React.ReactNode }) {
  // SSR renders DEFAULT_LENS so the static HTML is complete and indexable;
  // the URL's lens is applied on mount, without animating.
  const [lens, setLensState] = useState<Pillar>(DEFAULT_LENS);
  const [settled, setSettled] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const fromUrl = readLensFromUrl();
    if (fromUrl && fromUrl !== DEFAULT_LENS) setLensState(fromUrl);
  }, []);

  // Deliberately a frame later than the URL read above. Batched together, the
  // render that applies ?lens=ai would already have settled === true and would
  // animate the re-rank on arrival — a deep link should look settled, not like
  // the page rearranged itself as you landed.
  useEffect(() => {
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const setLens = useCallback((next: Pillar) => {
    setLensState(next);
    setTouched(true);

    // replaceState, not pushState: switching lens is a view change, not a
    // navigation, and it should not fill the back button with toggles.
    const url = new URL(window.location.href);
    if (next === DEFAULT_LENS) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, next);
    window.history.replaceState(null, '', url);
  }, []);

  // Keep in step with the URL if the visitor edits it or uses back/forward.
  useEffect(() => {
    const onPop = () => setLensState(readLensFromUrl() ?? DEFAULT_LENS);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const value = useMemo(
    () => ({ lens, setLens, settled, touched }),
    [lens, setLens, settled, touched],
  );

  return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}

export function useLens(): LensContextValue {
  const ctx = useContext(LensContext);
  if (!ctx) throw new Error('useLens must be used inside <LensProvider>');
  return ctx;
}
