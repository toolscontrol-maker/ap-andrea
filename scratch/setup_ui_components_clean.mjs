import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';
const uiDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'components', 'ui');

fs.mkdirSync(uiDir, { recursive: true });

// 1. ScreenWrapper.tsx
fs.writeFileSync(path.join(uiDir, 'ScreenWrapper.tsx'), `import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle } from 'react-native';
import { Colors, Space, Layout } from '../../theme';

export interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  fullBleed?: boolean;
  compact?: boolean;
  withTopInset?: boolean;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  style,
  contentStyle,
  fullBleed = false,
  compact = false,
  withTopInset = false,
  backgroundColor = Colors.light.background,
}: ScreenWrapperProps) {
  const horizontalPadding = fullBleed
    ? 0
    : compact
    ? Layout.screenPaddingCompact
    : Layout.screenPadding;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
      <View style={[styles.rootContainer, { backgroundColor }]}>
        <View
          style={[
            styles.contentContainer,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: withTopInset ? Space[4] : 0,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
});
`, 'utf8');

// 2. AppHeader.tsx
fs.writeFileSync(path.join(uiDir, 'AppHeader.tsx'), `import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Typography, Space, Layout, IconSizes, IconStroke } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    triggerHaptic('light');
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Volver atrás"
            accessibilityRole="button"
          >
            <ChevronLeft
              size={IconSizes.lg}
              color={Colors.light.text}
              strokeWidth={IconStroke.medium}
            />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrapper}>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          {title && <Text style={styles.titleText}>{title}</Text>}
        </View>
      </View>

      {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space[4],
    backgroundColor: 'transparent',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    flex: 1,
  },
  backButton: {
    width: Layout.iconButton,
    height: Layout.iconButton,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  titleWrapper: {
    justifyContent: 'center',
  },
  subtitleText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
    letterSpacing: Typography.caption.letterSpacing,
    textTransform: 'uppercase',
  },
  titleText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    color: Colors.light.text,
    letterSpacing: Typography.h2.letterSpacing,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
});
`, 'utf8');

// 3. Button.tsx
fs.writeFileSync(path.join(uiDir, 'Button.tsx'), `import React, { useState } from 'react';
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
            {title && (
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
                {title}
              </Text>
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
`, 'utf8');

// 4. IconButton.tsx
fs.writeFileSync(path.join(uiDir, 'IconButton.tsx'), `import React from 'react';
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
`, 'utf8');

// 5. Card.tsx
fs.writeFileSync(path.join(uiDir, 'Card.tsx'), `import React, { useState, ReactNode } from 'react';
import { View, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native';
import { Colors, Radius, Space, Shadows, Motion } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export type CardType = 'standard' | 'interactive' | 'hero';

export interface CardProps {
  children: ReactNode;
  type?: CardType;
  onPress?: () => void;
  style?: ViewStyle;
  selected?: boolean;
}

export function Card({
  children,
  type = 'standard',
  onPress,
  style,
  selected = false,
}: CardProps) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const isInteractive = Boolean(onPress) || type === 'interactive';

  const handlePressIn = () => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: Motion.pressScale,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (!onPress) return;
    triggerHaptic('light');
    onPress();
  };

  const getRadius = () => {
    if (type === 'hero') return Radius.xl; // 24
    return Radius.lg; // 20
  };

  const getPadding = () => {
    if (type === 'hero') return Space[5]; // 20
    return Space[4]; // 16
  };

  const getShadow = () => {
    if (type === 'standard') return Shadows.none;
    return Shadows.soft;
  };

  const getBackground = () => {
    if (type === 'standard') return Colors.light.surface;
    return Colors.light.surfaceElevated;
  };

  const content = (
    <View
      style={[
        styles.cardBase,
        {
          borderRadius: getRadius(),
          padding: getPadding(),
          backgroundColor: getBackground(),
          borderColor: selected ? Colors.light.primary : Colors.light.border,
          borderWidth: selected ? 1.5 : 1,
          ...getShadow(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (isInteractive && onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          accessibilityRole="button"
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  cardBase: {
    width: '100%',
  },
});
`, 'utf8');

// 6. Chip.tsx
fs.writeFileSync(path.join(uiDir, 'Chip.tsx'), `import React from 'react';
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
`, 'utf8');

// 7. Badge.tsx
fs.writeFileSync(path.join(uiDir, 'Badge.tsx'), `import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';
import { SemanticCategory } from './Chip';

export interface BadgeProps {
  label: string;
  category?: SemanticCategory | 'danger' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Badge({
  label,
  category = 'default',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const getColors = () => {
    switch (category) {
      case 'danger':
        return {
          bg: Colors.light.dangerSoft,
          text: Colors.light.danger,
          border: 'rgba(217, 93, 93, 0.2)',
        };
      case 'success':
        return {
          bg: Colors.light.successSoft,
          text: Colors.light.success,
          border: 'rgba(94, 148, 112, 0.2)',
        };
      case 'butter':
        return {
          bg: Colors.light.accentButterSoft,
          text: '#7A5E0B',
          border: 'rgba(244, 201, 93, 0.25)',
        };
      case 'sage':
        return {
          bg: Colors.light.accentSageSoft,
          text: '#375E42',
          border: 'rgba(131, 169, 140, 0.25)',
        };
      case 'lavender':
        return {
          bg: Colors.light.accentLavenderSoft,
          text: '#4F4270',
          border: 'rgba(158, 138, 205, 0.25)',
        };
      case 'coral':
        return {
          bg: Colors.light.primarySoft,
          text: Colors.light.primary,
          border: 'rgba(239, 130, 106, 0.25)',
        };
      default:
        return {
          bg: Colors.light.surfaceMuted,
          text: Colors.light.textSecondary,
          border: Colors.light.border,
        };
    }
  };

  const themeColors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: themeColors.bg,
          borderColor: themeColors.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.badgeText, { color: themeColors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[1], // 4px
    paddingHorizontal: Space[2] + 2, // 10px
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    letterSpacing: Typography.caption.letterSpacing,
  },
});
`, 'utf8');

