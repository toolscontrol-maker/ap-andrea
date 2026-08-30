import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';
const themeDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'theme');
const uiDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'components', 'ui');

// Ensure directories exist
fs.mkdirSync(themeDir, { recursive: true });
fs.mkdirSync(uiDir, { recursive: true });

// 1. SPACING.TS
const spacingCode = `/**
 * Andrea Design System v1 — Spacing Tokens
 * 4px discrete geometric scale.
 */

export const Space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 56,
  11: 64,
} as const;

export type SpaceKey = keyof typeof Space;

export const Spacing = {
  none: Space[0],
  xxs: 2,
  xs: Space[1],
  sm: Space[2],
  md: Space[3],
  lg: Space[4],
  xl: Space[5],
  '2xl': Space[6],
  '3xl': Space[7],
  '4xl': Space[8],
  '5xl': Space[9],
  '6xl': Space[11],
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'spacing.ts'), spacingCode, 'utf8');

// 2. RADIUS.TS
const radiusCode = `/**
 * Andrea Design System v1 — Radius Tokens
 */

export const Radius = {
  none: 0,
  xs: 8,      // micro tags, metadata badges
  sm: 12,     // inputs, compact fields
  md: 16,     // icon buttons, active tabs
  lg: 20,     // standard cards
  xl: 24,     // hero cards, photo frames, modals
  sheet: 28,  // bottom sheets
  pill: 999,  // chips, badges, avatars, full-round buttons
} as const;

export type RadiusKey = keyof typeof Radius;

export const Radii = {
  none: Radius.none,
  xs: Radius.xs,
  sm: Radius.sm,
  md: Radius.md,
  lg: Radius.lg,
  xl: Radius.xl,
  '2xl': Radius.sheet,
  '3xl': 32,
  '4xl': 36,
  full: Radius.pill,
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'radius.ts'), radiusCode, 'utf8');

// 3. LAYOUT.TS
const layoutCode = `/**
 * Andrea Design System v1 — Layout Tokens
 */

export const Layout = {
  screenPadding: 20,
  screenPaddingCompact: 16,
  maxContentWidth: 680,
  headerHeight: 56,
  bottomTabBarHeight: 72,
  touchTarget: 44,
  iconButton: 44,
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 56,
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'layout.ts'), layoutCode, 'utf8');

// 4. SHADOWS.TS
const shadowsCode = `/**
 * Andrea Design System v1 — Elevation & Shadows
 */

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  soft: {
    shadowColor: '#3A2F38',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#3A2F38',
    shadowOpacity: 0.11,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'shadows.ts'), shadowsCode, 'utf8');

// 5. MOTION.TS
const motionCode = `/**
 * Andrea Design System v1 — Motion & Physics Tokens
 */

export const Motion = {
  fast: 140,
  normal: 200,
  slow: 280,
  pressScale: 0.98,
  sheetDuration: 260,
  mapCameraDuration: 420,
} as const;

export const SpringPresets = {
  interactiveTap: {
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  sheetSlide: {
    stiffness: 300,
    damping: 30,
    mass: 1.0,
  },
  segmentSnap: {
    stiffness: 500,
    damping: 35,
    mass: 0.6,
  },
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'motion.ts'), motionCode, 'utf8');

// 6. ICONS.TS
const iconsCode = `/**
 * Andrea Design System v1 — Iconography Tokens
 */

export const IconSizes = {
  sm: 16,
  md: 20,
  nav: 22,
  lg: 24,
  xl: 32,
} as const;

export const IconStroke = {
  thin: 1.5,
  regular: 1.75,
  medium: 2,
  bold: 2.5,
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'icons.ts'), iconsCode, 'utf8');

// 7. COLORS.TS
const colorsCode = `/**
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
`;
fs.writeFileSync(path.join(themeDir, 'colors.ts'), colorsCode, 'utf8');

// 8. TYPOGRAPHY.TS
const typographyCode = `/**
 * Andrea Design System v1 — Typography Tokens
 */

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const Typography = {
  family: FontFamily,
  display: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.45,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.25,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.15,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.15,
  },
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
} as const;
`;
fs.writeFileSync(path.join(themeDir, 'typography.ts'), typographyCode, 'utf8');
fs.writeFileSync(path.join(themeDir, 'Typography.ts'), typographyCode, 'utf8');

// 9. THEMEPROVIDER.TSX
const themeProviderCode = `import React, { createContext, useContext, ReactNode } from 'react';
import { Colors, ColorTheme, Palette } from './colors';
import { Space } from './spacing';
import { Radius } from './radius';
import { Typography } from './typography';
import { Shadows } from './shadows';
import { Layout } from './layout';
import { Motion } from './motion';
import { IconSizes, IconStroke } from './icons';

export interface ThemeContextValue {
  colors: ColorTheme;
  palette: typeof Palette;
  space: typeof Space;
  radius: typeof Radius;
  typography: typeof Typography;
  shadows: typeof Shadows;
  layout: typeof Layout;
  motion: typeof Motion;
  icons: {
    sizes: typeof IconSizes;
    stroke: typeof IconStroke;
  };
}

const defaultThemeValue: ThemeContextValue = {
  colors: Colors.light,
  palette: Palette,
  space: Space,
  radius: Radius,
  typography: Typography,
  shadows: Shadows,
  layout: Layout,
  motion: Motion,
  icons: {
    sizes: IconSizes,
    stroke: IconStroke,
  },
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeValue);

export function ThemeProvider({ children, customColors }: { children: ReactNode; customColors?: Partial<ColorTheme> }) {
  const value: ThemeContextValue = {
    ...defaultThemeValue,
    colors: customColors ? { ...Colors.light, ...customColors } : Colors.light,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
`;
fs.writeFileSync(path.join(themeDir, 'ThemeProvider.tsx'), themeProviderCode, 'utf8');

// 10. INDEX.TS & TOKENS.TS
const themeIndexCode = `export * from './colors';
export * from './spacing';
export * from './radius';
export * from './typography';
export * from './shadows';
export * from './layout';
export * from './motion';
export * from './icons';
export * from './ThemeProvider';
`;
fs.writeFileSync(path.join(themeDir, 'index.ts'), themeIndexCode, 'utf8');
fs.writeFileSync(path.join(themeDir, 'tokens.ts'), themeIndexCode, 'utf8');

console.log('✅ Foundations created successfully in apps/mobile/src/theme/');
