import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDev } from '../../../context/DevContext';
import { useCalendarState } from '../state/useCalendarStore';
import { sanitizeCoupleEvents, groupEventsByDate } from '../domain/calendar.selectors';
import { RomanticIdea, SurpriseCreationPayload } from '../domain/calendar.types';
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
import { Spacing } from '../../../theme/tokens';

export function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const {
    coupleEvents,
    currentDevUser,
    partnerDevUser,
    addCoupleEvent,
    revealCoupleEvent,
    completeCoupleEvent,
  } = useDev();

  const store = useCalendarState();

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

  // 4. Find active selected event for detail sheet
  const selectedEvent = useMemo(() => {
    if (!store.selectedEventId) return null;
    return sanitizedEvents.find((e) => e.id === store.selectedEventId) || null;
  }, [sanitizedEvents, store.selectedEventId]);

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
      {/* 1. Header with Month switcher & + Action */}
      <CalendarHeader
        year={store.currentYear}
        monthIndex={store.currentMonthIndex}
        onPrevMonth={store.prevMonth}
        onNextMonth={store.nextMonth}
        onAddNewEvent={() => store.setIsSurpriseSelectorOpen(true)}
      />

      {/* 2. Monthly Grid Matrix with Event Badges */}
      <CalendarMonthGrid
        year={store.currentYear}
        monthIndex={store.currentMonthIndex}
        selectedDate={store.selectedDate}
        onSelectDate={store.setSelectedDate}
        eventsByDate={eventsByDate}
      />

      {/* 3. Daily Schedule Agenda */}
      <DayAgendaView
        selectedDate={store.selectedDate}
        events={eventsForSelectedDate}
        onSelectEvent={(ev) => store.setSelectedEventId(ev.id)}
        onAddNewPlan={() => store.setIsSurpriseSelectorOpen(true)}
      />

      {/* 4. Activable Modes & Ideas Module ("Ideas para vosotros") */}
      <ActivableModesModule
        onTriggerIdea={handleTriggerIdea}
        onOpenAllIdeas={() => store.setIsIdeasSheetOpen(true)}
      />

      {/* Modals & Bottom Sheets */}
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
});
