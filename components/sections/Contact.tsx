'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Glyph } from '@/components/primitives/Glyph';
import { useLens } from '@/components/lens/LensProvider';
import { contactLead, cvForPillar, generalCv, PILLAR_LABEL, profile } from '@/content';
import { ease } from '@/lib/motion';
import { asset } from '@/lib/site';
import { Band } from './Band';

/**
 * The lens follows the visitor all the way to the bottom: whichever role they
 * picked in the hero decides which of the five CVs this section serves.
 */
export function Contact() {
  const { lens, settled } = useLens();
  const reduced = useReducedMotion();
  const cv = cvForPillar[lens];
  const swap = reduced || !settled ? { duration: 0 } : ease(0.24);
  const rise = reduced ? 0 : 4;

  return (
    <Band label="Contact" id="contact">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-16">
        <div>
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-accent inline-block text-2xl font-medium tracking-tight transition-colors sm:text-4xl"
            data-numeral
          >
            {profile.email}
          </a>

          <p className="text-muted mt-6 max-w-[58ch] leading-relaxed text-pretty">{contactLead}</p>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem]">
            <li>
              <a className="hover:text-accent transition-colors" href={profile.links.github}>
                GitHub <Glyph>↗</Glyph>
              </a>
            </li>
            <li>
              <a className="hover:text-accent transition-colors" href={profile.links.leetcode}>
                LeetCode <Glyph>↗</Glyph>
              </a>
            </li>
            <li className="text-faint" data-numeral>
              {profile.location}
            </li>
          </ul>
        </div>

        <div className="hairline bg-surface rounded-[var(--radius)] p-6">
          <h3 className="text-faint text-[0.72rem] tracking-[0.16em] uppercase">
            Curriculum vitae
          </h3>

          {/* Reserved height so swapping the description never nudges the button. */}
          <div className="mt-4 min-h-[4rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={lens}
                initial={{ opacity: 0, y: rise }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -rise }}
                transition={swap}
                className="text-muted text-[0.85rem] leading-relaxed text-pretty"
              >
                Written for the <span className="text-text">{PILLAR_LABEL[lens]}</span> reading of
                the same work — every number on this page is in it.
              </motion.p>
            </AnimatePresence>
          </div>

          <a
            href={asset(cv.file)}
            download
            className="bg-accent text-accent-ink mt-5 flex items-center justify-between gap-3 rounded-full px-5 py-2.5 text-[0.85rem] font-medium"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cv.file}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={swap}
              >
                {cv.label}
              </motion.span>
            </AnimatePresence>
            <Glyph>↓</Glyph>
          </a>

          <a
            href={asset(generalCv.file)}
            download
            className="text-faint hover:text-text mt-3 inline-block text-[0.78rem] transition-colors"
          >
            or the untilted version <Glyph>↓</Glyph>
          </a>
        </div>
      </div>
    </Band>
  );
}
