'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLens } from '@/components/lens/LensProvider';
import { useTopRanked } from '@/components/lens/useRanked';
import { metrics } from '@/content';
import { flip } from '@/lib/motion';
import { Band } from './Band';

export function ProofBar() {
  const { settled } = useLens();
  const reduced = useReducedMotion();
  const shown = useTopRanked(metrics, 8);
  const animate = settled && !reduced;

  return (
    <Band label="Proof" id="proof">
      <motion.dl
        layout={animate}
        transition={flip}
        className="border-hairline grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border bg-[var(--hairline)] md:grid-cols-4"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((m) => (
            <motion.div
              key={m.id}
              layout={animate}
              initial={animate ? { opacity: 0, scale: 0.96 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={animate ? { opacity: 0, scale: 0.96 } : undefined}
              transition={flip}
              className="bg-surface p-5"
            >
              <dt className="text-3xl tracking-tight" data-numeral>
                {m.value}
              </dt>
              <dd className="mt-2">
                <span className="block text-[0.8rem]">{m.label}</span>
                <span className="text-faint mt-1 block text-[0.72rem] leading-snug">{m.note}</span>
              </dd>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.dl>
    </Band>
  );
}
