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
    subtitle: 'Blanco perla, crema y coral cálido',
    background: '#FFF8F2',
    surface: '#FFFBF8',
    surfaceElevated: '#FFFFFF',
    text: '#3A2F38',
    textSecondary: '#766B72',
    primary: '#EF826A',
    primarySoft: '#FBE0DA',
    border: 'rgba(58, 47, 56, 0.08)',
    colors: ['#FFF8F2', '#EF826A', '#3A2F38', '#FBE0DA'],
    isDark: false,
  },
  olive: {
    id: 'olive',
    name: 'Salvia & Olivo',
    subtitle: 'Frescura botánica y tierra mediterránea',
    background: '#EDF4ED',
    surface: '#F5FAF5',
    surfaceElevated: '#FFFFFF',
    text: '#243026',
    textSecondary: '#546B57',
    primary: '#4E8752',
    primarySoft: '#D6EAD8',
    border: 'rgba(36, 48, 38, 0.08)',
    colors: ['#EDF4ED', '#4E8752', '#243026', '#D6EAD8'],
    isDark: false,
  },
  velvet: {
    id: 'velvet',
    name: 'Rosa Terciopelo',
    subtitle: 'Rubor sedoso, frambuesa y fresa empolvada',
    background: '#FFF0F3',
    surface: '#FFF8FA',
    surfaceElevated: '#FFFFFF',
    text: '#38262C',
    textSecondary: '#785D66',
    primary: '#E04B62',
    primarySoft: '#FCDCE1',
    border: 'rgba(56, 38, 44, 0.08)',
    colors: ['#FFF0F3', '#E04B62', '#38262C', '#FCDCE1'],
    isDark: false,
  },
  lavender: {
    id: 'lavender',
    name: 'Lavanda Silvestre',
    subtitle: 'Lilas provenzales, violeta etéreo y noche suave',
    background: '#F4EFFF',
    surface: '#FAF7FF',
    surfaceElevated: '#FFFFFF',
    text: '#2F293A',
    textSecondary: '#6A6378',
    primary: '#8A6FC9',
    primarySoft: '#ECE4FB',
    border: 'rgba(47, 41, 58, 0.08)',
    colors: ['#F4EFFF', '#8A6FC9', '#2F293A', '#ECE4FB'],
    isDark: false,
  },
  bordeaux: {
    id: 'bordeaux',
    name: 'Burdeos Romance',
    subtitle: 'Granate elegante, vino tinto y rosa suave',
    background: '#F8ECF0',
    surface: '#FCF5F7',
    surfaceElevated: '#FFFFFF',
    text: '#332024',
    textSecondary: '#705459',
    primary: '#9E2A3B',
    primarySoft: '#F4D3D9',
    border: 'rgba(51, 32, 36, 0.08)',
    colors: ['#F8ECF0', '#9E2A3B', '#332024', '#F4D3D9'],
    isDark: false,
  },
  ocean: {
    id: 'ocean',
    name: 'Brisa Mediterránea',
    subtitle: 'Azul costa, cielo abierto y frescura marina',
    background: '#EEF6FA',
    surface: '#F6FAFC',
    surfaceElevated: '#FFFFFF',
    text: '#1C2E38',
    textSecondary: '#506E7D',
    primary: '#2B829E',
    primarySoft: '#D3ECF4',
    border: 'rgba(28, 46, 56, 0.08)',
    colors: ['#EEF6FA', '#2B829E', '#1C2E38', '#D3ECF4'],
    isDark: false,
  },
  midnight: {
    id: 'midnight',
    name: 'Medianoche & Estrellas',
    subtitle: 'Negro espacial OLED, destellos neón y elegancia',
    background: '#131118',
    surface: '#1D1A24',
    surfaceElevated: '#262230',
    text: '#FAF7FF',
    textSecondary: '#A9A2B6',
    primary: '#FF5C77',
    primarySoft: 'rgba(255, 92, 119, 0.20)',
    border: 'rgba(250, 247, 255, 0.12)',
    colors: ['#131118', '#FF5C77', '#FAF7FF', '#262230'],
    isDark: true,
  },
  honey: {
    id: 'honey',
    name: 'Ámbar & Miel',
    subtitle: 'Calidez soleada, vainilla dulce y miel dorada',
    background: '#FFFBF0',
    surface: '#FFFEFA',
    surfaceElevated: '#FFFFFF',
    text: '#362816',
    textSecondary: '#786348',
    primary: '#DF9B28',
    primarySoft: '#FDECC8',
    border: 'rgba(54, 40, 22, 0.08)',
    colors: ['#FFFBF0', '#DF9B28', '#362816', '#FDECC8'],
    isDark: false,
  },
} as const;

export type ThemePaletteKey = keyof typeof ThemePalettes;
export type ThemePalette = ThemePaletteKey;
export const THEME_PALETTES = ThemePalettes;

export const ACCENT_SWATCHES = [
  { id: 'coral', name: 'Coral Cálido', hex: '#EF826A' },
  { id: 'frambuesa', name: 'Frambuesa', hex: '#E04B62' },
  { id: 'salvia', name: 'Salvia Botánica', hex: '#4E8752' },
  { id: 'lavanda', name: 'Lavanda Provenzal', hex: '#8A6FC9' },
  { id: 'burdeos', name: 'Burdeos Romance', hex: '#9E2A3B' },
  { id: 'marino', name: 'Azul Mediterráneo', hex: '#2B829E' },
  { id: 'oro', name: 'Oro & Miel', hex: '#DF9B28' },
  { id: 'turquesa', name: 'Turquesa Menta', hex: '#2EB8A6' },
  { id: 'neon_rose', name: 'Rosa Neón', hex: '#FF3366' },
  { id: 'esmeralda', name: 'Verde Esmeralda', hex: '#10B981' },
];

export function applyThemePalette(paletteKey: ThemePalette | string, customAccentHex?: string | null) {
  const p = (ThemePalettes as any)[paletteKey] || ThemePalettes.atelier;
  const primaryColor = customAccentHex || p.primary;

  (Colors.light as any).background = p.background;
  (Colors.light as any).surface = p.surface;
  (Colors.light as any).surfaceElevated = p.surfaceElevated;
  (Colors.light as any).text = p.text;
  (Colors.light as any).textSecondary = p.textSecondary;
  (Colors.light as any).primary = primaryColor;
  (Colors.light as any).primarySoft = customAccentHex ? `${customAccentHex}28` : p.primarySoft;
  (Colors.light as any).border = p.border;

  if (typeof document !== 'undefined') {
    try {
      if (document.documentElement) document.documentElement.style.backgroundColor = p.background;
      if (document.body) document.body.style.backgroundColor = p.background;
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
          --app-surface-elevated: ${p.surfaceElevated} !important;
          --app-primary: ${primaryColor} !important;
          --app-primary-soft: ${customAccentHex ? `${customAccentHex}28` : p.primarySoft} !important;
          --app-text: ${p.text} !important;
          --app-text-secondary: ${p.textSecondary} !important;
          --app-border: ${p.border} !important;
        }
        html, body, #root, #root > div {
          background-color: ${p.background} !important;
          color: ${p.text} !important;
        }
      `;
    } catch {}
  }
}
