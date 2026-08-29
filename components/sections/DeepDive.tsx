'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Glyph } from '@/components/primitives/Glyph';
import { Diagram } from '@/components/deepdive/Diagram';
import { StageSwitch } from '@/components/deepdive/StageSwitch';
import { PANEL_ID, tabId } from '@/components/deepdive/ids';
import { deepDive, deepDiveStages, projectById } from '@/content';
import type { StageId } from '@/content/types';
import { DUR, ease } from '@/lib/motion';
import { useInView } from '@/lib/perf';
import { Band } from './Band';

/** Long enough to read the claim and watch the packets take the new route. */
const DWELL = 7000;

/**
 * The signature section, and the only one the Role Lens does not touch: this
 * argument is the same for every reader. It plays its own story once — four
 * states, in order — the first time it is on screen, then hands over the
 * controls for good the moment anyone touches them.
 */
export function DeepDive() {
  const project = projectById(deepDive.projectId);
  const first = deepDiveStages[0]!;

  const [stage, setStage] = useState<StageId>(first.id);
  const [taken, setTaken] = useState(false);
  const [hovered, setHovered] = useState(false);

  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame, '-12% 0px');
  const reduced = useReducedMotion();
  const animated = !reduced && inView;

  const index = deepDiveStages.findIndex((s) => s.id === stage);
  const current = deepDiveStages[index] ?? first;
  const next = deepDiveStages[index + 1];

  // Advances forward only, never loops: it tells the story to the end and then
  // stops. A pointer inside the section pauses it — that is someone reading —
  // and leaving restarts the dwell rather than resuming a half-spent one.
  useEffect(() => {
    if (taken || hovered || reduced || !inView || !next) return;
    const timer = setTimeout(() => setStage(next.id), DWELL);
    return () => clearTimeout(timer);
  }, [taken, hovered, reduced, inView, next]);

  const select = useCallback((id: StageId) => {
    setTaken(true);
    setStage(id);
  }, []);

  const swap = animated ? ease(DUR.fast) : { duration: 0 };

  return (
    <Band label="Deep dive" id="deep-dive">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="text-xl font-medium tracking-tight">{deepDive.title}</h3>
        {project?.href && (
          <a
            href={project.href}
            className="text-accent hover:text-accent-hi text-[0.75rem] transition-colors"
            data-numeral
          >
            {project.name} · {project.hrefLabel} <Glyph>↗</Glyph>
          </a>
        )}
      </div>

      <p className="text-muted mt-3 max-w-[66ch] leading-relaxed text-pretty">{deepDive.lead}</p>

      <div className="mt-7">
        <StageSwitch stage={stage} onSelect={select} />
      </div>

      <div
        ref={frame}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12"
      >
        <div className="hairline bg-surface rounded-[var(--radius)] p-4 sm:p-6">
          <Diagram stage={current} animated={animated} />
        </div>

        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={tabId(stage)}
          tabIndex={0}
          className="min-h-[18rem]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: reduced ? 0 : 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -5 }}
              transition={swap}
            >
              <p className="text-[1.05rem] leading-snug font-medium text-pretty">{current.claim}</p>

              <p className="text-muted mt-3 text-[0.85rem] leading-relaxed text-pretty">
                {current.detail}
              </p>

              <p className="text-faint mt-4 text-[0.78rem] leading-relaxed text-pretty">
                {current.legend}
              </p>

              <div className="border-hairline mt-6 border-t pt-4">
                <p className="text-2xl tracking-tight" data-numeral>
                  {current.readout.value}
                </p>
                <p className="text-faint mt-1 text-[0.75rem]">{current.readout.label}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-faint mt-6 max-w-[76ch] text-[0.72rem] leading-relaxed text-pretty">
        {deepDive.flowLegend} {deepDive.footnote}
      </p>
    </Band>
  );
}
