import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export type SemanticCategory = 'default' | 'coral' | 'butter' | 'sage' | 'lavender';

export interface ChipProps {
  label: string;
  selected?: boolean;
  category?: SemanticCategory;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  count?: number;
}

export function Chip({
  label,
  selected = false,
  category = 'default',
  icon,
  onPress,
  style,
  textStyle,
  count,
}: ChipProps) {
  const handlePress = () => {
    if (!onPress) return;
    triggerHaptic('light');
    onPress();
  };

  const getColors = () => {
    if (selected) {
      return {
        bg: Colors.light.primary,
        text: Colors.light.textInverse,
        border: Colors.light.primary,
      };
    }
    switch (category) {
      case 'butter':
        return {
          bg: Colors.light.accentButterSoft,
          text: '#7A5E0B',
          border: 'rgba(244, 201, 93, 0.3)',
        };
      case 'sage':
        return {
          bg: Colors.light.accentSageSoft,
          text: '#375E42',
          border: 'rgba(131, 169, 140, 0.3)',
        };
      case 'lavender':
        return {
          bg: Colors.light.accentLavenderSoft,
          text: '#4F4270',
          border: 'rgba(158, 138, 205, 0.3)',
        };
      case 'coral':
        return {
          bg: Colors.light.primarySoft,
          text: Colors.light.primary,
          border: 'rgba(239, 130, 106, 0.3)',
        };
      default:
        return {
          bg: Colors.light.surfaceElevated,
          text: Colors.light.text,
          border: Colors.light.border,
        };
    }
  };

  const themeColors = getColors();

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: themeColors.bg,
          borderColor: themeColors.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text
        style={[
          styles.labelText,
          { color: themeColors.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
      {typeof count === 'number' && (
        <View style={styles.countBadge}>
          <Text style={[styles.countText, { color: themeColors.text }]}>{count}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[1] + 2, // 6px
    paddingHorizontal: Space[3], // 12px
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: Space[1] + 2, // 6px
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.label.fontSize,
    lineHeight: Typography.label.lineHeight,
    letterSpacing: Typography.label.letterSpacing,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  countText: {
    fontFamily: Typography.family.bold,
    fontSize: 10,
  },
});
