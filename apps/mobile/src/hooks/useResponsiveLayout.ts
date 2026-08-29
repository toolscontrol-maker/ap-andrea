import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AspectRatios = {
  square: 1,           // 1:1 (Avatars, icons)
  portraitRunway: 4 / 5, // 4:5 (Photo memories, portraits)
  portraitClassic: 3 / 4, // 3:4 (Wishlist items, restaurant cards)
  golden: 1.618,       // 1.618 (Hero cards, weekly summaries)
  landscapeWide: 16 / 9, // 16:9 (Landscape banners, video)
  cinematic: 2.35,     // 21:9 (Panoramic headers)
} as const;

/**
 * Calculates perfectly concentric inner corner radius for nested containers.
 * Formula: R_inner = max(0, R_outer - Padding)
 */
export function getConcentricRadius(outerRadius: number, padding: number): number {
  return Math.max(0, outerRadius - padding);
}

export interface ResponsiveLayoutInfo {
  width: number;
  height: number;
  isSmallPhone: boolean;   // < 375px (iPhone SE, compact devices)
  isStandardPhone: boolean; // 375px - 430px (iPhone 15/16 Pro)
  isLargePhone: boolean;    // 430px - 600px (iPhone Pro Max, Plus)
  isTablet: boolean;        // 600px - 1024px (iPad, Android tablets)
  isDesktop: boolean;       // > 1024px (Desktop web)
  columns: number;          // 1 for phone, 2 for tablet/desktop grid
  contentPadding: number;   // Responsive horizontal padding
  safeBottomPadding: number; // Bottom padding including tab bar and home indicator
  isTouchDevice: boolean;
}

export function useResponsiveLayout(): ResponsiveLayoutInfo {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallPhone = width < 375;
  const isStandardPhone = width >= 375 && width < 430;
  const isLargePhone = width >= 430 && width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  const columns = isTablet || isDesktop ? 2 : 1;
  const contentPadding = isSmallPhone ? 12 : isStandardPhone ? 16 : 20;
  const safeBottomPadding = Math.max(insets.bottom + 68, 88);
  const isTouchDevice = Platform.OS !== 'web' || width <= 1024;

  return {
    width,
    height,
    isSmallPhone,
    isStandardPhone,
    isLargePhone,
    isTablet,
    isDesktop,
    columns,
    contentPadding,
    safeBottomPadding,
    isTouchDevice,
  };
}
