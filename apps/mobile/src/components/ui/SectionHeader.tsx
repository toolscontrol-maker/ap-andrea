import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Typography } from '../../theme/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xxs,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
});
