import React, { ReactNode } from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography, Shadows } from '../../theme/tokens';
import { PressableScale } from './PressableScale';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
}: ButtonProps) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isGlass = variant === 'glass';

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.97}
      haptic="light"
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isGhost || isGlass ? Colors.light.text : '#FFFFFF'}
        />
      ) : (
        <>
          {iconLeft}
          <Text
            style={[
              styles.baseText,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {children}
          </Text>
          {iconRight}
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.full,
    gap: Spacing.xs + 2,
  },
  primary: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#111111',
    ...Shadows.sm,
  },
  secondary: {
    backgroundColor: Colors.light.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sage: {
    backgroundColor: Colors.light.sage,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  butter: {
    backgroundColor: Colors.light.butterDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mistBlue: {
    backgroundColor: Colors.light.mistBlue,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: Colors.light.borderStrong,
    ...Shadows.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.borderDark,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: Spacing.xs + 3,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: Radii.full,
  },
  size_md: {
    paddingVertical: Spacing.sm + 3,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.full,
  },
  size_lg: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: Radii.full,
  },
  disabled: {
    opacity: 0.4,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: Colors.light.text,
  },
  text_sage: {
    color: '#FFFFFF',
  },
  text_butter: {
    color: '#FFFFFF',
  },
  text_mistBlue: {
    color: '#FFFFFF',
  },
  text_glass: {
    color: Colors.light.text,
  },
  text_outline: {
    color: Colors.light.text,
  },
  text_ghost: {
    color: Colors.light.textSecondary,
  },
  textSize_sm: {
    ...Typography.captionBold,
  },
  textSize_md: {
    ...Typography.bodyMedium,
  },
  textSize_lg: {
    ...Typography.headline,
  },
});
