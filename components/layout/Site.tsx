import { LensProvider } from '@/components/lens/LensProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Hero } from '@/components/sections/Hero';
import { ProofBar } from '@/components/sections/ProofBar';
import { Pillars } from '@/components/sections/Pillars';
import { Work } from '@/components/sections/Work';
import { DeepDive } from '@/components/sections/DeepDive';
import { Experience } from '@/components/sections/Experience';
import { StackGrid } from '@/components/sections/StackGrid';
import { Signals } from '@/components/sections/Signals';
import { Contact } from '@/components/sections/Contact';
import type { Pillar } from '@/content/types';

/**
 * The whole site, once.
 *
 * `/` and the four `/lens/<pillar>/` share pages are the same page with a
 * different lens pre-selected — the only difference between them is metadata
 * and which share card they hand a crawler. Composing it here means the lens
 * routes can never drift into being a second, staler copy of the site.
 */
export function Site({ lens }: { lens?: Pillar }) {
  return (
    <LensProvider initial={lens}>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ProofBar />
        <Pillars />
        <Work />
        <DeepDive />
        <Experience />
        <StackGrid />
        <Signals />
        <Contact />
      </main>
      <SiteFooter />
    </LensProvider>
  );
}
