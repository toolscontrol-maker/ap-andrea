import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'icon' | 'ghost' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export function IconButton({
  icon,
  onPress,
  variant = 'icon',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Button
      icon={icon}
      variant={variant}
      size={size}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
