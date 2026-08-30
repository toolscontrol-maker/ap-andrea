import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../theme/colors';
import { triggerHaptic } from '../../utils/haptics';

const TAB_EMOJIS: Record<string, string> = {
  home: '🏠',
  wishes: '🎁',
  calendar: '📅',
  map: '📍',
};

export function FloatingGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter only the 4 visible main routes
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null && TAB_EMOJIS[route.name] !== undefined;
  });

  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View style={styles.glassPill}>
        {visibleRoutes.map((route) => {
          const isFocused = state.routes[state.index].name === route.name;
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
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
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
              {isFocused && <View style={styles.activePillIndicator} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 275,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.75)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(36px) saturate(220%)',
          WebkitBackdropFilter: 'blur(36px) saturate(220%)',
          boxShadow:
            '0 12px 36px 0 rgba(0, 0, 0, 0.22), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.06)',
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
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.68)' : 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
        } as any)
      : {}),
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  tabEmoji: {
    textAlign: 'center',
  },
  tabEmojiActive: {
    fontSize: 21,
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  tabEmojiInactive: {
    fontSize: 18,
    opacity: 0.55,
    transform: [{ scale: 0.95 }],
  },
  activePillIndicator: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
});
