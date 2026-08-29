import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MONTH_NAMES_ES } from '../utils/calendarDateUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface CalendarHeaderProps {
  year: number;
  monthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddNewEvent: () => void;
}

export function CalendarHeader({
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  onAddNewEvent,
}: CalendarHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Top Vintage HTML Meta Tag */}
      <View style={styles.headerTopMeta}>
        <Text style={styles.vintageHeaderTag}>[ AGENDA // ARCHIVE 2026 ]</Text>
        <Text style={styles.vintageHeaderDate}>CALENDARIO DE PAREJA</Text>
      </View>

      <View style={styles.headerRow}>
        {/* Month & Year Title with Switchers */}
        <View style={styles.monthControls}>
          <TouchableOpacity
            style={styles.arrowTouchArea}
            onPress={() => {
              triggerHaptic('light');
              onPrevMonth();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Mes anterior"
          >
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>‹</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.monthBadge}>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES_ES[monthIndex].toUpperCase()} {year}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.arrowTouchArea}
            onPress={() => {
              triggerHaptic('light');
              onNextMonth();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Mes siguiente"
          >
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Primary Circular 40x40 Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            triggerHaptic('medium');
            onAddNewEvent();
          }}
          activeOpacity={0.75}
          accessibilityLabel="Añadir plan o sorpresa"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  headerTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 17, 17, 0.06)',
  },
  vintageHeaderTag: {
    ...Typography.vintageTag,
    color: '#111111',
  },
  vintageHeaderDate: {
    ...Typography.vintageTag,
    color: '#8E8C88',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  arrowTouchArea: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginTop: -2,
  },
  monthBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.08)',
    ...Shadows.sm,
  },
  monthTitle: {
    ...Typography.vintageTag,
    fontSize: 12,
    color: '#111111',
    letterSpacing: 1.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
  },
});
