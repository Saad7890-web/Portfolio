'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { lensSeo } from '@/content/seo';
import { profile } from '@/content/profile';
import { PILLARS, PILLAR_LABEL, type Pillar } from '@/content/types';

export const DEFAULT_LENS: Pillar = 'fullstack';

const PARAM = 'lens';

/**
 * The four `/lens/<pillar>/` share pages. Anchored at the end so it still
 * matches under a GitHub Pages basePath (`/Portfolio/lens/ai/`).
 */
const LENS_PATH = /\/lens\/([^/]+)\/?$/;

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

/**
 * Whichever of the two lens URLs this page is on. The path wins: on a share
 * page the segment *is* the lens, and a stray `?lens=` alongside it would be
 * someone else's copy-paste rather than an intent.
 */
function readLensFromUrl(): Pillar | null {
  if (typeof window === 'undefined') return null;
  const fromPath = window.location.pathname.match(LENS_PATH)?.[1] ?? null;
  if (isPillar(fromPath)) return fromPath;
  const value = new URLSearchParams(window.location.search).get(PARAM);
  return isPillar(value) ? value : null;
}

export function LensProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  /** Set by the `/lens/<pillar>/` routes, which know their lens at build time. */
  initial?: Pillar;
}) {
  // On `/` the static HTML renders DEFAULT_LENS so it is complete and
  // indexable, and `?lens=` is applied on mount without animating. On a share
  // page the lens is part of the route, so it is already in the served HTML —
  // the crawler's copy matches what the visitor sees.
  const [lens, setLensState] = useState<Pillar>(initial ?? DEFAULT_LENS);
  const [settled, setSettled] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const fromUrl = readLensFromUrl();
    if (fromUrl) setLensState(fromUrl);
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
    if (LENS_PATH.test(url.pathname)) {
      // On a share page the path is the lens. Rewriting the segment keeps a
      // copied URL honest — it reloads, and previews, as what is on screen.
      url.pathname = url.pathname.replace(LENS_PATH, `/lens/${next}/`);
    } else if (next === DEFAULT_LENS) {
      url.searchParams.delete(PARAM);
    } else {
      url.searchParams.set(PARAM, next);
    }
    window.history.replaceState(null, '', url);
  }, []);

  // The share pages rewrite their path when the lens changes, so the title has
  // to follow it — otherwise /lens/backend/ gets bookmarked, and shows up in
  // history, as "AI Engineering". Only on those routes: `/` is titled for the
  // site, not for whichever lens happens to be active.
  useEffect(() => {
    if (!LENS_PATH.test(window.location.pathname)) return;
    document.title = `${lensSeo[lens].title} — ${profile.name}`;
  }, [lens]);

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

  return (
    <LensContext.Provider value={value}>
      {children}
      {/*
       * The radiogroup announces its own selection, but the selection is not
       * the point — five sections below the fold re-rank, and the CV behind the
       * download button changes. Someone who cannot see that happen is told.
       * Silent until the visitor has actually changed the lens, so arriving on
       * ?lens=ai does not announce a change that never happened.
       */}
      <div role="status" aria-live="polite" className="sr-only">
        {touched ? `Re-ranked for ${PILLAR_LABEL[lens]}.` : ''}
      </div>
    </LensContext.Provider>
  );
}

export function useLens(): LensContextValue {
  const ctx = useContext(LensContext);
  if (!ctx) throw new Error('useLens must be used inside <LensProvider>');
  return ctx;
}
