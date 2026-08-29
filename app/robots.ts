import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** `output: 'export'` writes robots.txt at build time, not per request. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
