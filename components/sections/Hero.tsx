'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LensSwitch } from '@/components/lens/LensSwitch';
import { useLens } from '@/components/lens/LensProvider';
import { HeroVisual } from '@/components/hero/HeroVisual';
import { cvForPillar, headline, profile, summary } from '@/content';
import { ease } from '@/lib/motion';
import { asset } from '@/lib/site';

export function Hero() {
  const { lens, settled } = useLens();
  const reduced = useReducedMotion();
  const copy = headline[lens];
  const cv = cvForPillar[lens];

  // Crossfade the headline rather than animating layout: the copy changes
  // length between lenses, and sliding text is harder to read than replacing it.
  const swap = reduced || !settled ? { duration: 0 } : ease(0.28);

  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
        <div>
          <LensSwitch />

          <div className="mt-10 min-h-[13rem] sm:min-h-[15rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={lens}
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                transition={swap}
              >
                <h1 className="max-w-[20ch] text-4xl leading-[1.02] font-medium tracking-[-0.03em] text-balance sm:text-6xl">
                  {copy.lead}
                </h1>
                <p className="text-muted mt-6 max-w-[58ch] text-lg leading-relaxed text-pretty">
                  {copy.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-faint mt-6 max-w-[58ch] text-sm leading-relaxed text-pretty">
            {summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={asset(cv.file)}
              download
              className="bg-accent text-accent-ink rounded-full px-5 py-2.5 text-[0.85rem] font-medium"
            >
              {cv.label} ↓
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="hairline hover:border-hairline-strong rounded-full px-5 py-2.5 text-[0.85rem] transition-colors"
            >
              {profile.email}
            </a>
          </div>
        </div>

        {/* The lens re-reads the mesh as well as the copy — same geometry, four
            interpretations. Ordered after the text in the DOM so the headline
            is the first thing a screen reader and the LCP heuristic both find. */}
        <HeroVisual />
      </div>
    </section>
  );
}
