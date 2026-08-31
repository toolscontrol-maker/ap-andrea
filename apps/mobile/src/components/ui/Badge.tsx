import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';
import { SemanticCategory } from './Chip';

export interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  category?: SemanticCategory | 'danger' | 'success' | 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'neutral' | 'lavender' | 'coral' | 'default';
  variant?: SemanticCategory | 'danger' | 'success' | 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' | 'neutral' | 'lavender' | 'coral' | 'default';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Badge({
  label,
  children,
  category,
  variant,
  size = 'md',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const activeType = variant || category || 'default';

  const getColors = () => {
    switch (activeType) {
      case 'danger':
        return {
          bg: Colors.light.dangerSoft || '#FDF0EE',
          text: Colors.light.danger || '#D95D5D',
          border: 'rgba(217, 93, 93, 0.2)',
        };
      case 'success':
        return {
          bg: Colors.light.successSoft || '#F0F7F2',
          text: Colors.light.success || '#5E9470',
          border: 'rgba(94, 148, 112, 0.2)',
        };
      case 'butter':
        return {
          bg: '#FAF5EA',
          text: '#7A5E0B',
          border: 'rgba(244, 201, 93, 0.35)',
        };
      case 'sage':
        return {
          bg: '#F0F6F2',
          text: '#2A7B54',
          border: 'rgba(95, 133, 117, 0.25)',
        };
      case 'lavender':
      case 'mistBlue':
        return {
          bg: '#F3F0FA',
          text: '#4F4270',
          border: 'rgba(158, 138, 205, 0.25)',
        };
      case 'coral':
      case 'primary':
        return {
          bg: '#FFF0F2',
          text: '#D84A65',
          border: 'rgba(224, 86, 102, 0.25)',
        };
      case 'secondary':
        return {
          bg: '#F5EFE8',
          text: '#766B72',
          border: 'rgba(43, 33, 41, 0.1)',
        };
      default:
        return {
          bg: Colors.light.surfaceMuted || '#FAF5EE',
          text: Colors.light.textSecondary || '#766B72',
          border: Colors.light.border || 'rgba(43, 33, 41, 0.08)',
        };
    }
  };

  const themeColors = getColors();
  const content = label || children;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && { paddingVertical: 2, paddingHorizontal: 6 },
        {
          backgroundColor: themeColors.bg,
          borderColor: themeColors.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {typeof content === 'string' ? (
        <Text style={[styles.badgeText, size === 'sm' && { fontSize: 10.5 }, { color: themeColors.text }, textStyle]}>
          {content}
        </Text>
      ) : (
        content
      )}
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
