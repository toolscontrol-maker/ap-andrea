import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Typography } from '../../theme/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string; // Optional vintage HTML tag like "[ 01 ]" or "COLLECTION // 2026"
  action?: ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  tag,
  action,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        {tag ? <Text style={styles.tag}>{tag}</Text> : null}
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
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  tag: {
    ...Typography.vintageTag,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
});
