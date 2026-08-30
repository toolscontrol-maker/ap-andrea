import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography } from '../../theme/tokens';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'neutral';
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
    borderRadius: Radii.sm,
    gap: Spacing.xs,
  },
  size_sm: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radii.xs + 2,
  },
  size_md: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
  },
  primary: {
    backgroundColor: Colors.light.primaryLight,
  },
  secondary: {
    backgroundColor: Colors.light.secondaryLight,
  },
  sage: {
    backgroundColor: Colors.light.sageLight,
  },
  butter: {
    backgroundColor: Colors.light.butterLight,
  },
  mistBlue: {
    backgroundColor: Colors.light.mistBlueLight,
  },
  neutral: {
    backgroundColor: Colors.light.surfaceSubtle,
  },
  baseText: {
    ...Typography.captionBold,
  },
  textSize_sm: {
    fontSize: 10,
    lineHeight: 13,
  },
  textSize_md: {
    fontSize: 11,
    lineHeight: 15,
  },
  text_primary: {
    color: Colors.light.primaryDark,
  },
  text_secondary: {
    color: Colors.light.secondaryDark,
  },
  text_sage: {
    color: Colors.light.sageDark,
  },
  text_butter: {
    color: Colors.light.butterDark,
  },
  text_mistBlue: {
    color: '#2A5570',
  },
  text_neutral: {
    color: Colors.light.textSecondary,
  },
});
