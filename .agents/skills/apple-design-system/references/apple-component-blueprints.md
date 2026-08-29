# 🛠️ Apple Component Blueprints

Production-ready React Native / Expo components implementing Apple's HIG specifications.

---

## 1. `PressableScale`: Apple Interactive Spring Container

```tsx
import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';
import { triggerHaptic } from '../utils/haptics';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  scaleTo?: number; // Default 0.96
  haptic?: 'light' | 'medium' | 'selection';
  style?: ViewStyle;
}

export function PressableScale({
  children,
  onPress,
  scaleTo = 0.96,
  haptic = 'light',
  style,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (haptic) triggerHaptic(haptic);
    Animated.spring(scale, {
      toValue: scaleTo,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
```

---

## 2. `InsetGroupedList`: Apple Settings & Journal List

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Radii, Spacing, Typography } from '../theme/tokens';
import { IconChevronRight } from './Icons';

export interface InsetItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export function InsetGroupedList({ items }: { items: InsetItem[] }) {
  return (
    <View style={styles.cardContainer}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}

              <View style={styles.textContainer}>
                <Text style={[styles.title, item.destructive && styles.destructiveTitle]}>
                  {item.title}
                </Text>
                {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
              </View>

              {item.value && <Text style={styles.valueText}>{item.value}</Text>}
              {item.showChevron && <IconChevronRight size={16} color="rgba(60, 60, 67, 0.3)" />}
            </TouchableOpacity>

            {!isLast && <View style={[styles.separator, { marginLeft: item.icon ? 52 : 16 }]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  destructiveTitle: {
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 1,
  },
  valueText: {
    fontSize: 15,
    color: '#8E8E93',
    marginRight: 6,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(60, 60, 67, 0.15)',
  },
});
```
