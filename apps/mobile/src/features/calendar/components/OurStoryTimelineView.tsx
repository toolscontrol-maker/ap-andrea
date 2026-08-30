import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TimelineItem } from '../domain/calendar.types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';

interface OurStoryTimelineViewProps {
  timelineItems: TimelineItem[];
  daysTogether: number;
  daysSinceMet: number;
  partnerName: string;
  onSelectItem?: (item: TimelineItem) => void;
  onOpenMap?: () => void;
}

export function OurStoryTimelineView({
  timelineItems,
  daysTogether,
  daysSinceMet,
  partnerName,
  onSelectItem,
  onOpenMap,
}: OurStoryTimelineViewProps) {
  // Group items by Chapter or Year
  const groupedChapters = useMemo(() => {
    const chapters: { title: string; items: TimelineItem[] }[] = [];

    timelineItems.forEach((item) => {
      const chapterName =
        item.chapterTitle ||
        (item.isUpcoming
          ? 'Próximos Capítulos'
          : `Año ${item.date.split('-')[0]}`);

      let existing = chapters.find((c) => c.title === chapterName);
      if (!existing) {
        existing = { title: chapterName, items: [] };
        chapters.push(existing);
      }
      existing.items.push(item);
    });

    return chapters;
  }, [timelineItems]);

  return (
    <View style={styles.container}>
      {/* Emotional Hero Header */}
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>NUESTRA HISTORIA</Text>
        <Text style={styles.heroTitle}>Desde el primer instante</Text>
        <Text style={styles.heroSubtitle}>
          💕 {daysTogether} días juntos · Nos conocimos hace {daysSinceMet} días
        </Text>

        {/* Discreet Non-gamified Metrics */}
        <View style={styles.metricsPill}>
          <Text style={styles.metricsPillText}>
            ✨ {timelineItems.length} momentos construidos · 📍 Valencia & viajes
          </Text>
        </View>
      </View>

      {/* Chapters & Timeline Stream */}
      <View style={styles.timelineStream}>
        {groupedChapters.map((chapter) => (
          <View key={chapter.title} style={styles.chapterBlock}>
            {/* Chapter Header */}
            <View style={styles.chapterHeaderRow}>
              <View style={styles.chapterLine} />
              <View style={styles.chapterTitleBadge}>
                <Text style={styles.chapterTitleText}>{chapter.title}</Text>
              </View>
              <View style={styles.chapterLine} />
            </View>

            {/* Timeline Nodes */}
            <View style={styles.nodesContainer}>
              {/* Continuous Vertical Spine */}
              <View style={styles.spineLine} />

              {chapter.items.map((item, idx) => (
                <View key={item.id} style={styles.timelineNodeRow}>
                  {/* Left Icon Orb */}
                  <View style={styles.orbWrapper}>
                    <View
                      style={[
                        styles.nodeOrb,
                        { borderColor: item.badgeColor || Colors.light.primary },
                      ]}
                    >
                      <Text style={styles.nodeOrbEmoji}>{item.emoji || '✦'}</Text>
                    </View>
                  </View>

                  {/* Right Card */}
                  <TouchableOpacity
                    style={styles.cardWrapper}
                    onPress={() => {
                      triggerHaptic('selection');
                      onSelectItem && onSelectItem(item);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.itemCard}>
                      {/* Top Meta */}
                      <View style={styles.cardMetaRow}>
                        <View
                          style={[
                            styles.badgePill,
                            { backgroundColor: `${item.badgeColor || Colors.light.primary}18` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: item.badgeColor || Colors.light.primary },
                            ]}
                          >
                            {item.badgeLabel || 'Momento'}
                          </Text>
                        </View>

                        <Text style={styles.itemDateText}>
                          {item.date} {item.time ? `· ${item.time}` : ''}
                        </Text>
                      </View>

                      {/* Main Title & Subtitle */}
                      <Text style={styles.itemTitleText}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.itemSubtitleText}>{item.subtitle}</Text>
                      )}

                      {/* Image Thumbnail if Available */}
                      {item.imageUrl && (
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                        </View>
                      )}

                      {/* Description */}
                      {item.description && (
                        <Text style={styles.itemDescText} numberOfLines={3}>
                          {item.description}
                        </Text>
                      )}

                      {/* Location Chip */}
                      {item.locationName && (
                        <View style={styles.locationFooterRow}>
                          <Text style={styles.locationText}>📍 {item.locationName}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Footer Dedication */}
      <View style={styles.footerBlock}>
        <Text style={styles.footerText}>
          "Lo mejor de nuestra historia es que aún queda casi todo por escribir."
        </Text>
        <Text style={styles.footerSign}>Ángel & Andrea 💕</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing['2xl'],
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
  },
  heroEyebrow: {
    ...Typography.captionBold,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  heroTitle: {
    ...Typography.h1,
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    color: Colors.light.textMuted,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  metricsPill: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
  },
  metricsPillText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.text,
  },
  timelineStream: {
    gap: Spacing.xl,
  },
  chapterBlock: {
    marginBottom: Spacing.md,
  },
  chapterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chapterLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.08)',
  },
  chapterTitleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    ...Shadows.subtle,
  },
  chapterTitleText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  nodesContainer: {
    position: 'relative',
    paddingLeft: 4,
  },
  spineLine: {
    position: 'absolute',
    left: 20,
    top: 10,
    bottom: 20,
    width: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  timelineNodeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  orbWrapper: {
    width: 40,
    alignItems: 'center',
    marginRight: Spacing.sm,
    zIndex: 2,
  },
  nodeOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  nodeOrbEmoji: {
    fontSize: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.subtle,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: Radii.sm,
  },
  badgeText: {
    ...Typography.captionBold,
    fontSize: 10.5,
  },
  itemDateText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  itemTitleText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  itemSubtitleText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  itemDescText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  locationFooterRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 19, 18, 0.04)',
  },
  locationText: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
  },
  footerBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  footerText: {
    ...Typography.body,
    fontSize: 13.5,
    fontStyle: 'italic',
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSign: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.primary,
    letterSpacing: 1,
  },
});
