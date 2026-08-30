import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          variant="secondary"
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[7], // 32px
    paddingHorizontal: Space[5], // 20px
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg, // 20px
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[4], // 16px
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Space[2], // 8px
  },
  description: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionButton: {
    marginTop: Space[5], // 20px
  },
});
