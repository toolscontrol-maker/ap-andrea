import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconHome, IconGift, IconCalendar, IconCompass } from '../ui/Icons';
import { triggerHaptic } from '../../utils/haptics';
import { useDev } from '../../context/DevContext';
import { THEME_PALETTES } from '../../theme/colors';

interface TabItemConfig {
  label: string;
  renderIcon: (color: string, isFocused: boolean) => React.ReactNode;
}

const TAB_CONFIG: Record<string, TabItemConfig> = {
  home: {
    label: 'Nido',
    renderIcon: (color, isFocused) => (
      <IconHome size={19} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
    ),
  },
  wishes: {
    label: 'Deseos',
    renderIcon: (color, isFocused) => (
      <IconGift size={19} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
    ),
  },
  calendar: {
    label: 'Calendario',
    renderIcon: (color, isFocused) => (
      <IconCalendar size={19} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
    ),
  },
  map: {
    label: 'Atlas',
    renderIcon: (color, isFocused) => (
      <IconCompass size={19} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
    ),
  },
};

const PILL_WIDTH = 316;
const PADDING_H = 6;
const INNER_WIDTH = PILL_WIDTH - PADDING_H * 2; // 304
const NUM_TABS = 4;
const TAB_ITEM_WIDTH = INNER_WIDTH / NUM_TABS; // 76

export function FloatingGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { themePalette, customAccentColor } = useDev();
  const currentTheme = THEME_PALETTES[themePalette] || THEME_PALETTES.atelier;
  const activePrimary = customAccentColor || currentTheme.primary;

  // Filter only the 4 visible main routes
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null && TAB_CONFIG[route.name] !== undefined;
  });

  const activeIndex = Math.max(
    0,
    visibleRoutes.findIndex((r) => r.name === state.routes[state.index]?.name)
  );

  // Animated sliding pill value
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: false,
      stiffness: 420,
      damping: 28,
      mass: 0.7,
    }).start();
  }, [activeIndex]);

  const pillTranslateX = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, TAB_ITEM_WIDTH, TAB_ITEM_WIDTH * 2, TAB_ITEM_WIDTH * 3],
  });

  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View style={styles.glassPill}>
        {/* Animated Sliding Glass Indicator Pill with Dynamic Theme Accent */}
        <Animated.View
          style={[
            styles.slidingIndicatorPill,
            {
              width: TAB_ITEM_WIDTH,
              transform: [{ translateX: pillTranslateX }],
              backgroundColor: `${activePrimary}48`,
              borderColor: `${activePrimary}99`,
            },
          ]}
        />

        {visibleRoutes.map((route, idx) => {
          const isFocused = activeIndex === idx;
          const config = TAB_CONFIG[route.name] || {
            label: 'Tab',
            renderIcon: () => null,
          };

          const iconColor = isFocused ? '#FFFFFF' : 'rgba(255, 248, 242, 0.52)';
          const textColor = isFocused ? '#FFFFFF' : 'rgba(255, 248, 242, 0.44)';

          const onPress = () => {
            triggerHaptic('selection');
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.tabButton}
              accessibilityRole="button"
              accessibilityLabel={config.label}
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={styles.iconBox}>
                {config.renderIcon(iconColor, isFocused)}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: textColor },
                  isFocused && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 26,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  glassPill: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: PILL_WIDTH,
    height: 58,
    borderRadius: 29,
    paddingHorizontal: PADDING_H,
    paddingVertical: 5,
    backgroundColor: 'rgba(10, 20, 38, 0.88)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          boxShadow:
            '0 16px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.20), inset 0 -1px 1.5px 0 rgba(0, 0, 0, 0.40)',
        } as any)
      : {}),
    borderWidth: 1.2,
    borderColor: 'rgba(255, 248, 242, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  slidingIndicatorPill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: PADDING_H,
    borderRadius: 24,
    backgroundColor: 'rgba(224, 86, 102, 0.32)',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.65)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow:
            '0 4px 14px 0 rgba(224, 86, 102, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.30)',
        } as any)
      : {}),
    shadowColor: '#E05666',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    zIndex: 2,
    paddingTop: 2,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: -0.1,
    lineHeight: 12,
  },
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
});
