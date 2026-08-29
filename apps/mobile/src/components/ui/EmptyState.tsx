import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography } from '../../theme/tokens';
import { Button } from './Button';
import { IconSparkles } from './Icons';

interface EmptyStateProps {
  emoji?: string;
  icon?: ReactNode;
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
  icon,
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
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : icon ? (
          icon
        ) : (
          <IconSparkles size={20} color={Colors.light.primary} strokeWidth={1.8} />
        )}
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
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 26,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    minWidth: 160,
  },
});
