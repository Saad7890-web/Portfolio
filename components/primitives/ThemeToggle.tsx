'use client';

import { useEffect, useState } from 'react';
import { applyTheme, readTheme, type Theme } from '@/lib/theme';

const ORDER: Theme[] = ['system', 'light', 'dark'];

const LABEL: Record<Theme, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length] ?? 'system';
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${LABEL[theme]}. Activate to change.`}
      title={LABEL[theme]}
      data-print-hide
      className="hairline text-muted hover:text-text hover:border-hairline-strong grid size-9 place-items-center rounded-full transition-colors"
    >
      {/* Suppress until mounted so SSR markup can't disagree with localStorage. */}
      <span aria-hidden className="block size-4">
        {mounted ? <ThemeGlyph theme={theme} /> : null}
      </span>
    </button>
  );
}

function ThemeGlyph({ theme }: { theme: Theme }) {
  if (theme === 'light') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="3.1" />
        <path
          strokeLinecap="round"
          d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M13 3l-1.1 1.1M4.1 11.9L3 13M13 13l-1.1-1.1M4.1 4.1L3 3"
        />
      </svg>
    );
  }
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path strokeLinejoin="round" d="M13.5 9.6A5.9 5.9 0 016.4 2.5a5.9 5.9 0 107.1 7.1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1.4" y="2.6" width="13.2" height="8.6" rx="1.4" />
      <path strokeLinecap="round" d="M5.5 13.8h5" />
    </svg>
  );
}
