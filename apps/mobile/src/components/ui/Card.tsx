import React, { useState, ReactNode } from 'react';
import { View, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native';
import { Colors, Radius, Space, Shadows, Motion } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export type CardType = 'standard' | 'interactive' | 'hero' | 'glass' | 'architectural';

export interface CardProps {
  children: ReactNode;
  type?: CardType;
  variant?: CardType | 'elevated';
  onPress?: () => void;
  style?: ViewStyle;
  selected?: boolean;
}

export function Card({
  children,
  type = 'standard',
  variant,
  onPress,
  style,
  selected = false,
}: CardProps) {
  const activeType = (variant === 'elevated' ? 'hero' : variant) || type;
  const [scaleAnim] = useState(new Animated.Value(1));
  const isInteractive = Boolean(onPress) || activeType === 'interactive';

  const handlePressIn = () => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: Motion.pressScale,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (!onPress) return;
    triggerHaptic('light');
    onPress();
  };

  const getRadius = () => {
    if (activeType === 'architectural') return 12; // Crisp rectangular radius
    if (activeType === 'hero' || activeType === 'glass') return Radius.xl; // 24 squircle
    return Radius.lg; // 20
  };

  const getPadding = () => {
    if (activeType === 'hero' || activeType === 'glass') return Space[5] + 2; // 22px
    if (activeType === 'architectural') return Space[4]; // 16px
    return Space[4]; // 16px
  };

  const getShadow = () => {
    if (activeType === 'glass') return Shadows.card || Shadows.soft;
    if (activeType === 'standard') return Shadows.none;
    return Shadows.soft;
  };

  const getBackground = () => {
    if (activeType === 'glass') return 'rgba(255, 255, 255, 0.90)';
    if (activeType === 'architectural') return '#FAF8F5';
    if (activeType === 'standard') return Colors.light.surface;
    return Colors.light.surfaceElevated;
  };

  const content = (
    <View
      style={[
        styles.cardBase,
        {
          borderRadius: getRadius(),
          padding: getPadding(),
          backgroundColor: getBackground(),
          borderColor: selected ? Colors.light.primary : activeType === 'glass' ? 'rgba(43, 33, 41, 0.08)' : Colors.light.border,
          borderWidth: selected ? 1.5 : 1,
          ...getShadow(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (isInteractive && onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          accessibilityRole="button"
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  cardBase: {
    width: '100%',
  },
});
