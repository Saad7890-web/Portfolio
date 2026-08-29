import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, ogCard } from '@/lib/og';

/** `output: 'export'` renders the card once at build time, not per request. */
export const dynamic = 'force-static';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = ogAlt();

export default function OpengraphImage() {
  return ogCard();
}
