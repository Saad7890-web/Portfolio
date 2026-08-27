import { profile } from '@/content/profile';

export const site = {
  name: profile.name,
  title: profile.title,
  description:
    'Software engineer building production backends, delivery platforms and AI systems — multi-tenant SaaS at ~1,000 req/min, event-driven architecture, and open-source developer tooling on PyPI and npm.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://saadislam.dev',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  links: {
    github: profile.links.github,
    leetcode: profile.links.leetcode,
    email: profile.email,
  },
} as const;

/** Prefix a /public asset so it survives a GitHub Pages basePath. */
export const asset = (path: string) => `${site.basePath}${path}`;
