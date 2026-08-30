import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SanitizedEventItem } from '../domain/calendar.types';
import { formatDateNice } from '../utils/calendarDateUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { Badge } from '../../../components/ui';

interface DayAgendaViewProps {
  selectedDate: string;
  events: SanitizedEventItem[];
  onSelectEvent: (event: SanitizedEventItem) => void;
  onAddNewPlan: () => void;
  onOpenRestaurants?: () => void;
}

export function DayAgendaView({
  selectedDate,
  events,
  onSelectEvent,
  onAddNewPlan,
  onOpenRestaurants,
}: DayAgendaViewProps) {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const getBadgeProps = (ev: SanitizedEventItem) => {
    if (ev.eventType === 'surprise') {
      if (ev.isOwner) {
        return { variant: 'butter' as const, label: '✦ Sorpresa', color: '#E86A58' };
      }
      return { variant: 'butter' as const, label: '✦ Plan especial para ti', color: '#E86A58' };
    }
    if (ev.eventType === 'important_date') {
      return { variant: 'butter' as const, label: 'Fecha importante', color: '#D4AF37' };
    }
    if (ev.eventType === 'future_trip') {
      return { variant: 'mistBlue' as const, label: 'Viaje', color: '#5C9F9A' };
    }
    if (ev.eventType === 'ritual') {
      return { variant: 'sage' as const, label: 'Ritual', color: '#6D9E7B' };
    }
    return { variant: 'secondary' as const, label: 'Plan juntos', color: '#E05666' };
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            {isToday && <Text style={styles.todayPrefix}>Hoy · </Text>}
            <Text style={styles.dateTitle}>{formatDateNice(selectedDate)}</Text>
          </View>
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
          <Text style={styles.emptyEmoji}>🍃</Text>
          <Text style={styles.emptyTitle}>No tenéis nada planeado todavía</Text>
          <Text style={styles.emptyText}>
            ¿Os apetece dejar hueco para algo bonito o guardar un sitio que tengáis ganas?
          </Text>

          <View style={styles.emptyButtonsRow}>
            <TouchableOpacity
              style={styles.emptyActionPrimary}
              onPress={() => {
                triggerHaptic('light');
                onAddNewPlan();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyActionPrimaryText}>+ Crear un plan</Text>
            </TouchableOpacity>

            {onOpenRestaurants && (
              <TouchableOpacity
                style={styles.emptyActionSecondary}
                onPress={() => {
                  triggerHaptic('light');
                  onOpenRestaurants();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionSecondaryText}>🍽️ Ver restaurantes</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  todayPrefix: {
    ...Typography.captionBold,
    fontSize: 14.5,
    color: Colors.light.primary,
  },
  dateTitle: {
    ...Typography.h2,
    fontSize: 16,
    color: Colors.light.text,
  },
  dateSub: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  addPlanBtn: {
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  addPlanText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.primary,
  },
  eventsList: {
    gap: Spacing.sm,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
  },
  eventCardSurprise: {
    backgroundColor: 'rgba(232, 106, 88, 0.05)',
  },
  ribbon: {
    width: 4,
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
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  eventTitle: {
    ...Typography.bodyMedium,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  eventSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textMuted,
    lineHeight: 16,
  },
  eventLocation: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  privateNotesHint: {
    ...Typography.caption,
    fontSize: 11,
    color: '#D4AF37',
    marginTop: 4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  emptyText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
    maxWidth: 290,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  emptyActionPrimary: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.md,
    ...Shadows.subtle,
  },
  emptyActionPrimaryText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyActionSecondary: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
  },
  emptyActionSecondaryText: {
    color: Colors.light.text,
  },
});
