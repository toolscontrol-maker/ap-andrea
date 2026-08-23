import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Shadows, Spacing } from '../../theme/tokens';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'outlined' | 'interactive';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
}

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'xl',
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: Spacing[padding] },
    style,
  ];

  if (onPress || variant === 'interactive') {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii['2xl'],
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
  },
  default: {
    backgroundColor: Colors.light.surface,
    ...Shadows.sm,
  },
  elevated: {
    backgroundColor: Colors.light.surfaceElevated,
    borderColor: 'rgba(58, 47, 56, 0.06)',
    ...Shadows.md,
  },
  subtle: {
    backgroundColor: Colors.light.surfaceSubtle,
    borderColor: 'transparent',
    ...Shadows.none,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: Colors.light.borderStrong,
    ...Shadows.none,
  },
  interactive: {
    backgroundColor: Colors.light.surface,
    ...Shadows.sm,
  },
});
