import { w, type Metric } from './types';

/**
 * Every number here is load-bearing in a CV and traceable to a real system —
 * nothing is invented or rounded up. The proof bar shows the eight that rank
 * highest for the active lens.
 */
export const metrics: Metric[] = [
  {
    id: 'endpoints',
    value: '350+',
    label: 'REST endpoints',
    note: '600+ models across 40+ Django apps — Balanzify',
    weight: w(1.0, 0.4, 0.3, 0.85),
  },
  {
    id: 'p95',
    value: '<300ms',
    label: 'p95 at ~1,000 req/min',
    note: 'Load-tested production API on an async ASGI stack',
    weight: w(0.95, 0.9, 0.2, 0.7),
  },
  {
    id: 'schema',
    value: '114',
    label: 'tables · 116 migrations',
    note: 'Multi-tenant PostgreSQL schema — GoStyle',
    weight: w(1.0, 0.35, 0.15, 0.6),
  },
  {
    id: 'tests',
    value: '392',
    label: 'test files in CI',
    note: 'Integration tests against a real PostgreSQL container',
    weight: w(0.7, 1.0, 0.4, 0.6),
  },
  {
    id: 'websockets',
    value: '500+',
    label: 'concurrent WebSockets',
    note: 'Real-time chat and notifications over Channels + Redis',
    weight: w(0.8, 0.5, 0.1, 1.0),
  },
  {
    id: 'libraries',
    value: '18',
    label: 'versioned libraries',
    note: 'Hexagonal + CQRS NestJS platform, boundaries enforced at CI',
    weight: w(0.9, 0.85, 0.2, 0.65),
  },
  {
    id: 'apps',
    value: '40+',
    label: 'Django apps',
    note: 'Invoicing, payroll, HRIS, inventory and journals',
    weight: w(0.85, 0.3, 0.2, 0.7),
  },
  {
    id: 'zero-token',
    value: '$0',
    label: 'to replay an agent run',
    note: 'agentvcr — deterministic offline replay',
    weight: w(0.2, 0.6, 1.0, 0.3),
  },
  {
    id: 'packages',
    value: 'PyPI · npm',
    label: 'open-source packages',
    note: 'agentvcr, Apache-2.0',
    weight: w(0.5, 0.6, 0.95, 0.6),
  },
  {
    id: 'hackercup',
    value: 'Round 2',
    label: 'Meta Hacker Cup 2025',
    note: 'Algorithmic problem-solving under time pressure',
    weight: w(0.6, 0.5, 0.5, 0.6),
  },
];
