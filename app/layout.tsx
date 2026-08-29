import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SmoothScroll } from '@/components/primitives/SmoothScroll';
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
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.title}`, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.links.github }],
  openGraph: {
    type: 'website',
    url: site.url,
    title: `${site.name} — ${site.title}`,
    description: site.description,
    siteName: site.name,
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
