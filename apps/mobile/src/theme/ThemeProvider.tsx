import React, { createContext, useContext, ReactNode } from 'react';
import { Colors, ColorTheme, Palette } from './colors';
import { Space } from './spacing';
import { Radius } from './radius';
import { Typography } from './Typography';
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
