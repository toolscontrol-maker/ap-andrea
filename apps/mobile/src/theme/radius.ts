/**
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
