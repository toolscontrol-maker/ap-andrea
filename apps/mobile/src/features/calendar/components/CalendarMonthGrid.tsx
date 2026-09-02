import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { buildMonthGrid, WEEKDAYS_SHORT_ES } from '../utils/calendarDateUtils';
import { SanitizedEventItem } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { useDev } from '../../../context/DevContext';

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
  const { dailyCheckIns } = useDev();
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
          const isToday = item.isToday;

          // Check Daily Meeting Check-in status
          const checkIn = dailyCheckIns?.[item.dateString];
          const hasMet = checkIn?.confirmedMet === true;

          // Categorize event types for multi-dot indicators
          const hasSurprise = dayEvents.some((e) => e.eventType === 'surprise');
          const hasDateOrPlan = dayEvents.some((e) => e.eventType === 'shared_plan');
          const hasImportant = dayEvents.some((e) => e.eventType === 'important_date');
          const hasTrip = dayEvents.some((e) => e.eventType === 'future_trip');
          const hasRitual = dayEvents.some((e) => e.eventType === 'ritual');

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
              <View style={styles.dayHeaderRow}>
                <Text
                  style={[
                    styles.dayNumberText,
                    isSelected && styles.dayNumberTextSelected,
                    isToday && !isSelected && styles.dayNumberTextToday,
                  ]}
                >
                  {item.dayNumber}
                </Text>
                {/* Black Heart if they met on this day */}
                {hasMet && (
                  <Text style={[styles.blackHeartText, isSelected && { color: '#FFFFFF' }]}>
                    🖤
                  </Text>
                )}
              </View>

              {/* Semantic Multi-Dot Indicators (Max 3 visible dots or surprise spark) */}
              <View style={styles.dotsRow}>
                {hasSurprise ? (
                  <Text style={[styles.sparkIcon, isSelected && { color: '#FFFFFF' }]}>✦</Text>
                ) : (
                  <>
                    {hasDateOrPlan && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : '#E05666' },
                        ]}
                      />
                    )}
                    {hasImportant && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : '#D4AF37' },
                        ]}
                      />
                    )}
                    {hasTrip && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : '#5C9F9A' },
                        ]}
                      />
                    )}
                    {hasRitual && !hasDateOrPlan && (
                      <View
                        style={[
                          styles.indicatorDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : '#6D9E7B' },
                        ]}
                      />
                    )}
                  </>
                )}
              </View>
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
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
    marginBottom: Spacing.md,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.05)',
  },
  weekdayLabel: {
    ...Typography.captionBold,
    color: '#554A53',
    width: 42,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emptyDayCell: {
    width: 42,
    height: 46,
    marginVertical: 2,
  },
  dayCell: {
    width: 42,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: Radii.lg,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: Colors.light.primary,
    ...Shadows.sm,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
  },
  blackHeartText: {
    fontSize: 9,
    lineHeight: 12,
    marginLeft: 1,
  },
  dayNumberText: {
    ...Typography.bodyMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F1B1E',
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayNumberTextToday: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
    height: 6,
    marginTop: 2,
  },
  indicatorDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  sparkIcon: {
    fontSize: 9.5,
    color: '#E86A58',
    marginTop: -2,
  },
});
