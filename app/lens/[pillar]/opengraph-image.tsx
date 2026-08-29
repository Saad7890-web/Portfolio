import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, ogCard } from '@/lib/og';
import { PILLARS, type Pillar } from '@/content/types';

/** `output: 'export'` renders the card once at build time, not per request. */
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
/*
 * One alt for all four cards. Per-lens alt text would need
 * `generateImageMetadata`, which adds a second dynamic segment to the route
 * that a static export cannot enumerate — and og:image:alt is read by almost
 * nothing, so the trade is the wrong way round.
 */
export const alt = ogAlt();

/** `output: 'export'` needs the four cards enumerated at build time. */
export function generateStaticParams() {
  return PILLARS.map((pillar) => ({ pillar }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ pillar: Pillar }> }) {
  const { pillar } = await params;
  return ogCard(pillar);
}
