'use client';

import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useLens } from '@/components/lens/LensProvider';
import { useRanked } from '@/components/lens/useRanked';
import { projects, PILLAR_SHORT, type Project } from '@/content';
import { chipsFor } from '@/lib/rank';
import { flip } from '@/lib/motion';
import { Band } from './Band';

/** The FLIP centrepiece: cards visibly travel to their new rank. */
export function Work() {
  const { settled } = useLens();
  const reduced = useReducedMotion();
  const animate = settled && !reduced;

  const ranked = useRanked(projects);
  const primary = ranked.filter((p) => p.tier === 1);
  const secondary = ranked.filter((p) => p.tier === 2);

  return (
    <Band label="Selected work" id="work">
      <LayoutGroup id="work">
        <div className="space-y-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)]">
          {primary.map((p) => (
            <ProjectCard key={p.id} project={p} animate={animate} />
          ))}
        </div>

        <div className="mt-px grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3">
          {secondary.map((p) => (
            <motion.article
              key={p.id}
              layout={animate}
              transition={flip}
              className="bg-surface p-5"
            >
              <h3 className="text-[0.95rem] font-medium">{p.name}</h3>
              <p className="text-faint mt-1 text-[0.72rem]">{p.tagline}</p>
              <p className="text-muted mt-3 text-[0.8rem] leading-relaxed">{p.summary}</p>
            </motion.article>
          ))}
        </div>
      </LayoutGroup>
    </Band>
  );
}

function ProjectCard({ project, animate }: { project: Project; animate: boolean }) {
  return (
    <motion.article layout={animate} transition={flip} className="bg-surface p-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-medium tracking-tight">{project.name}</h3>
        <span className="text-muted text-[0.85rem]">{project.tagline}</span>
        {project.href && (
          <a
            href={project.href}
            className="text-accent hover:text-accent-hi ml-auto text-[0.75rem] transition-colors"
            data-numeral
          >
            {project.hrefLabel} ↗
          </a>
        )}
      </header>

      <p className="text-muted mt-3 max-w-[70ch] text-[0.92rem] leading-relaxed text-pretty">
        {project.summary}
      </p>

      <ul className="text-muted mt-4 space-y-2 text-[0.82rem] leading-relaxed">
        {project.bullets.map((b) => (
          <li key={b} className="border-hairline border-l pl-3">
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {chipsFor(project.weight).map((c) => (
          <span
            key={c}
            className="bg-accent-soft text-accent rounded-full px-2.5 py-1 text-[0.68rem] tracking-wide"
          >
            {PILLAR_SHORT[c]}
          </span>
        ))}
        {project.stack.map((s) => (
          <span
            key={s}
            className="text-faint hairline rounded-full px-2.5 py-1 text-[0.68rem]"
            data-numeral
          >
            {s}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
