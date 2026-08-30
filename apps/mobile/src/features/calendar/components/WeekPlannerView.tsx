import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SanitizedEventItem } from '../domain/calendar.types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';
import { Badge } from '../../../components/ui/Badge';

interface WeekPlannerViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  eventsByDate: Record<string, SanitizedEventItem[]>;
  onSelectEvent: (event: SanitizedEventItem) => void;
  onAddNewPlanForDate: (date: string) => void;
  onOpenRestaurants?: () => void;
}

const DAY_NAMES_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAY_NAMES_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];
const MONTH_NAMES_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function WeekPlannerView({
  selectedDate,
  onSelectDate,
  eventsByDate,
  onSelectEvent,
  onAddNewPlanForDate,
  onOpenRestaurants,
}: WeekPlannerViewProps) {
  // 1. Calculate the 7 days of the active week based on selectedDate
  const weekDays = useMemo(() => {
    const active = new Date(selectedDate);
    const dayOfWeek = active.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(active);
    monday.setDate(active.getDate() + mondayOffset);

    const days: { dateStr: string; dayNum: number; dayNameShort: string; dayNameFull: string; monthShort: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayNameShort: DAY_NAMES_SHORT[i],
        dayNameFull: DAY_NAMES_FULL[i],
        monthShort: MONTH_NAMES_SHORT[d.getMonth()],
      });
    }

    return days;
  }, [selectedDate]);

  // 2. Compute emotional summary of the week
  const weekSummary = useMemo(() => {
    let totalEvents = 0;
    let hasTrip = false;
    let hasSurprise = false;
    let hasDate = false;

    weekDays.forEach((d) => {
      const evs = eventsByDate[d.dateStr] || [];
      totalEvents += evs.length;
      evs.forEach((e) => {
        if (e.eventType === 'future_trip') hasTrip = true;
        if (e.eventType === 'surprise') hasSurprise = true;
        if (e.eventType === 'important_date') hasDate = true;
      });
    });

    if (hasTrip) {
      return { text: '✈️ Tenéis una escapada esta semana', bg: 'rgba(92, 159, 154, 0.12)', color: '#447A76' };
    }
    if (hasDate) {
      return { text: '✨ Hay una fecha especial en esta semana', bg: 'rgba(212, 175, 55, 0.12)', color: '#A08020' };
    }
    if (hasSurprise) {
      return { text: '✦ Hay un plan especial con pistas preparándose', bg: 'rgba(232, 106, 88, 0.12)', color: '#C24D3D' };
    }
    if (totalEvents >= 3) {
      return { text: '❤️ Semana activa para disfrutar juntos', bg: 'rgba(224, 86, 102, 0.12)', color: '#B53847' };
    }
    return { text: '🌿 Semana tranquila con huecos para vosotros', bg: 'rgba(109, 158, 123, 0.12)', color: '#4E7A5A' };
  }, [weekDays, eventsByDate]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      {/* Emotional Week Pacing Badge */}
      <View style={[styles.pacingBadge, { backgroundColor: weekSummary.bg }]}>
        <Text style={[styles.pacingText, { color: weekSummary.color }]}>
          {weekSummary.text}
        </Text>
      </View>

      {/* Horizontal Week Days Strip */}
      <View style={styles.weekStripCard}>
        <View style={styles.weekStripRow}>
          {weekDays.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            const isToday = d.dateStr === todayStr;
            const dayEvents = eventsByDate[d.dateStr] || [];
            const hasEvents = dayEvents.length > 0;

            return (
              <TouchableOpacity
                key={d.dateStr}
                style={[
                  styles.dayColumn,
                  isSelected && styles.dayColumnSelected,
                  isToday && !isSelected && styles.dayColumnToday,
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  onSelectDate(d.dateStr);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayHeaderLetter,
                    isSelected && styles.textInverse,
                  ]}
                >
                  {d.dayNameShort}
                </Text>
                <Text
                  style={[
                    styles.dayHeaderNumber,
                    isSelected && styles.textInverse,
                  ]}
                >
                  {d.dayNum}
                </Text>

                {/* Dot Indicator */}
                <View style={styles.dotContainer}>
                  {hasEvents ? (
                    <View
                      style={[
                        styles.indicatorDot,
                        isSelected ? { backgroundColor: '#FFFFFF' } : { backgroundColor: Colors.light.primary },
                      ]}
                    />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Vertical Days Stream */}
      <View style={styles.daysStreamContainer}>
        {weekDays.map((d) => {
          const isSelected = d.dateStr === selectedDate;
          const isToday = d.dateStr === todayStr;
          const dayEvents = eventsByDate[d.dateStr] || [];

          return (
            <View
              key={`card-${d.dateStr}`}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardActive,
              ]}
            >
              {/* Day Header Row */}
              <View style={styles.dayCardHeaderRow}>
                <View style={styles.dayTitleGroup}>
                  <Text style={styles.dayCardName}>
                    {d.dayNameFull}, {d.dayNum} de {d.monthShort}
                  </Text>
                  {isToday && (
                    <View style={styles.todayPill}>
                      <Text style={styles.todayPillText}>Hoy</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addMiniBtn}
                  onPress={() => {
                    triggerHaptic('light');
                    onAddNewPlanForDate(d.dateStr);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addMiniBtnText}>+ Añadir</Text>
                </TouchableOpacity>
              </View>

              {/* Day Events or Free Time Suggestion */}
              {dayEvents.length > 0 ? (
                <View style={styles.eventsGroup}>
                  {dayEvents.map((ev) => (
                    <TouchableOpacity
                      key={ev.id}
                      style={[
                        styles.eventItem,
                        ev.eventType === 'surprise' && styles.eventItemSurprise,
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        onSelectEvent(ev);
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.eventLeftBlock}>
                        {ev.time ? (
                          <Text style={styles.eventTimeText}>{ev.time}</Text>
                        ) : (
                          <Text style={styles.eventTimeText}>Día</Text>
                        )}
                      </View>

                      <View style={styles.eventInfoBlock}>
                        <View style={styles.eventBadgeRow}>
                          <Badge
                            variant={
                              ev.eventType === 'surprise'
                                ? 'secondary'
                                : ev.eventType === 'future_trip'
                                ? 'mistBlue'
                                : 'primary'
                            }
                          >
                            {ev.eventType === 'surprise'
                              ? '✦ Sorpresa'
                              : ev.eventType === 'future_trip'
                              ? '✈️ Viaje'
                              : 'Plan'}
                          </Badge>
                          {ev.locationName && (
                            <Text style={styles.eventLocationText} numberOfLines={1}>
                              📍 {ev.locationName}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.eventTitleText}>{ev.title}</Text>
                        {ev.subtitle && (
                          <Text style={styles.eventSubtitleText} numberOfLines={1}>
                            {ev.subtitle}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.freeSlotBox}>
                  <Text style={styles.freeSlotEmoji}>☼</Text>
                  <View style={styles.freeSlotTextGroup}>
                    <Text style={styles.freeSlotTitle}>Día libre para vosotros</Text>
                    <Text style={styles.freeSlotDesc}>
                      Un buen momento para improvisar o elegir un sitio que os haga ilusión.
                    </Text>
                  </View>
                  {onOpenRestaurants && (
                    <TouchableOpacity
                      style={styles.freeSlotActionBtn}
                      onPress={() => {
                        triggerHaptic('light');
                        onOpenRestaurants();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.freeSlotActionText}>🍽️ Restaurantes ›</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  pacingBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pacingText: {
    ...Typography.captionBold,
    fontSize: 12.5,
  },
  weekStripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
  },
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radii.md,
    minWidth: 40,
  },
  dayColumnSelected: {
    backgroundColor: Colors.light.primary,
    ...Shadows.sm,
  },
  dayColumnToday: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  dayHeaderLetter: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  dayHeaderNumber: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  textInverse: {
    color: '#FFFFFF',
  },
  dotContainer: {
    height: 6,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
  daysStreamContainer: {
    gap: Spacing.md,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  dayCardActive: {
    borderColor: Colors.light.primary,
    borderWidth: 1.5,
    ...Shadows.sm,
  },
  dayCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.04)',
  },
  dayTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dayCardName: {
    ...Typography.bodyMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.light.text,
  },
  todayPill: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: Radii.full,
  },
  todayPillText: {
    ...Typography.captionBold,
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  addMiniBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
  },
  addMiniBtnText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.primary,
  },
  eventsGroup: {
    gap: Spacing.xs,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: Radii.lg,
    padding: Spacing.sm + 2,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  eventItemSurprise: {
    backgroundColor: 'rgba(232, 106, 88, 0.06)',
    borderLeftColor: '#E86A58',
  },
  eventLeftBlock: {
    width: 48,
    marginRight: Spacing.xs,
  },
  eventTimeText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.text,
  },
  eventInfoBlock: {
    flex: 1,
  },
  eventBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  eventLocationText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
    flex: 1,
  },
  eventTitleText: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.light.text,
  },
  eventSubtitleText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
  },
  freeSlotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  freeSlotEmoji: {
    fontSize: 18,
    color: Colors.light.primary,
    marginRight: Spacing.sm,
  },
  freeSlotTextGroup: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  freeSlotTitle: {
    ...Typography.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  freeSlotDesc: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
    lineHeight: 14,
  },
  freeSlotActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  freeSlotActionText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: '#B08820',
  },
});
