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
import { triggerHaptic } from '../../utils/haptics';

const TAB_EMOJIS: Record<string, string> = {
  home: '🏠',
  wishes: '🎁',
  calendar: '📅',
  map: '📍',
};

const PILL_WIDTH = 275;
const PADDING_H = 6;
const INNER_WIDTH = PILL_WIDTH - PADDING_H * 2; // 263
const NUM_TABS = 4;
const TAB_ITEM_WIDTH = INNER_WIDTH / NUM_TABS; // ~65.75

export function FloatingGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter only the 4 visible main routes
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null && TAB_EMOJIS[route.name] !== undefined;
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
        {/* Animated Sliding Frosted Glass Indicator Pill */}
        <Animated.View
          style={[
            styles.slidingIndicatorPill,
            {
              width: TAB_ITEM_WIDTH,
              transform: [{ translateX: pillTranslateX }],
            },
          ]}
        />

        {visibleRoutes.map((route, idx) => {
          const isFocused = activeIndex === idx;
          const emoji = TAB_EMOJIS[route.name] || '✦';

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
              activeOpacity={0.7}
              style={styles.tabButton}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Text
                style={[
                  styles.tabEmoji,
                  isFocused ? styles.tabEmojiActive : styles.tabEmojiInactive,
                ]}
              >
                {emoji}
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
    bottom: Platform.OS === 'web' ? 22 : 28,
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
    height: 56,
    borderRadius: 28,
    paddingHorizontal: PADDING_H,
    paddingVertical: 5,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.72)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(36px) saturate(220%)',
          WebkitBackdropFilter: 'blur(36px) saturate(220%)',
          boxShadow:
            '0 14px 38px 0 rgba(0, 0, 0, 0.22), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.06)',
        } as any)
      : {}),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 16,
  },
  slidingIndicatorPill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: PADDING_H,
    borderRadius: 23,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow:
            '0 3px 10px 0 rgba(0, 0, 0, 0.10), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        } as any)
      : {}),
    shadowColor: 'rgba(0, 0, 0, 0.10)',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    zIndex: 2,
  },
  tabEmoji: {
    textAlign: 'center',
  },
  tabEmojiActive: {
    fontSize: 22,
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  tabEmojiInactive: {
    fontSize: 18,
    opacity: 0.52,
    transform: [{ scale: 0.95 }],
  },
});
