import { useEffect } from 'react';
import type { ThemeChoice } from '../types';

/**
 * Applies the colour theme to the document.
 *
 * Two things this has to get right:
 *
 * - `system` stays live instead of being resolved once. A phone that switches
 *   to dark at night should follow without the app being reopened.
 * - The attribute sits on `<html>` rather than the app shell, so sheets and
 *   dialogs rendered outside the React tree get the tokens too.
 *
 * The initial paint is already dark because `index.html` carries the attribute;
 * this only takes over once the saved preference is known, which avoids the
 * flash of the wrong theme on mount.
 */
const CHROME: Record<'light' | 'dark', string> = {
  light: '#EDF1F9',
  dark: '#0E1120',
};

export function useTheme(theme: ThemeChoice): void {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      root.dataset.theme = resolved;
      // Let the mobile browser chrome match the page instead of sitting on the
      // accent as a bright band above a dark app.
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', CHROME[resolved as 'light' | 'dark']);
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
