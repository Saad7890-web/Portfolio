'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useLens } from '@/components/lens/LensProvider';
import { useRanked } from '@/components/lens/useRanked';
import { stack } from '@/content';
import { emphasis } from '@/lib/rank';
import { flip } from '@/lib/motion';
import { Band } from './Band';

export function StackGrid() {
  const { lens, settled } = useLens();
  const reduced = useReducedMotion();
  const animate = settled && !reduced;
  const groups = useRanked(stack);

  return (
    <Band label="Stack" id="stack">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <motion.section
            key={g.id}
            layout={animate}
            animate={{ opacity: emphasis(g.weight, lens) }}
            transition={flip}
          >
            <h3 className="text-[0.72rem] tracking-[0.16em] uppercase">{g.label}</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {g.items.map((i) => (
                <li
                  key={i}
                  className="text-muted hairline rounded-full px-2.5 py-1 text-[0.72rem]"
                  data-numeral
                >
                  {i}
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>
    </Band>
  );
}
