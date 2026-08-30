import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDev } from '../../../context/DevContext';
import { useCalendarState } from '../state/useCalendarStore';
import { sanitizeCoupleEvents, groupEventsByDate } from '../domain/calendar.selectors';
import { buildOurStoryTimeline } from '../domain/calendar.timeline';
import {
  CalendarViewMode,
  CompactViewMode,
  RomanticIdea,
  SurpriseCreationPayload,
  UniversalEventType,
} from '../domain/calendar.types';
import { RandomDateIdea } from '../domain/calendar.randomDate';
import { CalendarHeader } from './CalendarHeader';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { DayAgendaView } from './DayAgendaView';
import { ActivableModesModule } from './ActivableModesModule';
import { IdeasLibrarySheet } from './IdeasLibrarySheet';
import { SurpriseModeModal } from './SurpriseModeModal';
import { CreateSurpriseFlow } from './CreateSurpriseFlow';
import { RandomDateGeneratorModal } from './RandomDateGeneratorModal';
import { FutureLetterModal } from './FutureLetterModal';
import { EventDetailSheet } from './EventDetailSheet';
import { PostEventMemoryModal } from './PostEventMemoryModal';
import { UniversalCreateModal } from './UniversalCreateModal';
import { ExpandedCalendarModal } from './ExpandedCalendarModal';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';
import { Badge } from '../../../components/ui/Badge';
import { formatDateNice } from '../utils/calendarDateUtils';

const RELATIONSHIP_START_DATE = '2025-02-15';
const RELATIONSHIP_MET_DATE = '2024-11-23';

