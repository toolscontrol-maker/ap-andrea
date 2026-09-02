/**
 * Andrea Design System v1 — Color Tokens & Roles
 */

export const Palette = {
  cream: '#FFF8F2',
  blush: '#FFFCFA',
  white: '#FFFFFF',
  coral: '#EF826A',
  coralSoft: '#FBE0DA',
  lavender: '#9E8ACD',
  lavenderSoft: '#ECE7F7',
  sage: '#83A98C',
  sageSoft: '#E3EEE4',
  butter: '#F4C95D',
  butterSoft: '#FFF3CD',
  plum: '#3A2F38',
  mauve: '#766B72',
  line: 'rgba(58, 47, 56, 0.08)',
  lineStrong: 'rgba(58, 47, 56, 0.14)',
} as const;

export const Colors = {
  light: {
    background: Palette.cream,
    surface: Palette.blush,
    surfaceElevated: Palette.white,
    surfaceMuted: '#F8F0EC',
    text: Palette.plum,
    textSecondary: Palette.mauve,
    textTertiary: '#A79EA4',
    textInverse: Palette.white,
    primary: Palette.coral,
    primaryPressed: '#DD705A',
    primarySoft: Palette.coralSoft,
    accentLavender: Palette.lavender,
    accentLavenderSoft: Palette.lavenderSoft,
    accentSage: Palette.sage,
    accentSageSoft: Palette.sageSoft,
    accentButter: Palette.butter,
    accentButterSoft: Palette.butterSoft,
    border: Palette.line,
    borderStrong: Palette.lineStrong,
    danger: '#D95D5D',
    dangerSoft: '#FBE1E1',
    success: '#5E9470',
    successSoft: '#E3EEE4',
    scrim: 'rgba(58, 47, 56, 0.30)',
  },
} as const;

export type ColorTheme = typeof Colors.light;

/** Backward compatibility Palette & Theme mapping */
export const ThemePalettes = {
  atelier: {
    id: 'atelier',
    name: 'Atelier Calme',
    background: Palette.cream, // #FFF8F2
    surface: Palette.blush,
    surfaceElevated: Palette.white,
    text: Palette.plum,
    textSecondary: Palette.mauve,
    primary: Palette.coral, // #EF826A
    primarySoft: Palette.coralSoft, // #FBE0DA
    border: Palette.line,
  },
  velvet: {
    id: 'velvet',
    name: 'Rosa Terciopelo',
    background: '#FFF0F3',
    surface: '#FFF8FA',
    surfaceElevated: Palette.white,
    text: '#38262C',
    textSecondary: '#785D66',
    primary: '#E05666',
    primarySoft: '#FCDCE1',
    border: 'rgba(56, 38, 44, 0.08)',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavanda Silvestre',
    background: '#F4EFFF',
    surface: '#FAF7FF',
    surfaceElevated: Palette.white,
    text: '#2F293A',
    textSecondary: '#6A6378',
    primary: '#8A6FC9',
    primarySoft: '#ECE4FB',
    border: 'rgba(47, 41, 58, 0.08)',
  },
  olive: {
    id: 'olive',
    name: 'Salvia & Olivo',
    background: '#EDF4ED',
    surface: '#F5FAF5',
    surfaceElevated: Palette.white,
    text: '#243026',
    textSecondary: '#546B57',
    primary: '#4E8752',
    primarySoft: '#D6EAD8',
    border: 'rgba(36, 48, 38, 0.08)',
  },
  bordeaux: {
    id: 'bordeaux',
    name: 'Burdeos Romance',
    background: '#F7ECEF',
    surface: '#FCF5F7',
    surfaceElevated: Palette.white,
    text: '#332024',
    textSecondary: '#705459',
    primary: '#9E2A3B',
    primarySoft: '#F4D3D9',
    border: 'rgba(51, 32, 36, 0.08)',
  },
} as const;

export type ThemePaletteKey = keyof typeof ThemePalettes;
export type ThemePalette = ThemePaletteKey;
export const THEME_PALETTES = ThemePalettes;

export function applyThemePalette(paletteKey: ThemePalette | string) {
  const p = (ThemePalettes as any)[paletteKey] || ThemePalettes.atelier;
  (Colors.light as any).background = p.background;
  (Colors.light as any).surface = p.surface;
  (Colors.light as any).surfaceElevated = p.surfaceElevated;
  (Colors.light as any).text = p.text;
  (Colors.light as any).textSecondary = p.textSecondary;
  (Colors.light as any).primary = p.primary;
  (Colors.light as any).primarySoft = p.primarySoft;
  (Colors.light as any).border = p.border;

  if (typeof document !== 'undefined') {
    try {
      document.body.style.backgroundColor = p.background;
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = p.background;

      let styleEl = document.getElementById('andrea-dynamic-theme-vars') as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'andrea-dynamic-theme-vars';
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        :root {
          --app-bg: ${p.background} !important;
          --app-surface: ${p.surface} !important;
          --app-primary: ${p.primary} !important;
          --app-primary-soft: ${p.primarySoft} !important;
          --app-text: ${p.text} !important;
          --app-text-secondary: ${p.textSecondary} !important;
          --app-border: ${p.border} !important;
        }
        body, html, #root {
          background-color: ${p.background} !important;
        }
      `;
    } catch {}
  }
}
