import { experience } from '@/content/experience';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { focusAreas } from '@/content/seo';
import { signals } from '@/content/signals';
import { stack } from '@/content/stack';
import { site } from '@/lib/site';

const abs = (path: string) => `${site.url}${path}`;

/**
 * One `@graph` rather than three sibling scripts, so Person, WebSite and
 * ProfilePage can reference each other by `@id` instead of being restated —
 * the same rule the rest of the site follows: state a fact once, derive the
 * rest. Everything below reads from `content/`, so a CV edit propagates here
 * without anyone remembering that this file exists.
 */
export function jsonLd() {
  const person = abs('/#person');
  const website = abs('/#website');
  const current = experience[0];
  const openSource = projects.filter((p) => p.status === 'open-source' && p.href);
  const award = signals.find((s) => s.id === 'hackercup');
  // "Dhaka, Bangladesh" — the display string stays the single source; this
  // splits it rather than restating the same place in two content files.
  const [locality, country] = profile.location.split(',').map((part) => part.trim());

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': person,
        name: profile.name,
        url: abs('/'),
        image: abs('/opengraph-image.png'),
        jobTitle: profile.title,
        description: site.description,
        email: `mailto:${profile.email}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: locality,
          addressCountry: country,
        },
        // Identity URLs only. The client products in content/projects.ts are
        // things he built, not places he is — they belong to the companies
        // that own them, and `sameAs` would be claiming otherwise.
        sameAs: [profile.links.github, profile.links.leetcode],
        worksFor: current && {
          '@type': 'Organization',
          name: current.company,
        },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: profile.education.school,
        },
        ...(award ? { award: `${award.label} — ${award.detail}` } : {}),
        // Deduped: a few skills legitimately appear in two groups on the page
        // (TypeScript is both a language and a frontend tool) but repeating
        // them here would just look like keyword stuffing.
        knowsAbout: [...new Set([...focusAreas, ...stack.flatMap((group) => group.items)])],
      },
      // The published work, so the graph says "authors open-source software"
      // rather than leaving it as a line of prose in the Signals section.
      ...openSource.map((project) => ({
        '@type': 'SoftwareSourceCode' as const,
        '@id': `${abs('/#project-')}${project.id}`,
        name: project.name,
        description: project.summary,
        url: project.href,
        // `keywords`, not `programmingLanguage`: a project's stack is mostly
        // frameworks and libraries, and only some of it is a language.
        keywords: project.stack.join(', '),
        author: { '@id': person },
      })),
      {
        '@type': 'WebSite',
        '@id': website,
        url: abs('/'),
        name: `${profile.name} — ${profile.title}`,
        description: site.description,
        inLanguage: 'en',
        publisher: { '@id': person },
      },
      {
        '@type': 'ProfilePage',
        '@id': abs('/#page'),
        url: abs('/'),
        name: `${profile.name} — ${profile.title}`,
        isPartOf: { '@id': website },
        about: { '@id': person },
        mainEntity: { '@id': person },
      },
    ],
  };
}
