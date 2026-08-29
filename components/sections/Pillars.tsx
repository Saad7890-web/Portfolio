'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useLens } from '@/components/lens/LensProvider';
import { pillarDetails, PILLAR_LABEL } from '@/content';
import { DIM } from '@/lib/rank';
import { ease } from '@/lib/motion';
import { Band } from './Band';

/**
 * Deliberately NOT re-ordered by the lens. The four pillars keep a fixed
 * position and identical size so the balance is visible at a glance — the
 * active one is marked, not promoted.
 */
export function Pillars() {
  const { lens, settled } = useLens();
  const reduced = useReducedMotion();
  const t = settled && !reduced ? ease(0.28) : { duration: 0 };

  return (
    <Band label="What I do" id="pillars">
      <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)] lg:grid-cols-2">
        {pillarDetails.map((p) => {
          const active = p.id === lens;
          return (
            <motion.article
              key={p.id}
              animate={{ opacity: active ? 1 : DIM }}
              transition={t}
              className="bg-surface relative p-6"
            >
              {active && (
                <motion.span
                  layoutId="pillar-marker"
                  transition={t}
                  className="bg-accent absolute top-0 left-0 h-full w-px"
                  aria-hidden
                />
              )}
              <h3 className="flex items-center gap-2 text-[0.75rem] tracking-[0.16em] uppercase">
                {PILLAR_LABEL[p.id]}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-pretty">{p.claim}</p>
              <ul className="text-muted mt-4 space-y-2 text-[0.82rem] leading-relaxed">
                {p.evidence.map((e) => (
                  <li key={e} className="border-hairline border-l pl-3">
                    {e}
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </Band>
  );
}
