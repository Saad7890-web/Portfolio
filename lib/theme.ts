export type Theme = 'light' | 'dark' | 'system';

export const THEME_KEY = 'portfolio-theme';

/**
 * Runs before paint to stamp data-theme, so a chosen theme never flashes the
 * wrong palette. Kept as a string because it must be inlined, not hydrated.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
    try {
      localStorage.removeItem(THEME_KEY);
    } catch {
      /* private mode */
    }
    return;
  }
  root.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode */
  }
}

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* private mode */
  }
  return 'system';
}
