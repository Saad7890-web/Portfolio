import type { Role } from './types';

export const experience: Role[] = [
  {
    id: 'jumatechs',
    company: 'JumaTechs',
    title: 'Software Engineer',
    start: '2026',
    end: 'present',
    bullets: [
      'Take backend services and microservices from problem statement through production and own them afterwards — designing service boundaries and APIs, then supporting them live.',
      'Ship secure, well-documented REST APIs consumed by web clients and internal systems.',
      'Optimise PostgreSQL schemas, queries and migrations; add Redis caching and asynchronous background jobs to lift response times and throughput.',
      'Maintain CI/CD and containerised deployments; ship on schedule in a cross-functional Agile team.',
      'Use AI coding agents as part of the daily workflow, reviewing and verifying output rather than shipping it unchecked.',
    ],
  },
  {
    id: 'code-prophet',
    company: 'Code Prophet',
    title: 'Software Engineer',
    start: '2024',
    end: '2026',
    bullets: [
      'Designed and delivered microservices focused on performance, scalability and reliability, and supported them after release.',
      'Built and maintained REST APIs and backend services consumed by frontend apps and internal tooling.',
      'Partnered with frontend and product teams to turn unclear requirements into robust, well-tested services and kept them healthy in production.',
    ],
  },
];
