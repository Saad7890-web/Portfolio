import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SmoothScroll } from '@/components/primitives/SmoothScroll';
import { focusAreas } from '@/content/seo';
import { jsonLd } from '@/lib/jsonld';
import { site } from '@/lib/site';
import { themeScript } from '@/lib/theme';
import './globals.css';

/**
 * Fonts are self-hosted, not fetched from Google at build or runtime: the build
 * stays hermetic, visitors make no third-party request, and there is no CSP
 * exception to maintain. Latin subset only — the -ext subsets cost ~101KB for
 * glyphs this site never renders.
 */
const display = localFont({
  src: '../assets/fonts/inter-tight-var.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

const mono = localFont({
  src: '../assets/fonts/jetbrains-mono-var.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-mono',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
});

export const metadata: Metadata = {
  // Origin only — see lib/site.ts. Every relative URL in the metadata tree,
  // the generated OG cards included, resolves against this.
  metadataBase: new URL(site.origin),
  title: { default: `${site.name} — ${site.title}`, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  publisher: site.name,
  keywords: [...focusAreas],
  // Absolute, not '/': a relative canonical resolves against metadataBase,
  // which is the bare origin, and would drop a GitHub Pages project path.
  alternates: { canonical: `${site.url}/` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Telephone detection rewrites the mono numerals in the proof bar into iOS
  // call links; every number on this page is a metric, not a phone number.
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: 'profile',
    url: `${site.url}/`,
    title: `${site.name} — ${site.title}`,
    description: site.description,
    siteName: site.name,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8f9' },
    { media: '(prefers-color-scheme: dark)', color: '#07080a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/*
         * Structured data, derived from the same content files the page renders
         * from — see lib/jsonld.ts. It sits in <head> rather than at the end of
         * <body> so a crawler that reads only the head still gets it.
         */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
      </head>
      <body className={`${display.variable} ${mono.variable} grain antialiased`}>
        <a
          href="#main"
          className="bg-accent text-accent-ink sr-only rounded px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
