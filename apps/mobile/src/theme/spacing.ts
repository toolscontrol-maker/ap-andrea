/**
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
