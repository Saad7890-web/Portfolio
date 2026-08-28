'use client';

import { useEffect, useState } from 'react';
import { Color } from 'three';

/**
 * The mesh reads its colours from the same CSS tokens as the rest of the site,
 * so a theme swap needs no parallel palette in JS and `--accent` stays the one
 * place the site is re-skinned.
 */
export interface Palette {
  /** Hot nodes. */
  accent: Color;
  /** Packets. Brightened in dark mode, where they blend additively. */
  packet: Color;
  node: Color;
  edge: Color;
  bg: Color;
  dark: boolean;
}

function readVar(style: CSSStyleDeclaration, name: string, fallback: string): Color {
  const value = style.getPropertyValue(name).trim();
  try {
    return new Color(value || fallback);
  } catch {
    return new Color(fallback);
  }
}

function read(): Palette {
  const style = getComputedStyle(document.documentElement);
  const bg = readVar(style, '--bg', '#07080a');
  const text = readVar(style, '--text', '#e8eaed');
  const accent = readVar(style, '--accent', '#4de8ff');

  // Perceptually cheap luminance check — we only need "is the ground dark".
  const dark = bg.r * 0.2126 + bg.g * 0.7152 + bg.b * 0.0722 < 0.18;

  return {
    accent: accent.clone().multiplyScalar(0.85),
    // Additive glow on a light ground washes out; light mode blends normally.
    packet: dark ? accent.clone().multiplyScalar(1.5) : accent.clone(),
    // Cold nodes fade toward the page ground rather than going translucent —
    // one opaque material, no sorting, and it is correct in both themes.
    node: bg.clone().lerp(text, 0.42),
    edge: bg.clone().lerp(text, 0.24),
    bg,
    dark,
  };
}

export function usePalette(): Palette {
  const [palette, setPalette] = useState<Palette>(read);

  useEffect(() => {
    const sync = () => setPalette(read());

    // data-theme is stamped on <html> by the toggle and by the pre-paint script.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', sync);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', sync);
    };
  }, []);

  return palette;
}
