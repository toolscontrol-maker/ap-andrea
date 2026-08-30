import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MONTH_NAMES_ES } from '../utils/calendarDateUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';

interface CalendarHeaderProps {
  year: number;
  monthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddNewEvent: () => void;
  compactMode?: 'month' | 'agenda';
  onChangeCompactMode?: (mode: 'month' | 'agenda') => void;
  onExpand?: () => void;
  onJumpToToday?: () => void;
}

export function CalendarHeader({
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  onAddNewEvent,
  compactMode = 'month',
  onChangeCompactMode,
  onExpand,
  onJumpToToday,
}: CalendarHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Top Row: Month Navigation & Universal + */}
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

          <TouchableOpacity
            style={styles.monthBadge}
            onPress={() => {
              triggerHaptic('light');
              onJumpToToday && onJumpToToday();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.monthTitle}>
              {MONTH_NAMES_ES[monthIndex]} {year}
            </Text>
          </TouchableOpacity>

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

        {/* Primary Circular Add Button */}
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

      {/* Sub-Header Control Bar: [Mes] [Agenda]  ⛶ Expandir */}
      <View style={styles.subControlRow}>
        {/* Mode Selector Pill */}
        {onChangeCompactMode && (
          <View style={styles.modeTogglePill}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                compactMode === 'month' && styles.modeTabActive,
              ]}
              onPress={() => {
                triggerHaptic('selection');
                onChangeCompactMode('month');
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.modeTabText,
                  compactMode === 'month' && styles.modeTabTextActive,
                ]}
              >
                Mes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                compactMode === 'agenda' && styles.modeTabActive,
              ]}
              onPress={() => {
                triggerHaptic('selection');
                onChangeCompactMode('agenda');
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.modeTabText,
                  compactMode === 'agenda' && styles.modeTabTextActive,
                ]}
              >
                Agenda
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Expand Experience Button */}
        {onExpand && (
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => {
              triggerHaptic('medium');
              onExpand();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.expandIcon}>⛶</Text>
            <Text style={styles.expandText}>Expandir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingRight: 48,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  arrowText: {
    ...Typography.bodyMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: -2,
  },
  monthBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    ...Shadows.subtle,
  },
  monthTitle: {
    ...Typography.h2,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: -1,
  },
  subControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  modeTogglePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 19, 18, 0.05)',
    borderRadius: Radii.full,
    padding: 2.5,
  },
  modeTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  modeTabText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  modeTabTextActive: {
    color: Colors.light.text,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    ...Shadows.subtle,
  },
  expandIcon: {
    fontSize: 13,
    color: Colors.light.primary,
  },
  expandText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.primary,
  },
});
