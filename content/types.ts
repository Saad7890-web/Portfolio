/**
 * The four pillars the site balances. Nothing on the page is "primary" — the
 * Role Lens picks one and everything re-ranks by its weight for that pillar.
 */
export const PILLARS = ['backend', 'platform', 'ai', 'fullstack'] as const;

export type Pillar = (typeof PILLARS)[number];

export const PILLAR_LABEL: Record<Pillar, string> = {
  backend: 'Backend',
  platform: 'Platform / DevOps',
  ai: 'AI Engineering',
  fullstack: 'Full-Stack',
};

export const PILLAR_SHORT: Record<Pillar, string> = {
  backend: 'Backend',
  platform: 'Platform',
  ai: 'AI',
  fullstack: 'Full-Stack',
};

/** Relevance of an item to each pillar, 0..1. Drives both ordering and chips. */
export type Weights = Record<Pillar, number>;

/** Positional helper so weight tables stay readable: w(backend, platform, ai, fullstack). */
export const w = (backend: number, platform: number, ai: number, fullstack: number): Weights => ({
  backend,
  platform,
  ai,
  fullstack,
});

/** At or above this weight an item shows a pillar chip and counts as "evidence for". */
export const CHIP_THRESHOLD = 0.6;

export interface Metric {
  id: string;
  /** Rendered in mono at display size — keep it short. */
  value: string;
  label: string;
  /** Where the number comes from. Every metric traces to a real system. */
  note: string;
  weight: Weights;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  /** Undefined for closed-source or unshipped work. */
  href?: string;
  hrefLabel?: string;
  /** Sits above the fold on the card; the rest expands. */
  summary: string;
  bullets: string[];
  stack: string[];
  period?: string;
  status: 'production' | 'open-source' | 'archived';
  /** Tier 1 renders as a full case-study card, tier 2 as a compact row. */
  tier: 1 | 2;
  weight: Weights;
}

export interface PillarDetail {
  id: Pillar;
  /** One line that answers "what does he actually do here". */
  claim: string;
  evidence: string[];
  /** Project ids, in the order they best support this pillar. */
  projects: string[];
}

export interface Role {
  id: string;
  company: string;
  title: string;
  start: string;
  end: string | 'present';
  bullets: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
  weight: Weights;
}

export interface Signal {
  id: string;
  label: string;
  detail: string;
  href?: string;
}
