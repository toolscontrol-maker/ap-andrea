/**
 * Andrea Design System — Core Tokens (Apple HIG × Vintage HTML / Acne Studios Standards)
 * Monochromatic hierarchy, high-fashion negative letter-spacing, vintage HTML metadata tags,
 * generous editorial spacing rhythm, and continuous squircle geometry.
 */

import { Platform } from 'react-native';

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const Radii = {
  none: 0,
  xs: 6,      // Micro tags, vintage badges
  sm: 10,     // Chips, inner items
  md: 14,     // Buttons, interactive pills
  lg: 18,     // Inset cards, medium widgets
  xl: 24,     // Feature cards, photo frames
  '2xl': 28,  // Modal sheets, bottom drawers
  '3xl': 32,  // Hero cards, dialog containers
  '4xl': 36,  // Large bottom drawers
  full: 9999, // Circular buttons, action pills
} as const;

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
  },
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.15,
  },
  bodyMedium: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.15,
  },
  callout: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
  },
  footnote: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  captionBold: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  // Vintage HTML & Technical Micro-Grotesque Tags
  vintageTag: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  overline: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sm: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  lg: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  glass: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 3,
  },
} as const;

export const Layout = {
  headerHeight: 52,
  tabBarHeight: 68,
  screenPadding: Spacing.md,
  screenPaddingHorizontal: Spacing.md,
  cardGap: Spacing.sm,
  sectionGap: Spacing.xl,
  maxContentWidth: 480, // High-fashion central runway constraint
} as const;
