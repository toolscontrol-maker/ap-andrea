import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Pressable,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Typography, Radius, Space, Motion, Layout } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: Motion.pressScale,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic(variant === 'primary' ? 'medium' : 'light');
    onPress();
  };

  const height = size === 'sm' ? 36 : size === 'md' ? Layout.touchTarget : 52;
  const paddingHorizontal = size === 'sm' ? Space[3] : size === 'md' ? Space[4] : Space[6];
  const borderRadius = size === 'sm' ? Radius.sm : size === 'md' ? Radius.md : Radius.lg;

  const getBackgroundColor = () => {
    if (disabled) return Colors.light.surfaceMuted;
    switch (variant) {
      case 'primary':
        return Colors.light.primary;
      case 'secondary':
        return Colors.light.primarySoft;
      case 'destructive':
        return Colors.light.dangerSoft;
      case 'icon':
        return Colors.light.surfaceElevated;
      case 'ghost':
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.light.textTertiary;
    switch (variant) {
      case 'primary':
        return Colors.light.textInverse;
      case 'secondary':
        return Colors.light.text;
      case 'destructive':
        return Colors.light.danger;
      case 'icon':
      case 'ghost':
      default:
        return Colors.light.text;
    }
  };

  const getBorder = () => {
    if (variant === 'icon') {
      return {
        borderWidth: 1,
        borderColor: Colors.light.border,
      };
    }
    if (variant === 'ghost') {
      return {
        borderWidth: 0,
      };
    }
    return {
      borderWidth: 1,
      borderColor: variant === 'secondary' ? 'rgba(239, 130, 106, 0.2)' : 'transparent',
    };
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          styles.baseButton,
          {
            height,
            paddingHorizontal: variant === 'icon' ? 0 : paddingHorizontal,
            width: variant === 'icon' ? height : fullWidth ? '100%' : undefined,
            borderRadius,
            backgroundColor: getBackgroundColor(),
            ...getBorder(),
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            {(title || (typeof children === 'string' && children)) ? (
              <Text
                style={[
                  styles.titleText,
                  {
                    color: getTextColor(),
                    fontSize: size === 'sm' ? Typography.label.fontSize : Typography.button.fontSize,
                  },
                  textStyle,
                ]}
              >
                {title || children}
              </Text>
            ) : (
              children
            )}
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Space[2],
  },
  iconRight: {
    marginLeft: Space[2],
  },
  titleText: {
    fontFamily: Typography.family.semiBold,
    letterSpacing: Typography.button.letterSpacing,
  },
});
