import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography } from '../../theme/tokens';
import { Button } from './Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue';
  iconBgColor?: string;
  style?: ViewStyle;
}

export function EmptyState({
  emoji,
  title,
  subtitle,
  actionText,
  onAction,
  actionVariant = 'primary',
  iconBgColor = Colors.light.primaryLight,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {actionText && onAction ? (
        <Button
          variant={actionVariant}
          size="md"
          onPress={onAction}
          style={styles.actionBtn}
        >
          {actionText}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing['4xl'],
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: Radii['4xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 34,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
    maxWidth: 320,
  },
  actionBtn: {
    paddingHorizontal: Spacing['2xl'],
  },
});
