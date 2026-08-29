import type { Pillar } from './types';

export const profile = {
  name: 'Saad Islam Omy',
  /** Deliberately not one of the five CV titles — the lens supplies the tilt. */
  title: 'Software Engineer · Systems, Platforms & AI',
  location: 'Dhaka, Bangladesh',
  email: 'omysaadislam@gmail.com',
  phone: '+880 1881 840496',
  links: {
    github: 'https://github.com/Saad7890-web',
    leetcode: 'https://leetcode.com/u/saadislam08',
  },
  education: {
    degree: 'B.Sc. in Computer Science',
    school: 'North Western University',
    year: '2025',
  },
} as const;

/**
 * The headline sentence, per lens. Same engineer, four honest framings —
 * this is the copy-level half of the balance the site is arguing for.
 */
export const headline: Record<Pillar, { lead: string; sub: string }> = {
  backend: {
    lead: 'Backends that stay correct under load, retries and multi-tenancy.',
    sub: 'Multi-tenant SaaS on Django and NestJS — 600+ models, 350+ endpoints, a 114-table schema — where the data model, the API contract and the migrations are all mine.',
  },
  platform: {
    lead: 'The delivery path, not just the code that travels it.',
    sub: 'Containers, CI gates and zero-downtime deploys with observability that proves the deploy worked — plus Go tooling for orchestration and shadow testing.',
  },
  ai: {
    lead: 'LLM systems in production, and the harness that keeps them honest.',
    sub: 'Categorisation and vision-OCR pipelines running against real user data, and agentvcr — an open-source record/replay proxy that makes agent runs deterministic and catches silent divergence.',
  },
  fullstack: {
    lead: 'Ships end to end — schema, API, worker, interface.',
    sub: 'From the PostgreSQL data model through the REST contract and the background jobs to the React front end people actually use, on products with real users.',
  },
};

/** Sits under the lens switch as a one-line "who is this" for every lens. */
export const summary =
  'Software engineer who takes systems from an unclear problem statement through production and owns them afterwards. Two multi-tenant SaaS platforms shipped, open-source developer tooling on PyPI and npm, and a B.Sc. in Computer Science.';

/**
 * Opens the contact section. Deliberately an offer rather than a claim about
 * availability or relocation — nothing here that a CV line can't back up.
 */
export const contactLead =
  'Email is the fastest way to reach me. Happy to go deeper on anything above — the schema behind a number, how a deploy stays zero-downtime, or what the replay proxy does when a run diverges.';
