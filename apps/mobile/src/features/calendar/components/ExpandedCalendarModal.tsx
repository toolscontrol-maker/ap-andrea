import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarViewMode, SanitizedEventItem, TimelineItem } from '../domain/calendar.types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';
import { DayScheduleView } from './DayScheduleView';
import { WeekPlannerView } from './WeekPlannerView';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { OurStoryTimelineView } from './OurStoryTimelineView';
import { DayAgendaView } from './DayAgendaView';
import { MONTH_NAMES_ES } from '../utils/calendarDateUtils';

interface ExpandedCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  activeMode: CalendarViewMode;
  onChangeMode: (mode: CalendarViewMode) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  year: number;
  monthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  eventsByDate: Record<string, SanitizedEventItem[]>;
  timelineItems: TimelineItem[];
  daysTogether: number;
  daysSinceMet: number;
  partnerName: string;
  onSelectEvent: (event: SanitizedEventItem) => void;
  onAddNewPlanForDate: (date: string) => void;
  onOpenUniversalCreate: () => void;
  onOpenRestaurants?: () => void;
}

const MODES: { id: CalendarViewMode; label: string; icon: string }[] = [
  { id: 'day', label: 'Hoy', icon: '☼' },
  { id: 'week', label: 'Semana', icon: '▦' },
  { id: 'month', label: 'Mes', icon: '🗓️' },
  { id: 'history', label: 'Nuestra Historia', icon: '✦' },
];

export function ExpandedCalendarModal({
  visible,
  onClose,
  activeMode,
  onChangeMode,
  selectedDate,
  onSelectDate,
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  eventsByDate,
  timelineItems,
  daysTogether,
  daysSinceMet,
  partnerName,
  onSelectEvent,
  onAddNewPlanForDate,
  onOpenUniversalCreate,
  onOpenRestaurants,
}: ExpandedCalendarModalProps) {
  const insets = useSafeAreaInsets();

  const eventsForSelectedDate = useMemo(() => {
    return eventsByDate[selectedDate] || [];
  }, [eventsByDate, selectedDate]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Top Navigation Bar */}
        <View style={styles.topNavBar}>
          <TouchableOpacity
            style={styles.navBackBtn}
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.navBackText}>‹ Volver</Text>
          </TouchableOpacity>

          {/* Month Title with Prev/Next Controls */}
          <View style={styles.navTitleCenter}>
            <TouchableOpacity
              style={styles.monthArrowMini}
              onPress={() => {
                triggerHaptic('light');
                onPrevMonth();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.arrowMiniText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.monthTitleText}>
              {MONTH_NAMES_ES[monthIndex]} {year}
            </Text>

            <TouchableOpacity
              style={styles.monthArrowMini}
              onPress={() => {
                triggerHaptic('light');
                onNextMonth();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.arrowMiniText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Universal + Action Button */}
          <TouchableOpacity
            style={styles.navActionPlusBtn}
            onPress={() => {
              triggerHaptic('medium');
              onOpenUniversalCreate();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.navActionPlusText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* 4-Way Segmented Control */}
        <View style={styles.segmentedWrapper}>
          <View style={styles.segmentedContainer}>
            {MODES.map((m) => {
              const isActive = activeMode === m.id;

              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.segmentTab,
                    isActive && styles.segmentTabActive,
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    onChangeMode(m.id);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.segmentTabText,
                      isActive && styles.segmentTabTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Mode Content Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 40, 60) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {activeMode === 'day' && (
            <DayScheduleView
              selectedDate={selectedDate}
              events={eventsForSelectedDate}
              partnerName={partnerName}
              onSelectEvent={onSelectEvent}
              onAddNewPlan={() => onAddNewPlanForDate(selectedDate)}
              onOpenRestaurants={onOpenRestaurants}
            />
          )}

          {activeMode === 'week' && (
            <WeekPlannerView
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              eventsByDate={eventsByDate}
              onSelectEvent={onSelectEvent}
              onAddNewPlanForDate={onAddNewPlanForDate}
              onOpenRestaurants={onOpenRestaurants}
            />
          )}

          {activeMode === 'month' && (
            <View style={{ gap: Spacing.lg }}>
              <CalendarMonthGrid
                year={year}
                monthIndex={monthIndex}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                eventsByDate={eventsByDate}
              />
              <DayAgendaView
                selectedDate={selectedDate}
                events={eventsForSelectedDate}
                onSelectEvent={onSelectEvent}
                onAddNewPlan={() => onAddNewPlanForDate(selectedDate)}
              />
            </View>
          )}

          {activeMode === 'history' && (
            <OurStoryTimelineView
              timelineItems={timelineItems}
              daysTogether={daysTogether}
              daysSinceMet={daysSinceMet}
              partnerName={partnerName}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.05)',
  },
  navBackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(20, 19, 18, 0.04)',
  },
  navBackText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  navTitleCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthArrowMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 19, 18, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowMiniText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    fontWeight: '700',
  },
  monthTitleText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    paddingHorizontal: 4,
  },
  navActionPlusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  navActionPlusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: -1,
  },
  segmentedWrapper: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 19, 18, 0.06)',
    borderRadius: Radii.lg,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  segmentTabText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.textMuted,
  },
  segmentTabTextActive: {
    color: Colors.light.text,
    fontWeight: '800',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
});
