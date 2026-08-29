import React, { ReactNode } from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography, Shadows } from '../../theme/tokens';
import { PressableScale } from './PressableScale';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'outline' | 'ghost';
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
          color={isOutline || isGhost ? Colors.light.primary : '#FFFFFF'}
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
    borderRadius: Radii.md,
    gap: Spacing.xs,
  },
  primary: {
    backgroundColor: Colors.light.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Shadows.sm,
  },
  secondary: {
    backgroundColor: Colors.light.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Shadows.sm,
  },
  sage: {
    backgroundColor: Colors.light.sage,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Shadows.sm,
  },
  butter: {
    backgroundColor: Colors.light.butterDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Shadows.sm,
  },
  mistBlue: {
    backgroundColor: Colors.light.mistBlue,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Shadows.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
  },
  size_md: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
  },
  size_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.lg,
  },
  disabled: {
    opacity: 0.45,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
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
  text_outline: {
    color: Colors.light.primary,
  },
  text_ghost: {
    color: Colors.light.textSecondary,
  },
  textSize_sm: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  textSize_md: {
    ...Typography.body,
    fontWeight: '600',
  },
  textSize_lg: {
    ...Typography.headline,
    fontWeight: '600',
  },
});
