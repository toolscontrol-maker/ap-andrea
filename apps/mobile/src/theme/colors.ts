/**
 * Andrea Design System — Luxury Aesthetic Palettes, Gradients & Ambient Glows
 * Inspired by Apple Design Awards, Opal, Linear & Amie.
 */

export const Colors = {
  light: {
    // 1. Atmosphere & Canvas
    background: '#FAF6F0',        // Warm Linen Cream
    backgroundWarm: '#F5ECE1',
    surface: '#FFFFFF',           // Crisp Opal Surface
    surfaceGlass: 'rgba(255, 255, 255, 0.85)',
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F4ECE4',
    surfaceHighlight: '#FFFDF9',

    // 2. Emotional Coral & Rose Glow (Nuestro Diario / Sorpresas)
    primary: '#E86A58',           // Rich Velvet Coral
    primaryLight: '#FBECE8',
    primaryDark: '#C74A38',
    primaryGlow: 'rgba(232, 106, 88, 0.28)',
    gradientPrimary: ['#FF7E6B', '#E85B47'],

    // 3. Ethereal Lavender & AI Violet (AYA Space)
    secondary: '#8E77C6',         // Velvet Lavender
    secondaryLight: '#EFEBF8',
    secondaryDark: '#6850A3',
    secondaryGlow: 'rgba(142, 119, 198, 0.28)',
    gradientSecondary: ['#A48EE0', '#7B62BA'],

    // 4. Calming Sage Green
    sage: '#6D9E79',              // Nordic Sage
    sageLight: '#EBF4ED',
    sageDark: '#4D7D59',
    sageGlow: 'rgba(109, 158, 121, 0.24)',

    // 5. Warm Golden Butter & Candlelight (Ilusión / Preguntas)
    butter: '#E5A93C',            // Warm Honey Gold
    butterLight: '#FCF5E5',
    butterDark: '#B87E15',
    butterGlow: 'rgba(229, 169, 60, 0.3)',
    gradientButter: ['#F5C25D', '#E5A93C'],

    // 6. Deep Atlantic Mist & Voyage Blue (Mapa & Recuerdos)
    mistBlue: '#4A7C9B',          // Deep Fjords Blue
    mistBlueLight: '#E6EFF4',
    mistBlueDark: '#2C5772',
    mistBlueGlow: 'rgba(74, 124, 155, 0.28)',
    gradientMist: ['#5E94B5', '#3A6A87'],

    // 7. Luxury Editorial Typography
    text: '#2B2129',              // Obsidian Plum (Deep, warm luxury text)
    textSecondary: '#6B5E68',      // Mallow Slate
    textMuted: '#9B8E98',          // Soft Warm Gray
    textLight: '#C9BFC7',
    textGold: '#946714',
    textInverse: '#FFFFFF',

    // 8. Bevels, Glass Borders & Ambient Shadows
    border: 'rgba(43, 33, 41, 0.07)',
    borderStrong: 'rgba(43, 33, 41, 0.12)',
    borderGlass: 'rgba(255, 255, 255, 0.65)',
    borderGold: 'rgba(229, 169, 60, 0.35)',
    divider: 'rgba(43, 33, 41, 0.05)',

    cardShadow: 'rgba(43, 33, 41, 0.05)',
    modalBackdrop: 'rgba(25, 17, 23, 0.55)',
  },
} as const;

export type ThemeColors = typeof Colors.light;
