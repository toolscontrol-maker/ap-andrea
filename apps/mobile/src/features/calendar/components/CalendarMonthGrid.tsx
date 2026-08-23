import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { buildMonthGrid, WEEKDAYS_SHORT_ES } from '../utils/calendarDateUtils';
import { SanitizedEventItem } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface CalendarMonthGridProps {
  year: number;
  monthIndex: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  eventsByDate: Record<string, SanitizedEventItem[]>;
}

export function CalendarMonthGrid({
  year,
  monthIndex,
  selectedDate,
  onSelectDate,
  eventsByDate,
}: CalendarMonthGridProps) {
  const days = buildMonthGrid(year, monthIndex);

  return (
    <View style={styles.card}>
      {/* Weekdays Row */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS_SHORT_ES.map((w, idx) => (
          <Text key={idx} style={styles.weekdayLabel}>{w}</Text>
        ))}
      </View>

      {/* Days Matrix */}
      <View style={styles.daysGrid}>
        {days.map((item, idx) => {
          if (!item.dayNumber || !item.dateString) {
            return <View key={idx} style={styles.emptyDayCell} />;
          }

          const isSelected = selectedDate === item.dateString;
          const dayEvents = eventsByDate[item.dateString] || [];
          const hasEvents = dayEvents.length > 0;
          const isToday = item.isToday;

          // Check if there is a surprise on this day
          const hasSurprise = dayEvents.some((e) => e.eventType === 'surprise');
          const hasImportant = dayEvents.some((e) => e.eventType === 'important_date');

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => {
                triggerHaptic('selection');
                onSelectDate(item.dateString!);
              }}
              activeOpacity={0.7}
              accessibilityLabel={`Día ${item.dayNumber}`}
            >
              <Text
                style={[
                  styles.dayNumberText,
                  isSelected && styles.dayNumberTextSelected,
                  isToday && !isSelected && styles.dayNumberTextToday,
                ]}
              >
                {item.dayNumber}
              </Text>

              {/* Event Badge Dot */}
              {hasEvents && (
                <View
                  style={[
                    styles.eventDot,
                    hasSurprise && styles.eventDotSurprise,
                    hasImportant && styles.eventDotImportant,
                    isSelected && styles.eventDotSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
    marginBottom: Spacing.lg,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(43, 33, 41, 0.06)',
  },
  weekdayLabel: {
    ...Typography.captionBold,
    color: '#66737C',
    width: 38,
    textAlign: 'center',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emptyDayCell: {
    width: 38,
    height: 44,
    marginVertical: 2,
  },
  dayCell: {
    width: 38,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: Radii.lg,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: '#E86A58',
    shadowColor: '#E86A58',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#E86A58',
    backgroundColor: '#FDEEEB',
  },
  dayNumberText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#1E252B',
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayNumberTextToday: {
    color: '#E86A58',
    fontWeight: '800',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4A7C9B',
    marginTop: 2,
  },
  eventDotSurprise: {
    backgroundColor: '#E86A58',
  },
  eventDotImportant: {
    backgroundColor: '#CBA86A',
  },
  eventDotSelected: {
    backgroundColor: '#FFFFFF',
  },
});
