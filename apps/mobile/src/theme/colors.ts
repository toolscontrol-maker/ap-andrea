/**
 * Andrea Design System — High-Fashion Editorial & Apple Glass Palette
 * Inspired by Acne Studios, Zara Studio, Totême, and Apple iOS 18 HIG.
 * Monochromatic elegance, pure obsidian typography, vintage HTML hairlines, and frosted glass.
 */

export const Colors = {
  light: {
    // 1. Atmosphere & Canvas (Acne / Zara Studio Atelier Paper)
    background: '#FAF9F6',        // Warm Editorial Atelier Off-White
    backgroundWarm: '#F3F2EE',    // Pale Stone Canvas
    backgroundMuted: '#EBE9E4',   // Inset Grouped Canvas
    surface: '#FFFFFF',           // Crisp Opal Surface
    surfaceGlass: 'rgba(250, 249, 246, 0.82)', // Frosted glass with high blur
    surfaceGlassElevated: 'rgba(255, 255, 255, 0.90)',
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F6F5F1',
    surfaceHighlight: '#FFFDF9',
    surfaceDark: '#121212',       // Inverted Noir Capsule

    // 2. Monochromatic Primary & Obsidian Contrast (Zero Rainbow)
    primary: '#111111',           // Pure Deep Obsidian
    primaryLight: '#F0EFEA',      // Soft Atelier Stone Pill
    primaryDark: '#000000',       // Pure Pitch Black
    primaryGlow: 'rgba(17, 17, 17, 0.08)',
    gradientPrimary: ['#1A1A1A', '#0D0D0D'],

    // 3. Secondary Editorial Tone
    secondary: '#3D3B39',         // Deep Muted Charcoal
    secondaryLight: '#EAE8E3',
    secondaryDark: '#1E1D1C',
    secondaryGlow: 'rgba(61, 59, 57, 0.12)',
    gradientSecondary: ['#3D3B39', '#242321'],

    // 4. Quiet Luxury Accents (Subtle, Muted, Never Gaudy)
    sage: '#5E7063',              // Muted Atelier Olive Sage
    sageLight: '#EEF2EF',
    sageDark: '#3A483E',
    sageGlow: 'rgba(94, 112, 99, 0.15)',

    butter: '#8C734B',            // Vintage Muted Warm Bronze
    butterLight: '#F7F3EB',
    butterDark: '#5E4C2F',
    butterGlow: 'rgba(140, 115, 75, 0.15)',
    gradientButter: ['#9C8257', '#7D643E'],

    mistBlue: '#4A5B68',          // Slate Architectural Mist
    mistBlueLight: '#ECEFF2',
    mistBlueDark: '#2C3842',
    mistBlueGlow: 'rgba(74, 91, 104, 0.15)',
    gradientMist: ['#596E7D', '#3D4C57'],

    accentRose: '#C25E5E',        // Muted Terracotta Rose for couple hearts
    accentRoseLight: '#F9ECEC',
    accentGold: '#947B4F',        // Antique Specular Gold for star badges

    // 5. High-Fashion Editorial Typography
    text: '#111111',              // Pure Obsidian Black
    textSecondary: '#5A5855',      // Editorial Charcoal Taupe
    textMuted: '#8E8C88',          // Atelier Stone Gray
    textLight: '#B8B6B2',         // Hairline Text / Placeholder
    textGold: '#8C734B',          // Muted Bronze
    textInverse: '#FFFFFF',
    textMono: '#222222',          // Vintage HTML Monospace Text
    error: '#B83232',

    // 6. Hairlines, Glass Borders & Ambient Shadows (Vintage HTML + Apple Specular)
    border: 'rgba(17, 17, 17, 0.08)',
    borderStrong: 'rgba(17, 17, 17, 0.18)',
    borderGlass: 'rgba(255, 255, 255, 0.85)',
    borderGold: 'rgba(140, 115, 75, 0.25)',
    borderDark: '#111111',
    divider: 'rgba(17, 17, 17, 0.06)',

    cardShadow: 'rgba(17, 17, 17, 0.04)',
    modalBackdrop: 'rgba(17, 17, 17, 0.60)',
  },
} as const;

export type ThemeColors = typeof Colors.light;
