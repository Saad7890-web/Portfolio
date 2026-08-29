import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Site } from '@/components/layout/Site';
import { lensSeo } from '@/content/seo';
import { PILLARS, type Pillar } from '@/content/types';
import { site } from '@/lib/site';

/**
 * Four share pages, one per lens.
 *
 * `?lens=ai` is a shareable URL, but every crawler that expands a link fetches
 * it before any JavaScript runs — so all four lenses would preview as the
 * default one, with the default card and the default headline. These routes
 * are the same site served under a path a crawler can read, which is what lets
 * the AI framing arrive in a recruiter's inbox looking like the AI framing.
 *
 * They canonicalise to `/`. The evidence is identical across all four; only
 * its ordering and framing change, and one indexed page that ranks is worth
 * more than five that split the same signal between them.
 */
export function generateStaticParams() {
  return PILLARS.map((pillar) => ({ pillar }));
}

const isPillar = (v: string): v is Pillar => (PILLARS as readonly string[]).includes(v);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar } = await params;
  if (!isPillar(pillar)) return {};
  const seo = lensSeo[pillar];

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `${site.url}/` },
    openGraph: {
      type: 'profile',
      url: `${site.url}/lens/${pillar}/`,
      title: `${site.name} — ${seo.title}`,
      description: seo.description,
      siteName: site.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${site.name} — ${seo.title}`,
      description: seo.description,
    },
  };
}

export default async function LensPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  if (!isPillar(pillar)) notFound();

  // The served HTML already differs: the H1, the sub-line, the metric order
  // and the CV link all come from the lens, so a crawler with no JavaScript
  // reads the AI framing on the AI route.
  return <Site lens={pillar} />;
}
