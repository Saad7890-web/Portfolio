import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { metrics } from '@/content/metrics';
import { profile } from '@/content/profile';
import { lensSeo, siteCard } from '@/content/seo';
import { PILLAR_LABEL, type Pillar } from '@/content/types';
import { topBy } from '@/lib/rank';
import { site } from '@/lib/site';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/**
 * The dark tokens, inlined.
 *
 * Satori has no cascade and no custom properties, so globals.css cannot reach
 * here — these are the same values, copied, and the copy is the reason this
 * file names them once at the top rather than sprinkling hex through the tree.
 * The card is dark in both themes: a share card lands on someone else's
 * timeline, where we do not own the surrounding surface.
 */
const INK = '#e8eaed';
const MUTED = '#9aa1a9';
const ACCENT = '#4de8ff';
const GROUND = '#07080a';
const HAIRLINE = 'rgba(255,255,255,0.09)';

/**
 * Satori reads static font binaries — not woff2, and not the variable faces the
 * site itself serves. These are the same two families at the three weights the
 * card uses, checked in so the build stays hermetic and offline.
 */
const font = (file: string) => readFileSync(join(process.cwd(), 'assets/fonts/og', file));

const fonts = [
  { name: 'Inter Tight', data: font('inter-tight-latin-400-normal.woff'), weight: 400 as const },
  { name: 'Inter Tight', data: font('inter-tight-latin-600-normal.woff'), weight: 600 as const },
  {
    name: 'JetBrains Mono',
    data: font('jetbrains-mono-latin-500-normal.woff'),
    weight: 500 as const,
  },
];

const MONO = 'JetBrains Mono';
const DISPLAY = 'Inter Tight';

/** The site's own mark, as it appears in the tab: one packet on one edge. */
function Mark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{ display: 'flex', width: 10, height: 10, borderRadius: 10, background: ACCENT }}
      />
      <div style={{ display: 'flex', width: 64, height: 1, background: HAIRLINE }} />
      <div
        style={{
          display: 'flex',
          width: 6,
          height: 6,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.28)',
        }}
      />
    </div>
  );
}

/** One proof column: the number in mono at display size, its label under it. */
function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 238 }}>
      <div style={{ fontFamily: MONO, fontSize: 46, color: ACCENT, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div
        style={{ fontFamily: DISPLAY, fontSize: 20, color: MUTED, marginTop: 8, lineHeight: 1.3 }}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * One card, per lens.
 *
 * The numbers are not decoration and they are not written here: they come from
 * `content/metrics.ts` ranked by the same weights the proof bar uses, so a
 * share of ?lens=ai previews the three metrics that lens actually foregrounds.
 * Change a weight and the card follows.
 */
export function ogCard(lens?: Pillar) {
  const rank = lens ?? 'fullstack';
  const lead = lens ? lensSeo[lens].card : siteCard;
  const top = topBy(metrics, rank, 3);
  const host = site.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: GROUND,
        padding: '64px 72px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Mark />
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              color: MUTED,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {profile.name}
          </div>
        </div>

        {lens ? (
          <div
            style={{
              display: 'flex',
              fontFamily: MONO,
              fontSize: 19,
              color: ACCENT,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: `1px solid rgba(77,232,255,0.32)`,
              borderRadius: 999,
              padding: '8px 20px',
            }}
          >
            {PILLAR_LABEL[lens]}
          </div>
        ) : (
          <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: 21, color: MUTED }}>
            {profile.title}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: 68,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: INK,
          maxWidth: 920,
        }}
      >
        {lead}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', height: 1, background: HAIRLINE, marginBottom: 32 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 28 }}>
            {top.map((m) => (
              <Proof key={m.id} value={m.value} label={m.label} />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: MONO,
              fontSize: 19,
              color: MUTED,
              alignSelf: 'flex-end',
              flexShrink: 0,
            }}
          >
            {host}
          </div>
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}

/** Alt text for the card, for anyone whose reader announces the preview. */
export function ogAlt(lens?: Pillar) {
  const lead = lens ? lensSeo[lens].card : siteCard;
  return `${profile.name} — ${lead}`;
}
