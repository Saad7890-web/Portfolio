/**
 * Asserts the WCAG contrast of every text pair the design actually uses, in
 * both themes, by reading the tokens out of globals.css. Checked in because
 * "Accessibility 100" is a property of the palette, not of one audit run: the
 * next person to reach for a prettier grey finds out here rather than in
 * Lighthouse.
 *
 *   node scripts/check-contrast.mjs
 */
import { readFile } from 'node:fs/promises';

const CSS = new URL('../app/globals.css', import.meta.url);

/** WCAG 2.1 SC 1.4.3 — normal-size text. Everything here is normal-size. */
const AA = 4.5;

/* ---------- colour ---------- */

const clamp255 = (n) => Math.min(255, Math.max(0, Math.round(n)));

function parse(value) {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], a: 1 };
  }
  // rgb(255 179 71 / 0.14) — the only other form the token file uses.
  const rgb = /^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/i.exec(
    value.trim(),
  );
  if (rgb)
    return { rgb: rgb.slice(1, 4).map(Number), a: rgb[4] === undefined ? 1 : Number(rgb[4]) };
  throw new Error(`unparseable colour: ${value}`);
}

/** Composite a possibly-translucent colour over an opaque one. */
const flatten = (fg, bg) => ({
  rgb: fg.rgb.map((c, i) => clamp255(c * fg.a + bg.rgb[i] * (1 - fg.a))),
  a: 1,
});

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const luminance = ({ rgb: [r, g, b] }) =>
  0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const show = ({ rgb }) => `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;

/* ---------- tokens ---------- */

/** Pull one declaration block's custom properties out of the stylesheet. */
function tokens(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`no ${selector} block in globals.css`);

  // Walk braces so a nested @media block cannot end the search early.
  const open = css.indexOf('{', start);
  let depth = 0;
  let end = open;
  for (; end < css.length; end += 1) {
    if (css[end] === '{') depth += 1;
    else if (css[end] === '}' && --depth === 0) break;
  }

  const found = {};
  for (const [, name, value] of css.slice(open, end).matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    found[name] = value.trim();
  }
  return found;
}

/* ---------- the pairs the design puts on screen ---------- */

/** [ink, ground, …grounds it is layered over] — a translucent ink is composited. */
const PAIRS = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['faint', 'bg'],
  ['faint', 'surface'],
  // Deep-dive node boxes are filled with surface-2 and captioned in faint.
  ['faint', 'surface-2'],
  ['accent', 'bg'],
  ['accent', 'surface'],
  ['accent-hi', 'bg'],
  ['accent-hi', 'surface'],
  // Pillar chips: accent ink on an accent wash over a card.
  ['accent', 'accent-soft', 'surface'],
  // The lens pill and both CV buttons.
  ['accent-ink', 'accent'],
  ['warn', 'surface'],
  ['warn', 'surface-2'],
  ['warn', 'warn-soft', 'surface'],
];

/*
 * The lens de-emphasises a stack group or a pillar card by setting opacity on
 * the whole subtree. That composites its text *and* its background toward
 * whatever is behind it, so a pair that passes at full strength can fail while
 * dimmed — and nothing in the token file shows it. These are the dimmed
 * contexts, each with the ground the group is composited over.
 *
 *   [label, ink, the group's own ground, what is behind the group]
 */
const DIMMED = [
  // A stack group sits straight on the page; its chips are muted.
  ['stack group', 'muted', 'bg', 'bg'],
  ['stack group heading', 'text', 'bg', 'bg'],
  // A pillar card is a surface tile in a grid whose gutter is the hairline.
  ['pillar card', 'muted', 'surface', 'hairline over bg'],
  ['pillar card claim', 'text', 'surface', 'hairline over bg'],
];

const THEMES = [
  ['light', ':root {'],
  ['dark', ":root[data-theme='dark']"],
];

const css = await readFile(CSS, 'utf8');

/** Kept in step with DIM in lib/rank.ts, which is what the components use. */
const rank = await readFile(new URL('../lib/rank.ts', import.meta.url), 'utf8');
const DIM = Number(/export const DIM = ([\d.]+);/.exec(rank)?.[1]);
if (!Number.isFinite(DIM)) throw new Error('could not read DIM from lib/rank.ts');

let failed = 0;

for (const [theme, selector] of THEMES) {
  const t = tokens(css, selector);
  const read = (name) =>
    parse(
      t[name] ??
        (() => {
          throw new Error(`--${name} missing`);
        })(),
    );

  console.log(`\n${theme}`);
  for (const [inkName, groundName, underName] of PAIRS) {
    const under = underName ? read(underName) : null;
    const ground = under ? flatten(read(groundName), under) : read(groundName);
    const ink = flatten(read(inkName), ground);

    const ratio = contrast(ink, ground);
    const ok = ratio >= AA;
    if (!ok) failed += 1;

    const where = underName ? `${groundName} over ${underName}` : groundName;
    console.log(
      `  ${ok ? 'pass' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)}:1  ` +
        `${inkName} on ${where}  (${show(ink)} on ${show(ground)})`,
    );
  }

  console.log(`  — de-emphasised at ${DIM} —`);
  for (const [label, inkName, groundName, behindName] of DIMMED) {
    const behind =
      behindName === 'hairline over bg' ? flatten(read('hairline'), read('bg')) : read(behindName);

    // Group opacity composites the rendered result — text and card alike.
    const ground = flatten({ ...read(groundName), a: DIM }, behind);
    const ink = flatten({ ...flatten(read(inkName), read(groundName)), a: DIM }, behind);

    const ratio = contrast(ink, ground);
    const ok = ratio >= AA;
    if (!ok) failed += 1;

    console.log(
      `  ${ok ? 'pass' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)}:1  ` +
        `${label} (${inkName})  (${show(ink)} on ${show(ground)})`,
    );
  }
}

if (failed) {
  console.error(`\n${failed} pair(s) below ${AA}:1 — WCAG 2.1 AA, normal text.`);
  process.exit(1);
}
console.log(
  `\nAll ${(PAIRS.length + DIMMED.length) * THEMES.length} pairs at or above ${AA}:1, dimmed and undimmed.`,
);
