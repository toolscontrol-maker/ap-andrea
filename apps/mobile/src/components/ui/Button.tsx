import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography } from '../../theme/tokens';

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
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.xl,
    gap: Spacing.sm,
  },
  // Sizes
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
  },
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.xl,
  },
  size_lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: Radii['2xl'],
  },
  // Variants
  primary: {
    backgroundColor: Colors.light.primary,
  },
  secondary: {
    backgroundColor: Colors.light.secondary,
  },
  sage: {
    backgroundColor: Colors.light.sage,
  },
  butter: {
    backgroundColor: Colors.light.butterDark,
  },
  mistBlue: {
    backgroundColor: '#3D6B88',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  // Typography
  baseText: {
    ...Typography.bodyMedium,
    textAlign: 'center',
  },
  textSize_sm: {
    ...Typography.captionBold,
  },
  textSize_md: {
    ...Typography.bodyMedium,
  },
  textSize_lg: {
    ...Typography.h3,
    fontSize: 16,
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
    color: Colors.light.text,
  },
  text_ghost: {
    color: Colors.light.textSecondary,
  },
});
