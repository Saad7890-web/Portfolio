import type { PillarDetail } from './types';

/**
 * The balance argument, made with evidence rather than adjectives. Every pillar
 * gets the same number of evidence lines and the same card size by construction
 * — no pillar can quietly become the default.
 */
export const pillarDetails: PillarDetail[] = [
  {
    id: 'backend',
    claim:
      'Designs the data model and the API contract, then keeps them correct under load and retries.',
    evidence: [
      '600+ models and 350+ DRF endpoints across 40+ Django apps, with row-level tenant isolation and RBAC.',
      '114-table PostgreSQL schema over 116 migrations — money as integer fils, partial unique indexes for tenant-scoped constraints.',
      'Hexagonal architecture and CQRS across 18 versioned libraries, with dependency direction enforced at CI.',
      'Transactional outbox and encrypted per-tenant idempotency, so a retried request cannot double-charge or double-book.',
      'Schema design, indexing, query optimisation and safe migrations against live databases.',
    ],
    projects: ['balanzify', 'gostyle', 'rhombus'],
  },
  {
    id: 'platform',
    claim: 'Owns the path from commit to production, and the signals that prove the deploy worked.',
    evidence: [
      'Automated AWS pipeline — CodeBuild → CodeDeploy → EC2 — with Docker-based deployments and PostgreSQL on RDS.',
      'Zero-downtime deploys on Docker Swarm via GitHub Actions; Kubernetes and Docker in the working set.',
      '~392 test files run against a real PostgreSQL container in CI, not mocks.',
      'Architectural boundaries enforced as a build failure via eslint-plugin-boundaries — a guardrail, not a guideline.',
      'Prometheus, Grafana and Loki with structured logging and SLI/SLO; load testing as a release gate.',
    ],
    projects: ['gostyle', 'orbit', 'twinflow'],
  },
  {
    id: 'ai',
    claim:
      'Ships LLM features into production, and builds the verification that makes them testable.',
    evidence: [
      'agentvcr — record/replay proxy with request fingerprinting, positional replay and a semantic LCS differ, validated on LangGraph and the OpenAI Agents SDK.',
      'LLM transaction categorisation (OpenAI/Groq) and a GPT-4 Vision + Tesseract receipt-OCR pipeline running against real user data.',
      'Agent-run verification wired into CI as a merge gate through an exit-code-driven diff CLI.',
      'RAG and embeddings on pgvector; tool/function calling, structured output and streaming across OpenAI, Anthropic and Groq.',
      'Custom MCP servers exposing project context — DB schemas, API contracts, internal tooling — to coding agents.',
    ],
    projects: ['agentvcr', 'balanzify'],
  },
  {
    id: 'fullstack',
    claim:
      'Carries a feature the whole way — schema, API, worker, interface — and owns it after release.',
    evidence: [
      'React + Vite run-diff UI with a mid-run editor, built on the same semantic differ that powers the CLI.',
      'Next.js + Tailwind front end over NestJS microservices with sub-second Socket.IO sync and reconnect handling.',
      '500+ concurrent WebSocket connections for real-time chat and notifications over Channels + Redis pub/sub.',
      'Two multi-tenant SaaS platforms taken from PostgreSQL schema through REST contract to shipped interface.',
      'Component architecture, state management and real-time UIs in React, Next.js and TypeScript.',
    ],
    projects: ['playzone', 'agentvcr', 'balanzify'],
  },
];

export const pillarById = (id: string) => pillarDetails.find((p) => p.id === id);
