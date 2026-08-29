import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** `output: 'export'` writes sitemap.xml at build time, not per request. */
export const dynamic = 'force-static';

/**
 * One entry, deliberately.
 *
 * The `/lens/<pillar>/` routes exist so a shared link previews as the framing
 * it was shared as, but they canonicalise to `/` — the evidence underneath is
 * the same on all five pages. Listing URLs a crawler has been told to fold
 * into another one just asks it to reconcile two contradictory instructions.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
