import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Radii, Spacing, Typography, Shadows } from '../../theme/tokens';
import { Colors } from '../../theme/colors';
import { triggerHaptic } from '../../utils/haptics';

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

interface InsetGroupedListProps {
  items: InsetItem[];
  headerTitle?: string;
  footerText?: string;
  style?: ViewStyle;
}

export function InsetGroupedList({
  items,
  headerTitle,
  footerText,
  style,
}: InsetGroupedListProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {headerTitle && <Text style={styles.headerTitle}>{headerTitle.toUpperCase()}</Text>}

      <View style={styles.cardContainer}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.65}
                onPress={() => {
                  if (item.onPress) {
                    triggerHaptic('light');
                    item.onPress();
                  }
                }}
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
                {item.showChevron && <Text style={styles.chevron}>›</Text>}
              </TouchableOpacity>

              {!isLast && (
                <View
                  style={[
                    styles.separator,
                    { marginLeft: item.icon ? 52 : Spacing.lg },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {footerText && <Text style={styles.footerText}>{footerText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  headerTitle: {
    ...Typography.overline,
    color: Colors.light.textMuted,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.xs,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.subtle,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  iconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 11,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  destructiveTitle: {
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  valueText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginRight: 4,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(60, 60, 67, 0.35)',
    fontWeight: '600',
    marginLeft: 2,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(43, 33, 41, 0.08)',
  },
  footerText: {
    ...Typography.footnote,
    color: Colors.light.textMuted,
    marginLeft: Spacing.lg,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
});
