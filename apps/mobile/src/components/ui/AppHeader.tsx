import React, { ReactNode } from 'react';
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
