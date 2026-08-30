/**
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
