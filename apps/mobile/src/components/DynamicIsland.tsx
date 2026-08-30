import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { useDev } from '../context/DevContext';
import { Colors } from '../theme/colors';
import { Radii, Shadows, Spacing } from '../theme/tokens';
import { IconGift, IconSparkles } from './ui/Icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type IslandMode = 'idle' | 'surprise' | 'question' | 'seed';

export function DynamicIsland() {
  const {
    currentDevUser,
    partnerDevUser,
    coupleEvents,
    ritualSeeds
  } = useDev();

  const [mode, setMode] = useState<IslandMode>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if there is an active surprise or scheduled event
  const activeSurprise = coupleEvents.find(
    (e) => e.eventType === 'surprise' && e.status === 'scheduled'
  );

  useEffect(() => {
    if (activeSurprise) {
      setMode('surprise');
    } else if (ritualSeeds.length > 0) {
      setMode('idle');
    }
  }, [activeSurprise, ritualSeeds.length]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsExpanded((prev) => !prev);
  };

  const isOwnerOfSurprise = activeSurprise?.ownerId === currentDevUser.id;

  return (
    <View style={styles.islandWrapper}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={toggleExpand}
        style={[
          styles.islandPill,
          isExpanded ? styles.islandPillExpanded : styles.islandPillCompact
        ]}
      >
        {/* COMPACT VIEW */}
        {!isExpanded && (
          <View style={styles.compactRow}>
            {/* Pulsing Dots for Ángel & Andrea */}
            <View style={styles.dotsGroup}>
              <View style={[styles.statusDot, { backgroundColor: Colors.light.primary }]} />
              <View style={styles.connectingLine} />
              <View style={[styles.statusDot, { backgroundColor: Colors.light.secondary }]} />
            </View>

            {mode === 'surprise' && activeSurprise && (
              <View style={styles.compactMessageRow}>
                <IconGift size={13} color="#FFB8A8" strokeWidth={2} />
                <Text style={styles.compactText} numberOfLines={1}>
                  {isOwnerOfSurprise
                    ? `Sorpresa preparada para ${partnerDevUser.name}`
                    : `Plan secreto en curso`}
                </Text>
              </View>
            )}

            {mode === 'idle' && (
              <Text style={styles.compactIdleText}>
                {currentDevUser.name} & {partnerDevUser.name} · En sintonía
              </Text>
            )}

            <Text style={styles.expandChevron}>▼</Text>
          </View>
        )}

        {/* EXPANDED VIEW */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedHeader}>
              <View style={styles.expandedTitleRow}>
                {mode === 'surprise' ? (
                  <IconGift size={15} color="#FFB8A8" strokeWidth={2} />
                ) : (
                  <IconSparkles size={15} color="#E5A93C" strokeWidth={2} />
                )}
                <Text style={styles.expandedTitle}>
                  {mode === 'surprise'
                    ? isOwnerOfSurprise
                      ? 'Sorpresa en Preparación'
                      : 'Plan Especial'
                    : 'Espacio de Pareja'}
                </Text>
              </View>
              <Text style={styles.expandedClose}>✕</Text>
            </View>

            {mode === 'surprise' && activeSurprise ? (
              <View style={styles.expandedBody}>
                <Text style={styles.surpriseTitle}>
                  {isOwnerOfSurprise
                    ? activeSurprise.ownerView.title
                    : activeSurprise.partnerView.title}
                </Text>
                <Text style={styles.surpriseSubtitle}>
                  {isOwnerOfSurprise
                    ? activeSurprise.ownerView.subtitle
                    : activeSurprise.partnerView.subtitle}
                </Text>
                <View style={styles.surpriseMetaPill}>
                  <Text style={styles.surpriseMetaText}>
                    {activeSurprise.date} {activeSurprise.time ? `· ${activeSurprise.time}h` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.expandedBody}>
                <Text style={styles.idleDesc}>
                  Vuestro archivo compartido está guardado de forma privada en este dispositivo.
                </Text>
                <Text style={styles.idleStats}>
                  {ritualSeeds.length} momentos compartidos guardados esta semana
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  islandWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    zIndex: 100
  },
  islandPill: {
    backgroundColor: '#1E1924', // Luxury deep obsidian plum
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Shadows.md
  },
  islandPillCompact: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 34,
    maxWidth: 420
  },
  islandPillExpanded: {
    padding: Spacing.md,
    borderRadius: Radii.xl,
    width: '100%',
    maxWidth: 460
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  dotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: Radii.full
  },
  connectingLine: {
    width: 6,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  compactMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1
  },
  compactEmoji: {
    fontSize: 12
  },
  compactText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1
  },
  compactIdleText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#D8CFD6'
  },
  expandChevron: {
    fontSize: 8,
    color: '#A0949F',
    marginLeft: 2
  },
  expandedContent: {
    width: '100%'
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  expandedEmoji: {
    fontSize: 15
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  expandedClose: {
    fontSize: 12,
    color: '#A0949F',
    padding: 2
  },
  expandedBody: {
    marginTop: 4
  },
  surpriseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFB8A8',
    marginBottom: 2
  },
  surpriseSubtitle: {
    fontSize: 12,
    color: '#E8DFE5',
    lineHeight: 16
  },
  surpriseMetaPill: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm
  },
  surpriseMetaText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  idleDesc: {
    fontSize: 12,
    color: '#D8CFD6',
    lineHeight: 16
  },
  idleStats: {
    fontSize: 11,
    fontWeight: '600',
    color: '#83A98C',
    marginTop: 6
  }
});
