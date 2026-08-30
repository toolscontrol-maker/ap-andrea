import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SanitizedEventItem } from '../domain/calendar.types';
import { formatDateNice } from '../utils/calendarDateUtils';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';
import { Badge } from '../../../components/ui/Badge';

interface DayScheduleViewProps {
  selectedDate: string;
  events: SanitizedEventItem[];
  partnerName: string;
  onSelectEvent: (event: SanitizedEventItem) => void;
  onAddNewPlan: () => void;
  onOpenRestaurants?: () => void;
}

export function DayScheduleView({
  selectedDate,
  events,
  partnerName,
  onSelectEvent,
  onAddNewPlan,
  onOpenRestaurants,
}: DayScheduleViewProps) {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Separate timed vs all-day events
  const timedEvents = events.filter((e) => !!e.time).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const allDayEvents = events.filter((e) => !e.time);

  return (
    <View style={styles.container}>
      {/* Day Hero Header */}
      <View style={styles.dayHeroCard}>
        <View style={styles.dayHeroHeaderRow}>
          <Text style={styles.dayHeroDateText}>{formatDateNice(selectedDate)}</Text>
          {isToday && (
            <View style={styles.todayTag}>
              <Text style={styles.todayTagText}>Hoy</Text>
            </View>
          )}
        </View>

        <Text style={styles.dayHeroQuoteText}>
          {events.length > 0
            ? '“Un día bonito para seguir construyendo juntos.”'
            : '“Un momento perfecto para la calma, una mirada cómplice o improvisar.”'}
        </Text>
      </View>

      {/* Daily Connection Seed / Ritual */}
      <View style={styles.ritualCard}>
        <View style={styles.ritualHeaderRow}>
          <View style={styles.ritualBadge}>
            <Text style={styles.ritualBadgeText}>🌱 Semilla de Conexión</Text>
          </View>
          <Text style={styles.ritualTimeText}>Ritual Diario</Text>
        </View>
        <Text style={styles.ritualPromptText}>
          ¿Qué pequeño detalle de {partnerName} te ha hecho sonreír hoy?
        </Text>
        <Text style={styles.ritualHintText}>
          Sin rachas ni obligaciones: un pequeño instante para alimentar vuestra historia.
        </Text>
      </View>

      {/* All-Day Events */}
      {allDayEvents.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Todo el día</Text>
          <View style={styles.eventsList}>
            {allDayEvents.map((ev) => (
              <TouchableOpacity
                key={ev.id}
                style={[
                  styles.eventRowCard,
                  ev.eventType === 'surprise' && styles.eventRowSurprise,
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  onSelectEvent(ev);
                }}
                activeOpacity={0.75}
              >
                <View style={styles.eventRowContent}>
                  <View style={styles.eventRowBadgeRow}>
                    <Badge variant={ev.eventType === 'surprise' ? 'secondary' : 'primary'}>
                      {ev.eventType === 'surprise' ? '✦ Sorpresa' : 'Momento'}
                    </Badge>
                    {ev.locationName && (
                      <Text style={styles.locationText} numberOfLines={1}>
                        📍 {ev.locationName}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.eventRowTitle}>{ev.title}</Text>
                  {ev.subtitle && (
                    <Text style={styles.eventRowSubtitle}>{ev.subtitle}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Timed Schedule Stream */}
      {timedEvents.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Horas & Citas programadas</Text>
          <View style={styles.timelineSchedule}>
            {timedEvents.map((ev, idx) => (
              <View key={ev.id} style={styles.scheduleRow}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{ev.time}</Text>
                  <View style={styles.timeLineDot} />
                  {idx < timedEvents.length - 1 && <View style={styles.timeVerticalLine} />}
                </View>

                {/* Event Card */}
                <TouchableOpacity
                  style={[
                    styles.scheduleCard,
                    ev.eventType === 'surprise' && styles.scheduleCardSurprise,
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    onSelectEvent(ev);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.eventRowBadgeRow}>
                    <Badge
                      variant={
                        ev.eventType === 'surprise'
                          ? 'secondary'
                          : ev.eventType === 'important_date'
                          ? 'butter'
                          : 'primary'
                      }
                    >
                      {ev.eventType === 'surprise'
                        ? '✦ Sorpresa'
                        : ev.eventType === 'important_date'
                        ? 'Aniversario'
                        : 'Plan juntos'}
                    </Badge>
                    {ev.locationName && (
                      <Text style={styles.locationText} numberOfLines={1}>
                        📍 {ev.locationName}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.scheduleTitle}>{ev.title}</Text>
                  {ev.subtitle && (
                    <Text style={styles.scheduleSubtitle}>{ev.subtitle}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : allDayEvents.length === 0 ? (
        <View style={styles.emptyDayCard}>
          <Text style={styles.emptyDayEmoji}>🍃</Text>
          <Text style={styles.emptyDayTitle}>Sin planes para este día</Text>
          <Text style={styles.emptyDayDesc}>
            No tenéis nada marcado en la agenda todavía. ¿Os apetece dejar hueco para algo bonito?
          </Text>

          <View style={styles.emptyDayActionsRow}>
            <TouchableOpacity
              style={styles.emptyPrimaryBtn}
              onPress={() => {
                triggerHaptic('light');
                onAddNewPlan();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyPrimaryBtnText}>+ Crear un plan</Text>
            </TouchableOpacity>

            {onOpenRestaurants && (
              <TouchableOpacity
                style={styles.emptySecondaryBtn}
                onPress={() => {
                  triggerHaptic('light');
                  onOpenRestaurants();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.emptySecondaryBtnText}>🍽️ Ver restaurantes</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : null}

      {/* Universal Quick Add Button */}
      <TouchableOpacity
        style={styles.addFullDayBtn}
        onPress={() => {
          triggerHaptic('light');
          onAddNewPlan();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.addFullDayBtnText}>+ Añadir algo a nuestro día</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  dayHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
  },
  dayHeroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayHeroDateText: {
    ...Typography.h2,
    fontSize: 17.5,
    color: Colors.light.text,
  },
  todayTag: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  todayTagText: {
    ...Typography.captionBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  dayHeroQuoteText: {
    ...Typography.body,
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.light.textMuted,
  },
  ritualCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(109, 158, 123, 0.2)',
  },
  ritualHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  ritualBadge: {
    backgroundColor: 'rgba(109, 158, 123, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  ritualBadgeText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: '#4E7A5A',
  },
  ritualTimeText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  ritualPromptText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
    lineHeight: 19,
  },
  ritualHintText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    lineHeight: 15,
  },
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  eventsList: {
    gap: Spacing.sm,
  },
  eventRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderLeftWidth: 3.5,
    borderLeftColor: Colors.light.primary,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  eventRowSurprise: {
    borderLeftColor: '#E86A58',
    backgroundColor: 'rgba(232, 106, 88, 0.04)',
  },
  eventRowContent: {
    flex: 1,
  },
  eventRowBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  locationText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
    flex: 1,
  },
  eventRowTitle: {
    ...Typography.bodyMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  eventRowSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  timelineSchedule: {
    gap: Spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
    marginRight: Spacing.sm,
  },
  timeText: {
    ...Typography.captionBold,
    fontSize: 13,
    color: Colors.light.text,
    marginBottom: 4,
  },
  timeLineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  timeVerticalLine: {
    position: 'absolute',
    top: 26,
    bottom: -15,
    width: 2,
    backgroundColor: 'rgba(224, 86, 102, 0.25)',
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.subtle,
  },
  scheduleCardSurprise: {
    backgroundColor: 'rgba(232, 106, 88, 0.04)',
    borderColor: 'rgba(232, 106, 88, 0.2)',
  },
  scheduleTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  scheduleSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  emptyDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.subtle,
  },
  emptyDayEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  emptyDayTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  emptyDayDesc: {
    ...Typography.caption,
    fontSize: 12.5,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: Spacing.md,
    maxWidth: 280,
  },
  emptyDayActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  emptyPrimaryBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  emptyPrimaryBtnText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptySecondaryBtn: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
  },
  emptySecondaryBtnText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.text,
  },
  addFullDayBtn: {
    marginTop: Spacing.sm,
    backgroundColor: '#FAF8F5',
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.3)',
    borderStyle: 'dashed',
  },
  addFullDayBtnText: {
    ...Typography.captionBold,
    fontSize: 13,
    color: Colors.light.primary,
  },
});
