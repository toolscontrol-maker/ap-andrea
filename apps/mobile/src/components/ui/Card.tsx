import React, { useState, ReactNode } from 'react';
import { View, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native';
import { Colors, Radius, Space, Shadows, Motion } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export type CardType = 'standard' | 'interactive' | 'hero';

export interface CardProps {
  children: ReactNode;
  type?: CardType;
  onPress?: () => void;
  style?: ViewStyle;
  selected?: boolean;
}

export function Card({
  children,
  type = 'standard',
  onPress,
  style,
  selected = false,
}: CardProps) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const isInteractive = Boolean(onPress) || type === 'interactive';

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
    if (type === 'hero') return Radius.xl; // 24
    return Radius.lg; // 20
  };

  const getPadding = () => {
    if (type === 'hero') return Space[5]; // 20
    return Space[4]; // 16
  };

  const getShadow = () => {
    if (type === 'standard') return Shadows.none;
    return Shadows.soft;
  };

  const getBackground = () => {
    if (type === 'standard') return Colors.light.surface;
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
          borderColor: selected ? Colors.light.primary : Colors.light.border,
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
