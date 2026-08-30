/**
 * Andrea Design System — Luxury Aesthetic Palettes, Gradients & Ambient Glows
 * Inspired by Apple Design Awards, Opal, Linear & Amie.
 */

export const Colors = {
  light: {
    // 1. Atmosphere & Canvas
    background: '#FAF7F2',        // Warm Linen Cream (Atelier Quiet Luxury)
    backgroundWarm: '#F5EFE6',
    surface: '#FFFFFF',           // Crisp Opal Surface
    surfaceGlass: 'rgba(255, 255, 255, 0.88)',
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F6F1EA',
    surfaceHighlight: '#FFFDFB',

    // 2. Emotional Velvet Coral & Rose Glow
    primary: '#E05666',           // Velvet Dusty Coral
    primaryLight: '#FCEEF0',
    primaryDark: '#B83A4A',
    primaryGlow: 'rgba(224, 86, 102, 0.24)',
    gradientPrimary: ['#F06A7B', '#E05666'],

    // 3. Ethereal Lavender & AI Violet (AYA Space)
    secondary: '#8A7BB5',         // Velvet Lavender
    secondaryLight: '#EFEBF8',
    secondaryDark: '#6850A3',
    secondaryGlow: 'rgba(138, 123, 181, 0.24)',
    gradientSecondary: ['#A48EE0', '#7B62BA'],

    // 4. Calming Sage Green
    sage: '#6D9E7B',              // Nordic Sage
    sageLight: '#EDF5EF',
    sageDark: '#4D7D59',
    sageGlow: 'rgba(109, 158, 123, 0.22)',

    // 5. Warm Golden Butter & Candlelight
    butter: '#D4AF37',            // Champagne Gold
    butterLight: '#FAF4E6',
    butterDark: '#A08020',
    butterGlow: 'rgba(212, 175, 55, 0.25)',
    gradientButter: ['#F5D67A', '#D4AF37'],

    // 6. Deep Atlantic Mist & Voyage Blue (Mapa & Recuerdos)
    mistBlue: '#5C9F9A',          // Deep Mist Blue
    mistBlueLight: '#E8F3F2',
    mistBlueDark: '#3A7570',
    mistBlueGlow: 'rgba(92, 159, 154, 0.24)',
    gradientMist: ['#6EB8B2', '#4B8883'],

    // 7. Luxury Editorial Typography (Obsidian & Linen)
    text: '#1A1716',              // Warm Obsidian Charcoal
    textSecondary: '#6E6561',      // Mallow Slate
    textMuted: '#9E948E',          // Soft Warm Gray
    textLight: '#C7BFB9',
    textGold: '#A08020',
    textInverse: '#FFFFFF',
    error: '#D9534F',

    // 8. Bevels, Glass Borders & Ambient Shadows
    border: 'rgba(20, 19, 18, 0.06)',
    borderStrong: 'rgba(20, 19, 18, 0.12)',
    borderGlass: 'rgba(255, 255, 255, 0.75)',
    borderGold: 'rgba(212, 175, 55, 0.3)',
    divider: 'rgba(20, 19, 18, 0.04)',

    cardShadow: 'rgba(20, 19, 18, 0.04)',
    modalBackdrop: 'rgba(16, 14, 13, 0.55)',
  },
} as const;

export type ThemeColors = typeof Colors.light;
