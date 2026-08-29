'use client';

import { useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { deepDiveStages } from '@/content';
import type { StageId } from '@/content/types';
import { spring } from '@/lib/motion';
import { PANEL_ID, tabId } from './ids';

/**
 * Tabs, not a radiogroup: each state has a panel of its own text beside the
 * diagram, and that is exactly what the tab pattern describes. Selection
 * follows focus — the panel is two paragraphs, so there is nothing to save by
 * making people press Enter as well.
 */
export function StageSwitch({
  stage,
  onSelect,
}: {
  stage: StageId;
  onSelect: (next: StageId) => void;
}) {
  const reduced = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = useCallback(
    (from: number, delta: number) => {
      const next = (from + delta + deepDiveStages.length) % deepDiveStages.length;
      const target = deepDiveStages[next];
      if (!target) return;
      onSelect(target.id);
      refs.current[next]?.focus();
    },
    [onSelect],
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
        move(deepDiveStages.length - 1, 0);
        break;
    }
  };

  return (
    <div
      role="tablist"
      aria-label="States of a recorded agent run"
      className="hairline inline-flex flex-wrap gap-1 rounded-full p-1"
    >
      {deepDiveStages.map((s, index) => {
        const active = s.id === stage;
        return (
          <button
            key={s.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={tabId(s.id)}
            aria-selected={active}
            aria-controls={PANEL_ID}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(s.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="relative rounded-full px-3.5 py-1.5 text-[0.78rem] whitespace-nowrap transition-colors"
          >
            {active && (
              <motion.span
                layoutId="deep-dive-indicator"
                transition={reduced ? { duration: 0 } : spring}
                className="bg-accent absolute inset-0 rounded-full"
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-2 ${active ? 'text-accent-ink font-medium' : 'text-muted hover:text-text'}`}
            >
              {/* Hidden from assistive tech — the tab is already named, and a
                  tablist already reports "2 of 4". It is still text a sighted
                  reader has to read, though, so it is set apart by weight and
                  tracking rather than faded to a contrast the rest of the
                  palette is not allowed to use. */}
              <span className="font-normal tracking-[0.08em]" data-numeral aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
