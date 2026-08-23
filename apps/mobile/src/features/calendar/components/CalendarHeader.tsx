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
            {MONTH_NAMES_ES[monthIndex]} {year}
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

      {/* Primary Circular 44x44 Add Button */}
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
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  arrowTouchArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E252B',
    marginTop: -2,
  },
  monthBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
  },
  monthTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
    fontWeight: '800',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E86A58',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
});
