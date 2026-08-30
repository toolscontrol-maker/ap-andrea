import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Typography, Space } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  rightElement?: ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onAction,
  rightElement,
  style,
}: SectionHeaderProps) {
  const handleAction = () => {
    if (!onAction) return;
    triggerHaptic('light');
    onAction();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {rightElement ? (
        rightElement
      ) : actionText && onAction ? (
        <TouchableOpacity onPress={handleAction} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Space[3], // 12px
    marginTop: Space[4], // 16px
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    color: Colors.light.text,
    letterSpacing: Typography.h2.letterSpacing,
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  actionText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.label.fontSize,
    color: Colors.light.primary,
  },
});
