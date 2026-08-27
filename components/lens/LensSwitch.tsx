'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PILLAR_LABEL, PILLARS } from '@/content/types';
import { spring } from '@/lib/motion';
import { useLens } from './LensProvider';

const HINT_KEY = 'portfolio-lens-seen';

/**
 * Radiogroup, not a row of buttons: this is one choice among four peers, and
 * arrow keys are the expected way to move through it.
 */
export function LensSwitch() {
  const { lens, setLens, touched } = useLens();
  const reduced = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hint, setHint] = useState(false);

  // A single quiet pulse the first time someone lands, so the control reads as
  // interactive rather than as a row of labels. Never shown twice.
  useEffect(() => {
    if (reduced) return;
    try {
      if (localStorage.getItem(HINT_KEY)) return;
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* private mode — show it once this session and move on */
    }
    setHint(true);
    const t = setTimeout(() => setHint(false), 2600);
    return () => clearTimeout(t);
  }, [reduced]);

  const move = useCallback(
    (from: number, delta: number) => {
      const next = (from + delta + PILLARS.length) % PILLARS.length;
      const pillar = PILLARS[next];
      if (!pillar) return;
      setLens(pillar);
      refs.current[next]?.focus();
    },
    [setLens],
  );

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        move(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        move(index, -1);
        break;
      case 'Home':
        event.preventDefault();
        move(0, 0);
        break;
      case 'End':
        event.preventDefault();
        move(PILLARS.length - 1, 0);
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Role lens — re-ranks this page for a role"
      data-hint={hint && !touched ? '' : undefined}
      className="lens-switch hairline inline-flex flex-wrap gap-1 rounded-full p-1"
    >
      {PILLARS.map((pillar, index) => {
        const active = pillar === lens;
        return (
          <button
            key={pillar}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setLens(pillar)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="relative rounded-full px-3.5 py-1.5 text-[0.78rem] whitespace-nowrap transition-colors duration-200"
          >
            {active && (
              <motion.span
                layoutId="lens-indicator"
                transition={reduced ? { duration: 0 } : spring}
                className="bg-accent absolute inset-0 rounded-full"
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 ${active ? 'text-accent-ink font-medium' : 'text-muted hover:text-text'}`}
            >
              {PILLAR_LABEL[pillar]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
