import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success';

/**
 * Mobile-safe haptic feedback for iOS and web viewports.
 */
export function triggerHaptic(type: HapticType = 'selection') {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      switch (type) {
        case 'light':
        case 'selection':
          navigator.vibrate(8);
          break;
        case 'medium':
          navigator.vibrate(15);
          break;
        case 'heavy':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([10, 30, 15]);
          break;
      }
    }
  } catch {
    // Ignore haptic errors on unsupported hardware
  }
}
