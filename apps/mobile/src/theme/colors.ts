export interface ThemePalette {
  id: 'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux';
  name: string;
  subtitle: string;
  previewColors: string[];
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
  atelier: {
    id: 'atelier',
    name: 'Atelier Romantique',
    subtitle: 'Champagne & Coral Rose',
    previewColors: ['#E05666', '#D4AF37', '#FAF7F2', '#3A2F38'],
    primary: '#E05666',
    secondary: '#D4AF37',
    background: '#FAF7F2',
    surface: '#FFFFFF',
    text: '#1A1716',
    textSecondary: '#6E6561',
    textMuted: '#9E948E',
    border: 'rgba(20, 19, 18, 0.06)',
  },
  velvet: {
    id: 'velvet',
    name: 'Midnight Velvet',
    subtitle: 'Obsidiana & Ámbar Dorado',
    previewColors: ['#D4AF37', '#E5A93C', '#141312', '#2A2624'],
    primary: '#D4AF37',
    secondary: '#E5A93C',
    background: '#141312',
    surface: '#1E1C1A',
    text: '#FAF8F5',
    textSecondary: '#C7BFB9',
    textMuted: '#8A827C',
    border: 'rgba(255, 255, 255, 0.08)',
  },
  lavender: {
    id: 'lavender',
    name: 'Provence Lavender',
    subtitle: 'Lavanda Francesa & Lino',
    previewColors: ['#8A7BB5', '#B4A7D6', '#F8F7FB', '#352E42'],
    primary: '#8A7BB5',
    secondary: '#B4A7D6',
    background: '#F8F7FB',
    surface: '#FFFFFF',
    text: '#221E2A',
    textSecondary: '#6A6375',
    textMuted: '#9A93A6',
    border: 'rgba(53, 46, 66, 0.07)',
  },
  olive: {
    id: 'olive',
    name: 'Jardín de Olivos',
    subtitle: 'Verde Salvia & Madera Cálida',
    previewColors: ['#5B7065', '#8A9A86', '#F6F8F6', '#26332C'],
    primary: '#5B7065',
    secondary: '#8A9A86',
    background: '#F6F8F6',
    surface: '#FFFFFF',
    text: '#1C2621',
    textSecondary: '#5E6E65',
    textMuted: '#8F9E96',
    border: 'rgba(38, 51, 44, 0.07)',
  },
  bordeaux: {
    id: 'bordeaux',
    name: 'Bordeaux Sunset',
    subtitle: 'Cereza Intenso & Nácar',
    previewColors: ['#8B263E', '#C74D68', '#FCF7F8', '#381620'],
    primary: '#8B263E',
    secondary: '#C74D68',
    background: '#FCF7F8',
    surface: '#FFFFFF',
    text: '#25181D',
    textSecondary: '#6B4E57',
    textMuted: '#9C7F88',
    border: 'rgba(56, 22, 32, 0.07)',
  },
};

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
