import { LensProvider } from '@/components/lens/LensProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Hero } from '@/components/sections/Hero';
import { ProofBar } from '@/components/sections/ProofBar';
import { Pillars } from '@/components/sections/Pillars';
import { Work } from '@/components/sections/Work';
import { Experience } from '@/components/sections/Experience';
import { StackGrid } from '@/components/sections/StackGrid';
import { Signals } from '@/components/sections/Signals';
import { Contact } from '@/components/sections/Contact';

export default function Home() {
  return (
    <LensProvider>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ProofBar />
        <Pillars />
        <Work />
        <Experience />
        <StackGrid />
        <Signals />
        <Contact />
      </main>
      <SiteFooter />
    </LensProvider>
  );
}