// 8. Input.tsx
fs.writeFileSync(path.join(uiDir, 'Input.tsx'), `import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Radius, Space } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          Boolean(error) && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.light.textTertiary}
          selectionColor={Colors.light.primary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Space[3],
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.label.fontSize,
    color: Colors.light.textSecondary,
    marginBottom: Space[1],
    letterSpacing: Typography.label.letterSpacing,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.sm, // 12
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Space[3],
  },
  inputError: {
    borderColor: Colors.light.danger,
    backgroundColor: Colors.light.dangerSoft,
  },
  leftIcon: {
    marginRight: Space[2],
  },
  rightIcon: {
    marginLeft: Space[2],
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Typography.family.regular,
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
  },
  errorText: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.caption.fontSize,
    color: Colors.light.danger,
    marginTop: Space[1],
  },
  hintText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textTertiary,
    marginTop: Space[1],
  },
});
`, 'utf8');

// 9. ListRow.tsx
fs.writeFileSync(path.join(uiDir, 'ListRow.tsx'), `import React, { ReactNode } from 'react';
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
`, 'utf8');

// 10. SectionHeader.tsx
fs.writeFileSync(path.join(uiDir, 'SectionHeader.tsx'), `import React, { ReactNode } from 'react';
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
`, 'utf8');

// 11. EmptyState.tsx
fs.writeFileSync(path.join(uiDir, 'EmptyState.tsx'), `import React, { ReactNode } from 'react';
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
`, 'utf8');

// 12. BottomSheet.tsx & Modal.tsx
fs.writeFileSync(path.join(uiDir, 'BottomSheet.tsx'), `import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Radius, Space, Typography, Shadows, Layout } from '../../theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.light.scrim,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: Colors.light.surfaceElevated,
    borderTopLeftRadius: Radius.sheet, // 28
    borderTopRightRadius: Radius.sheet, // 28
    paddingHorizontal: Space[5], // 20
    paddingBottom: Space[7], // 32
    paddingTop: Space[3], // 12
    ...Shadows.floating,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderStrong,
    alignSelf: 'center',
    marginBottom: Space[3],
  },
  header: {
    marginBottom: Space[4],
    alignItems: 'center',
  },
  titleText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.h2.fontSize,
    color: Colors.light.text,
  },
  content: {
    width: '100%',
  },
});
`, 'utf8');

fs.writeFileSync(path.join(uiDir, 'Modal.tsx'), `import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Radius, Space, Typography, Shadows, Layout } from '../../theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[5],
    backgroundColor: Colors.light.scrim,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: Radius.xl, // 24
    padding: Space[5], // 20
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.floating,
  },
  header: {
    marginBottom: Space[4],
  },
  titleText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.h2.fontSize,
    color: Colors.light.text,
  },
  content: {
    width: '100%',
  },
});
`, 'utf8');

// 13. TabBar.tsx
fs.writeFileSync(path.join(uiDir, 'TabBar.tsx'), `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Typography, Layout, Space, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface TabItem {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                onTabPress(tab.id);
              }}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {tab.icon(isActive)}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? Colors.light.primary : Colors.light.textSecondary,
                    fontFamily: isActive ? Typography.family.bold : Typography.family.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Space[4],
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Space[4],
  },
  tabBar: {
    flexDirection: 'row',
    height: Layout.bottomTabBarHeight,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: Radius.pill,
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.floating,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    gap: 2,
  },
  tabButtonActive: {
    backgroundColor: Colors.light.primarySoft,
  },
  tabLabel: {
    fontSize: Typography.caption.fontSize,
    letterSpacing: Typography.caption.letterSpacing,
  },
});
`, 'utf8');

// 14. UI Index.ts
fs.writeFileSync(path.join(uiDir, 'index.ts'), `export * from './ScreenWrapper';
export * from './AppHeader';
export * from './Button';
export * from './IconButton';
export * from './Card';
export * from './Chip';
export * from './Badge';
export * from './Input';
export * from './ListRow';
export * from './SectionHeader';
export * from './EmptyState';
export * from './BottomSheet';
export * from './Modal';
export * from './TabBar';
export * from './InsetGroupedList';
export * from './PressableScale';
export * from './ConnectedCoupleHeart';
export * from './Icons';
`, 'utf8');

console.log('✅ UI components successfully generated in apps/mobile/src/components/ui/');
