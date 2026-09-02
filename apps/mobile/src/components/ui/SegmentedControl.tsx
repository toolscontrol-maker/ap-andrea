import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Shadows, Spacing, Typography } from '../../theme/tokens';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  badgeCount?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
  style?: ViewStyle;
  activeColor?: string;
  activeTextColor?: string;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
  style,
  activeColor = '#FFFFFF',
  activeTextColor = '#1F1B1E',
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.segmentBtn,
              isSelected && [styles.segmentBtnActive, { backgroundColor: activeColor }],
            ]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && [styles.segmentTextActive, { color: activeTextColor }],
              ]}
            >
              {opt.label}
            </Text>
            {opt.badgeCount !== undefined && opt.badgeCount > 0 ? (
              <View style={[styles.badge, isSelected && styles.badgeActive]}>
                <Text style={[styles.badgeText, isSelected && styles.badgeTextActive]}>
                  {opt.badgeCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EE',
    borderRadius: Radii.xl,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(31, 27, 30, 0.06)',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.lg,
    gap: Spacing.xs,
  },
  segmentBtnActive: {
    ...Shadows.subtle,
  },
  segmentText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: '#554A53',
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#1F1B1E',
    fontWeight: '800',
  },
  badge: {
    backgroundColor: 'rgba(31, 27, 30, 0.08)',
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 1,
  },
  badgeActive: {
    backgroundColor: 'rgba(31, 27, 30, 0.12)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#554A53',
  },
  badgeTextActive: {
    color: '#1F1B1E',
  },
});