export function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    coupleEvents,
    mapPlaces,
    wishes,
    entries,
    currentDevUser,
    partnerDevUser,
    addCoupleEvent,
    revealCoupleEvent,
    completeCoupleEvent,
  } = useDev();

  const store = useCalendarState();

  // Local state for 2-level architecture
  const [compactMode, setCompactMode] = useState<CompactViewMode>('month');
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const [expandedMode, setExpandedMode] = useState<CalendarViewMode>('week');
  const [isUniversalCreateOpen, setIsUniversalCreateOpen] = useState(false);

  // 1. Sanitize all couple events based on the active role (Anti-Spoiler)
  const sanitizedEvents = useMemo(() => {
    return sanitizeCoupleEvents(coupleEvents || [], currentDevUser.id);
  }, [coupleEvents, currentDevUser.id]);

  // 2. Group events by date
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(sanitizedEvents);
  }, [sanitizedEvents]);

  // 3. Events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return eventsByDate[store.selectedDate] || [];
  }, [eventsByDate, store.selectedDate]);

  // 4. Upcoming events (next 3 to 5 items)
  const upcomingEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sanitizedEvents
      .filter((ev) => ev.date >= todayStr && ev.status !== 'completed' && ev.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 4);
  }, [sanitizedEvents]);

  // 5. Timeline items for "Nuestra Historia"
  const timelineItems = useMemo(() => {
    return buildOurStoryTimeline({
      coupleEvents,
      mapPlaces,
      wishes,
      entries,
    });
  }, [coupleEvents, mapPlaces, wishes, entries]);

  // 6. Days together metrics
  const { daysTogether, daysSinceMet } = useMemo(() => {
    const today = new Date();
    const start = new Date(RELATIONSHIP_START_DATE);
    const met = new Date(RELATIONSHIP_MET_DATE);

    const diffStart = Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const diffMet = Math.max(0, Math.floor((today.getTime() - met.getTime()) / (1000 * 60 * 60 * 24)));

    return { daysTogether: diffStart, daysSinceMet: diffMet };
  }, []);

  // 7. Find active selected event for detail sheet
  const selectedEvent = useMemo(() => {
    if (!store.selectedEventId) return null;
    return sanitizedEvents.find((e) => e.id === store.selectedEventId) || null;
  }, [sanitizedEvents, store.selectedEventId]);

  // Handler for universal create menu options
  const handleUniversalCreateSelect = (option: UniversalEventType) => {
    setIsUniversalCreateOpen(false);

    switch (option) {
      case 'date':
        addCoupleEvent({
          eventType: 'shared_plan',
          date: store.selectedDate,
          time: '20:30',
          title: 'Cena romántica juntos',
          subtitle: 'Un momento para nosotros',
        });
        break;
      case 'restaurant':
        addCoupleEvent({
          eventType: 'shared_plan',
          date: store.selectedDate,
          time: '21:00',
          title: 'Reserva Restaurante',
          subtitle: 'Mesa guardada para una velada especial',
          location: 'Restaurante en Valencia',
        });
        break;
      case 'surprise':
        store.setIsCreateSurpriseFlowOpen(true);
        break;
      case 'trip':
        addCoupleEvent({
          eventType: 'future_trip',
          date: store.selectedDate,
          title: 'Escapada de fin de semana',
          subtitle: 'Desconexión y descubrir nuevos rincones juntos',
        });
        break;
      case 'wishlist':
        router.push('/(tabs)/wishes' as any);
        break;
      case 'important_date':
        addCoupleEvent({
          eventType: 'important_date',
          date: store.selectedDate,
          title: 'Fecha Especial',
          subtitle: 'Un día inolvidable para nosotros',
        });
        break;
      case 'memory':
        addCoupleEvent({
          eventType: 'ritual',
          date: store.selectedDate,
          time: '22:00',
          title: '🌿 Recuerdo del día',
          subtitle: 'Un momento vivido con el corazón',
        });
        break;
    }
  };

  // Handler for triggering ideas from module or library
  const handleTriggerIdea = (idea: RomanticIdea) => {
    if (idea.modeType === 'surprise') {
      store.setIsSurpriseSelectorOpen(true);
    } else if (idea.modeType === 'random_date') {
      store.setIsRandomDateModalOpen(true);
    } else if (idea.modeType === 'future_letter') {
      store.setIsFutureLetterModalOpen(true);
    } else if (idea.modeType === 'screen_free') {
      addCoupleEvent({
        eventType: 'ritual',
        date: store.selectedDate,
        time: '20:30',
        title: '🌙 Noche sin pantallas',
        subtitle: 'Cena con velas, música suave y conversación sin teléfonos.',
        location: 'En el salón',
      });
    } else if (idea.modeType === 'ritual') {
      addCoupleEvent({
        eventType: 'ritual',
        date: store.selectedDate,
        time: '19:00',
        title: '🌿 Ritual del domingo: Agradecer la semana',
        subtitle: '¿Qué ha sido lo mejor de nuestra semana juntos?',
        location: 'En el sofá con té caliente',
      });
    } else {
      addCoupleEvent({
        eventType: 'shared_plan',
        date: store.selectedDate,
        time: '20:00',
        title: idea.title,
        subtitle: idea.subtitle,
      });
    }
  };

  // Handler for saving surprise from flow
  const handleSaveSurprise = (payload: SurpriseCreationPayload) => {
    addCoupleEvent({
      eventType: 'surprise',
      surpriseCategory: payload.category,
      date: payload.date,
      time: payload.time,
      title: payload.title,
      location: payload.location,
      notes: payload.notes,
      revealPolicy: payload.revealOption === 'now' ? 'immediately' : 'scheduled',
      revealAt: payload.revealOption === 'one_day_before'
        ? `${payload.date}T00:00:00`
        : undefined,
      visibility: 'private_until_reveal',
      partnerTeaserTitle: payload.visibilityPreset === 'total_secret'
        ? 'Sorpresa secreta'
        : 'Plan especial',
      partnerTeaserSubtitle: payload.visibilityPreset === 'visible_plan'
        ? `Plan el ${payload.date} preparado con cariño.`
        : 'Prepárate para un momento bonito juntos.',
    });
  };

  // Handler for saving random date idea
  const handleSaveRandomDate = (idea: RandomDateIdea) => {
    addCoupleEvent({
      eventType: 'shared_plan',
      date: store.selectedDate,
      time: idea.suggestedTime,
      title: idea.title,
      subtitle: idea.description,
      location: idea.setting === 'interior' ? 'Lugar acogedor' : 'Al aire libre',
    });
  };

  // Handler for saving future letter
  const handleSaveFutureLetter = (letter: { unlockDate: string; title: string; message: string }) => {
    addCoupleEvent({
      eventType: 'important_date',
      date: letter.unlockDate,
      title: letter.title,
      subtitle: letter.message,
      revealPolicy: 'scheduled',
      revealAt: `${letter.unlockDate}T00:00:00`,
    });
  };

  const topPadding = Math.max(insets.top + 8, 16);
  const bottomPadding = Math.max(insets.bottom + 80, 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 0. Romantic Dynamic Island Capsule */}
      <TouchableOpacity
        style={styles.dynamicIslandCapsule}
        onPress={() => {
          triggerHaptic('light');
          setExpandedMode('history');
          setIsExpandedModalOpen(true);
        }}
        activeOpacity={0.85}
      >
        <View style={styles.islandPulseDot} />
        <Text style={styles.islandText}>
          <Text style={styles.islandBold}>Andrea & Tonet</Text> · 💕 {daysTogether} días juntos · ✦ {upcomingEvents.length} planes
        </Text>
      </TouchableOpacity>

      {/* 1. Header with Month switcher, [Mes]/[Agenda] toggle, and [⛶ Expandir] */}
      <CalendarHeader
        year={store.currentYear}
        monthIndex={store.currentMonthIndex}
        onPrevMonth={store.prevMonth}
        onNextMonth={store.nextMonth}
        onAddNewEvent={() => setIsUniversalCreateOpen(true)}
        compactMode={compactMode}
        onChangeCompactMode={setCompactMode}
        onExpand={() => {
          setExpandedMode('week');
          setIsExpandedModalOpen(true);
        }}
        onJumpToToday={() => {
          const today = new Date();
          store.setSelectedDate(today.toISOString().split('T')[0]);
        }}
      />

      {/* 2. Compact View Body: Month Grid or Agenda Stream */}
      {compactMode === 'month' ? (
        <CalendarMonthGrid
          year={store.currentYear}
          monthIndex={store.currentMonthIndex}
          selectedDate={store.selectedDate}
          onSelectDate={store.setSelectedDate}
          eventsByDate={eventsByDate}
        />
      ) : null}

      {/* 3. Selected Day Card with Warm Positive State & Actions */}
      <DayAgendaView
        selectedDate={store.selectedDate}
        events={eventsForSelectedDate}
        onSelectEvent={(ev) => store.setSelectedEventId(ev.id)}
        onAddNewPlan={() => setIsUniversalCreateOpen(true)}
        onOpenRestaurants={() => {
          router.push('/(tabs)/map' as any);
        }}
      />

      {/* 4. Próximamente (Next 3-5 Upcoming Plans / Surprises) */}
      {upcomingEvents.length > 0 && (
        <View style={styles.upcomingBlock}>
          <View style={styles.upcomingHeaderRow}>
            <Text style={styles.upcomingTitle}>Próximamente</Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                setExpandedMode('history');
                setIsExpandedModalOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.upcomingSeeAllText}>Nuestra Historia ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.upcomingList}>
            {upcomingEvents.map((ev) => {
              const isSurprise = ev.eventType === 'surprise';
              const isTrip = ev.eventType === 'future_trip';
              const isImportant = ev.eventType === 'important_date';

              const iconEmoji = isSurprise ? '✦' : isTrip ? '✈️' : isImportant ? '✨' : '🍽️';
              const accentColor = isSurprise ? '#E86A58' : isTrip ? '#5C9F9A' : isImportant ? '#D4AF37' : '#E05666';

              return (
                <TouchableOpacity
                  key={ev.id}
                  style={[
                    styles.upcomingCard,
                    { borderLeftColor: accentColor, borderLeftWidth: 3.5 },
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    store.setSelectedEventId(ev.id);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.upcomingIconCircle,
                      { backgroundColor: `${accentColor}18` },
                    ]}
                  >
                    <Text style={styles.upcomingIconEmoji}>{iconEmoji}</Text>
                  </View>

                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingItemTitle} numberOfLines={1}>
                      {ev.title}
                    </Text>
                    <Text style={styles.upcomingItemDate}>
                      {formatDateNice(ev.date)} {ev.time ? `· ${ev.time}` : ''}
                    </Text>
                  </View>

                  <Badge
                    variant={
                      isSurprise
                        ? 'secondary'
                        : isTrip
                        ? 'mistBlue'
                        : isImportant
                        ? 'butter'
                        : 'primary'
                    }
                    size="sm"
                  >
                    {isSurprise ? 'Sorpresa' : isTrip ? 'Viaje' : isImportant ? 'Especial' : 'Plan'}
                  </Badge>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* 5. Activable Modes & Suggestions (At bottom, non-dominant) */}
      <ActivableModesModule
        onTriggerIdea={handleTriggerIdea}
        onOpenAllIdeas={() => store.setIsIdeasSheetOpen(true)}
      />

      {/* --- Modals & Level 2 Expanded Experience --- */}

      {/* Universal Contextual + Creation Modal */}
      <UniversalCreateModal
        visible={isUniversalCreateOpen}
        onClose={() => setIsUniversalCreateOpen(false)}
        onSelectOption={handleUniversalCreateSelect}
        selectedDate={store.selectedDate}
        partnerName={partnerDevUser.name}
      />

      {/* Level 2: Expanded Suite (Hoy, Semana, Mes, Nuestra Historia) */}
      <ExpandedCalendarModal
        visible={isExpandedModalOpen}
        onClose={() => setIsExpandedModalOpen(false)}
        activeMode={expandedMode}
        onChangeMode={setExpandedMode}
        selectedDate={store.selectedDate}
        onSelectDate={store.setSelectedDate}
        year={store.currentYear}
        monthIndex={store.currentMonthIndex}
        onPrevMonth={store.prevMonth}
        onNextMonth={store.nextMonth}
        eventsByDate={eventsByDate}
        timelineItems={timelineItems}
        daysTogether={daysTogether}
        daysSinceMet={daysSinceMet}
        partnerName={partnerDevUser.name}
        onSelectEvent={(ev) => {
          setIsExpandedModalOpen(false);
          store.setSelectedEventId(ev.id);
        }}
        onAddNewPlanForDate={(date) => {
          store.setSelectedDate(date);
          setIsUniversalCreateOpen(true);
        }}
        onOpenUniversalCreate={() => setIsUniversalCreateOpen(true)}
        onOpenRestaurants={() => {
          setIsExpandedModalOpen(false);
          router.push('/(tabs)/map' as any);
        }}
      />

      {/* Sub-modals */}
      <IdeasLibrarySheet
        visible={store.isIdeasSheetOpen}
        onClose={() => store.setIsIdeasSheetOpen(false)}
        onSelectIdea={handleTriggerIdea}
      />

      <SurpriseModeModal
        visible={store.isSurpriseSelectorOpen}
        onClose={() => store.setIsSurpriseSelectorOpen(false)}
        onSelectMode={(mode) => {
          store.setIsSurpriseSelectorOpen(false);
          store.setIsCreateSurpriseFlowOpen(true);
        }}
        partnerName={partnerDevUser.name}
      />

      <CreateSurpriseFlow
        visible={store.isCreateSurpriseFlowOpen}
        onClose={() => store.setIsCreateSurpriseFlowOpen(false)}
        onSuccess={handleSaveSurprise}
      />

      <RandomDateGeneratorModal
        visible={store.isRandomDateModalOpen}
        onClose={() => store.setIsRandomDateModalOpen(false)}
        onSaveAsPlan={handleSaveRandomDate}
      />

      <FutureLetterModal
        visible={store.isFutureLetterModalOpen}
        onClose={() => store.setIsFutureLetterModalOpen(false)}
        onSaveLetter={handleSaveFutureLetter}
      />

      <EventDetailSheet
        visible={!!store.selectedEventId}
        event={selectedEvent}
        onClose={() => store.setSelectedEventId(null)}
        onRevealNow={(eventId) => {
          revealCoupleEvent(eventId);
        }}
        onCompletePlan={(ev) => {
          completeCoupleEvent(ev.id);
          store.setCompletedEventForMemory(ev);
        }}
        partnerName={partnerDevUser.name}
      />

      <PostEventMemoryModal
        visible={!!store.completedEventForMemory}
        event={store.completedEventForMemory}
        onClose={() => store.setCompletedEventForMemory(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  content: {
    paddingHorizontal: Spacing.md,
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
  },
  dynamicIslandCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    marginBottom: Spacing.sm,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.2)',
    ...Shadows.subtle,
  },
  islandPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E05666',
    marginRight: 7,
  },
  islandText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.text,
  },
  islandBold: {
    fontWeight: '800',
    color: Colors.light.primary,
  },
  upcomingBlock: {
    marginBottom: Spacing.lg,
  },
  upcomingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  upcomingTitle: {
    ...Typography.h2,
    fontSize: 16,
    color: Colors.light.text,
  },
  upcomingSeeAllText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.primary,
  },
  upcomingList: {
    gap: Spacing.xs,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  upcomingCardSurprise: {
    backgroundColor: '#FAF8F5',
    borderColor: 'rgba(232, 106, 88, 0.15)',
  },
  upcomingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  upcomingIconEmoji: {
    fontSize: 16,
  },
  upcomingInfo: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  upcomingItemTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 1,
  },
  upcomingItemDate: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
  },
});

