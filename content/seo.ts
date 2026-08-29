import type { Pillar } from './types';

/**
 * Search results and share cards get their own copy.
 *
 * The hero headline is written to be read at 6rem and the sub-line to be read
 * after it; a <title> lives in 60 characters and a description in 160, inside a
 * blue-link list, with no page around it for context. Truncating the hero copy
 * to fit would produce a sentence nobody wrote, so the framings are authored
 * once, here, from the same facts.
 */
export interface LensSeo {
  /** Page title, before the site template appends the name. Keep under 40. */
  title: string;
  /** Meta description and share-card description. Keep under 160. */
  description: string;
  /** The one line set large on the share card. Keep under ~60. */
  card: string;
}

export const lensSeo: Record<Pillar, LensSeo> = {
  backend: {
    title: 'Backend Engineering',
    description:
      'Multi-tenant SaaS backends on Django and NestJS — 600+ models, 350+ REST endpoints, a 114-table PostgreSQL schema, under 300ms p95 at ~1,000 req/min.',
    card: 'Backends that stay correct under load.',
  },
  platform: {
    title: 'Platform & DevOps',
    description:
      'Containers, CI gates and zero-downtime deploys on AWS — Docker Swarm and Kubernetes, ~392 integration tests a run, Prometheus, Grafana and Loki.',
    card: 'The delivery path, not just the code.',
  },
  ai: {
    title: 'AI Engineering',
    description:
      'LLM systems in production — categorisation and vision-OCR pipelines, RAG on pgvector, and agentvcr, an open-source record/replay proxy for agent runs.',
    card: 'LLM systems, and the harness that keeps them honest.',
  },
  fullstack: {
    title: 'Full-Stack Engineering',
    description:
      'End to end from the PostgreSQL schema to the React interface — REST contracts, background workers and real-time sync across 500+ concurrent clients.',
    card: 'Ships end to end — schema, API, worker, interface.',
  },
};

/** The lead line on the site-wide share card, where no lens has been picked. */
export const siteCard = 'Backends, delivery platforms and AI systems.';

/**
 * Fed to schema.org `knowsAbout` and to the keyword meta. Deliberately the
 * shape of the work rather than a keyword pile — the stack list underneath is
 * already exhaustive and is derived, not retyped.
 */
export const focusAreas = [
  'Backend engineering',
  'Distributed systems',
  'Platform engineering',
  'DevOps',
  'AI engineering',
  'LLM applications',
  'Full-stack web development',
] as const;
