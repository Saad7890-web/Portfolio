import { profile } from '@/content/profile';

/**
 * Canonical origin, no trailing slash.
 *
 * Every absolute URL on the site is built by concatenating a path onto this,
 * so one stray slash from the environment would produce `//sitemap.xml` in
 * robots.txt and a doubled path in the JSON-LD. It is stripped once, here.
 * On GitHub Pages the value carries the project path too
 * (https://saad7890-web.github.io/Portfolio) and NEXT_PUBLIC_BASE_PATH matches it.
 */
const url = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://saadislam.dev').replace(/\/+$/, '');

export const site = {
  name: profile.name,
  title: profile.title,
  description:
    'Software engineer building production backends, delivery platforms and AI systems — multi-tenant SaaS at ~1,000 req/min, event-driven architecture, and open-source developer tooling on PyPI and npm.',
  url,
  /**
   * Scheme and host, without the project path.
   *
   * This is what `metadataBase` wants. Next prepends `basePath` itself when it
   * resolves a generated OG image, so handing it a base that already contains
   * `/Portfolio` produces `/Portfolio/Portfolio/opengraph-image.png` — a 404
   * that only shows up in a share preview. Anything the site states as an
   * absolute URL of its own uses `url` above, which does carry the path.
   */
  origin: new URL(url).origin,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  links: {
    github: profile.links.github,
    leetcode: profile.links.leetcode,
    email: profile.email,
  },
} as const;

/** Prefix a /public asset so it survives a GitHub Pages basePath. */
export const asset = (path: string) => `${site.basePath}${path}`;
