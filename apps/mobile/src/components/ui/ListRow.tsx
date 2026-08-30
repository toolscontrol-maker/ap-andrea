import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Space, IconSizes, IconStroke } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  rightValue?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  isLast?: boolean;
}

export function ListRow({
  title,
  subtitle,
  leftIcon,
  rightValue,
  showChevron = false,
  onPress,
  style,
  isLast = false,
}: ListRowProps) {
  const handlePress = () => {
    if (!onPress) return;
    triggerHaptic('light');
    onPress();
  };

  const content = (
    <View style={[styles.row, !isLast && styles.separator, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
      </View>
      <View style={styles.rightContainer}>
        {rightValue && <View style={styles.rightValue}>{rightValue}</View>}
        {showChevron && (
          <ChevronRight
            size={IconSizes.sm}
            color={Colors.light.textTertiary}
            strokeWidth={IconStroke.medium}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    backgroundColor: Colors.light.surfaceElevated,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  leftIcon: {
    marginRight: Space[3],
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
  },
  subtitleText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  rightValue: {
    justifyContent: 'center',
  },
});
