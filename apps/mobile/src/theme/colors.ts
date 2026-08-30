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
    background: Palette.cream,
    surface: Palette.blush,
    surfaceElevated: Palette.white,
    text: Palette.plum,
    textSecondary: Palette.mauve,
    primary: Palette.coral,
    primarySoft: Palette.coralSoft,
    border: Palette.line,
  },
  velvet: {
    id: 'velvet',
    name: 'Rosa Terciopelo',
    background: '#FFF5F6',
    surface: '#FFFBFB',
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
    background: '#F9F7FC',
    surface: '#FCFBFE',
    surfaceElevated: Palette.white,
    text: '#2F293A',
    textSecondary: '#6A6378',
    primary: Palette.lavender,
    primarySoft: Palette.lavenderSoft,
    border: 'rgba(47, 41, 58, 0.08)',
  },
  olive: {
    id: 'olive',
    name: 'Salvia & Olivo',
    background: '#F6F9F6',
    surface: '#FAFCFA',
    surfaceElevated: Palette.white,
    text: '#28342B',
    textSecondary: '#5E6E62',
    primary: Palette.sage,
    primarySoft: Palette.sageSoft,
    border: 'rgba(40, 52, 43, 0.08)',
  },
  bordeaux: {
    id: 'bordeaux',
    name: 'Burdeos Romance',
    background: '#FAF6F6',
    surface: '#FCF8F8',
    surfaceElevated: Palette.white,
    text: '#332024',
    textSecondary: '#705459',
    primary: '#8E283B',
    primarySoft: '#F5D7DC',
    border: 'rgba(51, 32, 36, 0.08)',
  },
} as const;

export type ThemePaletteKey = keyof typeof ThemePalettes;
