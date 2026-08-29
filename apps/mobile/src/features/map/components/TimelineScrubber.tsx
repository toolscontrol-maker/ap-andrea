import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPlace } from '@andrea/types';
import { generateTimelineMilestones } from '../domain/map.timeline';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface TimelineScrubberProps {
  places: MapPlace[];
  timelineCursor: string | null;
  onCursorChange: (date: string | null) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function TimelineScrubber({
  places,
  timelineCursor,
  onCursorChange,
  isPlaying,
  onTogglePlay,
}: TimelineScrubberProps) {
  const insets = useSafeAreaInsets();
  const milestones = generateTimelineMilestones(places);
  if (milestones.length === 0) return null;

  const bottomOffset = Math.max(insets.bottom + 12, 16);
  const dates = milestones.map((m) => m.date);

  const currentIndex = timelineCursor
    ? dates.findIndex((d) => d === timelineCursor)
    : dates.length - 1;

  const safeIndex = currentIndex >= 0 ? currentIndex : dates.length - 1;
  const currentMilestone = milestones[safeIndex];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        const nextIdx = (safeIndex + 1) % dates.length;
        triggerHaptic('light');
        onCursorChange(dates[nextIdx]);
        if (nextIdx === dates.length - 1) {
          onTogglePlay();
        }
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, safeIndex, dates, onCursorChange, onTogglePlay]);

  const handlePrev = () => {
    if (safeIndex > 0) {
      triggerHaptic('selection');
      onCursorChange(dates[safeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (safeIndex < dates.length - 1) {
      triggerHaptic('selection');
      onCursorChange(dates[safeIndex + 1]);
    }
  };

  return (
    <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.card}>
        {/* Top: Milestone Story Narrative */}
        <View style={styles.narrativeRow}>
          <Text style={styles.dateBadge}>{currentMilestone?.formattedDate}</Text>
          <Text style={styles.narrativeText} numberOfLines={1}>
            {currentMilestone?.narrativeText}
          </Text>
        </View>

        {/* Bottom: Timeline Slider Bar with 44pt Play button & Arrows */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              triggerHaptic('medium');
              onTogglePlay();
            }}
            activeOpacity={0.8}
            accessibilityLabel={isPlaying ? 'Pausar cronología' : 'Reproducir cronología'}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePrev}
            disabled={safeIndex === 0}
            style={styles.navTouchTarget}
            accessibilityLabel="Momento anterior"
          >
            <Text style={[styles.arrowText, safeIndex === 0 && styles.arrowDisabled]}>‹</Text>
          </TouchableOpacity>

          {/* Dots Indicator */}
          <View style={styles.dotsTrack}>
            {milestones.map((m, idx) => {
              const isPassed = idx <= safeIndex;
              const isCurrent = idx === safeIndex;
              return (
                <TouchableOpacity
                  key={m.date}
                  style={styles.dotTouchTarget}
                  onPress={() => {
                    triggerHaptic('selection');
                    onCursorChange(m.date);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dot,
                      isPassed && styles.dotPassed,
                      isCurrent && styles.dotCurrent,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            disabled={safeIndex === dates.length - 1}
            style={styles.navTouchTarget}
            accessibilityLabel="Siguiente momento"
          >
            <Text style={[styles.arrowText, safeIndex === dates.length - 1 && styles.arrowDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 25,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: Radii['2xl'],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 33, 41, 0.1)',
    ...Shadows.md,
  },
  narrativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 4,
  },
  dateBadge: {
    ...Typography.captionBold,
    fontSize: 10.5,
    color: '#E86A58',
    backgroundColor: '#FDEEEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  narrativeText: {
    flex: 1,
    ...Typography.caption,
    fontSize: 11.5,
    color: '#1E252B',
    fontStyle: 'italic',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E86A58',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  navTouchTarget: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E252B',
  },
  arrowDisabled: {
    color: '#D2CCD1',
  },
  dotsTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  dotTouchTarget: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E4DFE2',
  },
  dotPassed: {
    backgroundColor: '#E86A58',
  },
  dotCurrent: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#E86A58',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
