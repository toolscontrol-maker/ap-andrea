import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SanitizedEventItem } from '../domain/calendar.types';
import { formatDateNice } from '../utils/calendarDateUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Badge } from '../../../components/ui';

interface DayAgendaViewProps {
  selectedDate: string;
  events: SanitizedEventItem[];
  onSelectEvent: (event: SanitizedEventItem) => void;
  onAddNewPlan: () => void;
}

export function DayAgendaView({
  selectedDate,
  events,
  onSelectEvent,
  onAddNewPlan,
}: DayAgendaViewProps) {
  const getBadgeProps = (ev: SanitizedEventItem) => {
    if (ev.eventType === 'surprise') {
      if (ev.isOwner) {
        return { variant: 'butter' as const, label: '🔒 Sorpresa secreta', color: '#E86A58' };
      }
      return { variant: 'butter' as const, label: '✨ Algo especial para ti', color: '#E86A58' };
    }
    if (ev.eventType === 'important_date') {
      return { variant: 'butter' as const, label: '💛 Fecha importante', color: '#CBA86A' };
    }
    if (ev.eventType === 'future_trip') {
      return { variant: 'mistBlue' as const, label: '✈️ Viaje', color: '#5C9F9A' };
    }
    if (ev.eventType === 'ritual') {
      return { variant: 'sage' as const, label: '🌿 Ritual', color: '#8A7BB5' };
    }
    return { variant: 'secondary' as const, label: '🍷 Plan juntos', color: '#4A7C9B' };
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateTitle}>{formatDateNice(selectedDate)}</Text>
          <Text style={styles.dateSub}>
            {events.length > 0
              ? `${events.length} ${events.length === 1 ? 'momento programado' : 'momentos programados'}`
              : 'Día libre. ¡Un momento perfecto para la calma o improvisar!'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addPlanBtn}
          onPress={() => {
            triggerHaptic('light');
            onAddNewPlan();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.addPlanText}>+ Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {events.length > 0 ? (
        <View style={styles.eventsList}>
          {events.map((ev) => {
            const badge = getBadgeProps(ev);

            return (
              <TouchableOpacity
                key={ev.id}
                style={[
                  styles.eventCard,
                  ev.eventType === 'surprise' && styles.eventCardSurprise,
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  onSelectEvent(ev);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.ribbon, { backgroundColor: badge.color }]} />

                <View style={styles.eventContent}>
                  {/* Top line with badge & time */}
                  <View style={styles.eventTopLine}>
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                    {ev.time ? (
                      <Text style={styles.eventTimeText}>⏰ {ev.time}</Text>
                    ) : null}
                  </View>

                  {/* Title */}
                  <Text style={styles.eventTitle}>{ev.title}</Text>

                  {/* Subtitle / Teaser */}
                  {ev.subtitle ? (
                    <Text style={styles.eventSubtitle}>{ev.subtitle}</Text>
                  ) : null}

                  {/* Location or Private note marker */}
                  {ev.locationName ? (
                    <Text style={styles.eventLocation}>📍 {ev.locationName}</Text>
                  ) : null}

                  {ev.isOwner && ev.notes && ev.notes.length > 0 ? (
                    <Text style={styles.privateNotesHint}>
                      🔒 {ev.notes.length} {ev.notes.length === 1 ? 'nota privada' : 'notas privadas'}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyText}>Sin planes marcados para este día.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateTitle: {
    ...Typography.h3,
    fontSize: 17,
    color: '#1E252B',
  },
  dateSub: {
    ...Typography.caption,
    color: '#66737C',
    marginTop: 2,
  },
  addPlanBtn: {
    backgroundColor: '#FDEEEB',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 88, 0.2)',
  },
  addPlanText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 12,
  },
  eventsList: {
    gap: Spacing.sm,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF6F0',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
    position: 'relative',
  },
  eventCardSurprise: {
    backgroundColor: '#FAF7FD',
    borderColor: 'rgba(232, 106, 88, 0.15)',
  },
  ribbon: {
    width: 5,
  },
  eventContent: {
    flex: 1,
    padding: Spacing.md,
  },
  eventTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  eventTimeText: {
    ...Typography.captionBold,
    color: '#66737C',
    fontSize: 11,
  },
  eventTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: '#1E252B',
    fontWeight: '800',
  },
  eventSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: '#66737C',
    marginTop: 2,
  },
  eventLocation: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: '#4A7C9B',
    marginTop: 4,
  },
  privateNotesHint: {
    ...Typography.caption,
    fontSize: 11,
    color: '#E86A58',
    marginTop: 4,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.caption,
    color: '#66737C',
    fontSize: 12,
  },
});
