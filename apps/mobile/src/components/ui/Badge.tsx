import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';
import { SemanticCategory } from './Chip';

export interface BadgeProps {
  label: string;
  category?: SemanticCategory | 'danger' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Badge({
  label,
  category = 'default',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const getColors = () => {
    switch (category) {
      case 'danger':
        return {
          bg: Colors.light.dangerSoft,
          text: Colors.light.danger,
          border: 'rgba(217, 93, 93, 0.2)',
        };
      case 'success':
        return {
          bg: Colors.light.successSoft,
          text: Colors.light.success,
          border: 'rgba(94, 148, 112, 0.2)',
        };
      case 'butter':
        return {
          bg: Colors.light.accentButterSoft,
          text: '#7A5E0B',
          border: 'rgba(244, 201, 93, 0.25)',
        };
      case 'sage':
        return {
          bg: Colors.light.accentSageSoft,
          text: '#375E42',
          border: 'rgba(131, 169, 140, 0.25)',
        };
      case 'lavender':
        return {
          bg: Colors.light.accentLavenderSoft,
          text: '#4F4270',
          border: 'rgba(158, 138, 205, 0.25)',
        };
      case 'coral':
        return {
          bg: Colors.light.primarySoft,
          text: Colors.light.primary,
          border: 'rgba(239, 130, 106, 0.25)',
        };
      default:
        return {
          bg: Colors.light.surfaceMuted,
          text: Colors.light.textSecondary,
          border: Colors.light.border,
        };
    }
  };

  const themeColors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: themeColors.bg,
          borderColor: themeColors.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.badgeText, { color: themeColors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[1], // 4px
    paddingHorizontal: Space[2] + 2, // 10px
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    letterSpacing: Typography.caption.letterSpacing,
  },
});
