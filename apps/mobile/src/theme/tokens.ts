/**
 * Andrea Design System — Core Tokens (Apple HIG & Quiet Luxury Standards)
 * Inspired by Apple Design Awards, Apple Journal, Things 3 & Flighty.
 * 8-point geometric scale, G2 continuous squircle curvature, Materials & SF Pro optical tracking.
 */

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
  xs: 8,      // Micro tags, badges
  sm: 12,     // Inputs, chips, inner items
  md: 16,     // Buttons, interactive pills
  lg: 20,     // Inset cards, medium widgets
  xl: 24,     // Feature cards, photo frames
  '2xl': 28,  // Modal sheets, bottom sheets
  '3xl': 32,  // Hero cards, dialog containers
  '4xl': 36,  // Large bottom drawers
  full: 9999, // Circular buttons, action pills
} as const;

export { FontFamily, Typography } from './Typography';

export const Materials = {
  ultraThin: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
  },
  thin: {
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
  },
  regular: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  thick: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
  },
  darkGlass: {
    backgroundColor: 'rgba(12, 24, 48, 0.80)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
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
    shadowColor: 'rgba(30, 20, 35, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  sm: {
    shadowColor: 'rgba(30, 20, 35, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(30, 20, 35, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(30, 20, 35, 0.12)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
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

export const Layout = {
  maxContentWidth: 540,
  screenPaddingHorizontal: Spacing.lg,
  screenPaddingVertical: Spacing.lg,
  tabBarHeight: 68,
} as const;
