import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography } from '../../theme/tokens';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'neutral' | 'vintage';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`size_${size}`], style]}>
      {icon}
      <Text style={[styles.baseText, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radii.xs,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  size_sm: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radii.xs,
  },
  size_md: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.xs + 2,
  },
  primary: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  secondary: {
    backgroundColor: Colors.light.backgroundWarm,
    borderColor: Colors.light.border,
  },
  sage: {
    backgroundColor: Colors.light.sageLight,
    borderColor: 'rgba(94, 112, 99, 0.2)',
  },
  butter: {
    backgroundColor: Colors.light.butterLight,
    borderColor: 'rgba(140, 115, 75, 0.2)',
  },
  mistBlue: {
    backgroundColor: Colors.light.mistBlueLight,
    borderColor: 'rgba(74, 91, 104, 0.2)',
  },
  neutral: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.light.border,
  },
  vintage: {
    backgroundColor: 'transparent',
    borderColor: Colors.light.borderStrong,
  },
  baseText: {
    ...Typography.vintageTag,
  },
  textSize_sm: {
    fontSize: 9.5,
    lineHeight: 12,
  },
  textSize_md: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: Colors.light.text,
  },
  text_sage: {
    color: Colors.light.sageDark,
  },
  text_butter: {
    color: Colors.light.butterDark,
  },
  text_mistBlue: {
    color: Colors.light.mistBlueDark,
  },
  text_neutral: {
    color: Colors.light.textSecondary,
  },
  text_vintage: {
    color: Colors.light.text,
  },
});
