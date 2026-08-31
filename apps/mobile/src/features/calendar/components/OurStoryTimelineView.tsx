import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { TimelineItem, TimelineItemKind } from '../domain/calendar.types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';
import { IconSparkles, IconMapPin, IconCalendar, IconHeart } from '../../../components/ui/Icons';

interface OurStoryTimelineViewProps {
  timelineItems: TimelineItem[];
  daysTogether: number;
  daysSinceMet: number;
  partnerName: string;
  onSelectItem?: (item: TimelineItem) => void;
  onOpenMap?: (locationName?: string) => void;
}

type TimelineFilterKey = 'all' | 'milestones' | 'dates' | 'trips' | 'wishes' | 'memories';

interface FilterChipOption {
  key: TimelineFilterKey;
  label: string;
  emoji: string;
  kinds?: TimelineItemKind[];
}

const FILTER_OPTIONS: FilterChipOption[] = [
  { key: 'all', label: 'Todo', emoji: '✦' },
  { key: 'milestones', label: 'Hitos', emoji: '✨', kinds: ['milestone'] },
  { key: 'dates', label: 'Citas', emoji: '🍽️', kinds: ['restaurant', 'event'] },
  { key: 'trips', label: 'Viajes', emoji: '✈️', kinds: ['trip'] },
  { key: 'wishes', label: 'Deseos', emoji: '🎁', kinds: ['wish_fulfilled'] },
  { key: 'memories', label: 'Recuerdos', emoji: '🌿', kinds: ['memory', 'surprise_revealed'] },
];

function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return '';
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  return dateStr;
}

export function OurStoryTimelineView({
  timelineItems,
  daysTogether,
  daysSinceMet,
  partnerName,
  onSelectItem,
  onOpenMap,
}: OurStoryTimelineViewProps) {
  const [activeFilter, setActiveFilter] = useState<TimelineFilterKey>('all');
  const [selectedDetailItem, setSelectedDetailItem] = useState<TimelineItem | null>(null);

  // 1. Filter Timeline Items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return timelineItems;
    const selectedOption = FILTER_OPTIONS.find((f) => f.key === activeFilter);
    if (!selectedOption || !selectedOption.kinds) return timelineItems;
    return timelineItems.filter((item) => selectedOption.kinds?.includes(item.kind));
  }, [timelineItems, activeFilter]);

  // 2. Filter Counts
  const filterCounts = useMemo(() => {
    const counts: Record<TimelineFilterKey, number> = {
      all: timelineItems.length,
      milestones: 0,
      dates: 0,
      trips: 0,
      wishes: 0,
      memories: 0,
    };
    timelineItems.forEach((item) => {
      if (item.kind === 'milestone') counts.milestones++;
      else if (item.kind === 'restaurant' || item.kind === 'event') counts.dates++;
      else if (item.kind === 'trip') counts.trips++;
      else if (item.kind === 'wish_fulfilled') counts.wishes++;
      else if (item.kind === 'memory' || item.kind === 'surprise_revealed') counts.memories++;
    });
    return counts;
  }, [timelineItems]);

  // 3. Group filtered items by Chapter or Year
  const groupedChapters = useMemo(() => {
    const chapters: { title: string; subtitle?: string; items: TimelineItem[] }[] = [];

    filteredItems.forEach((item) => {
      const chapterName =
        item.chapterTitle ||
        (item.isUpcoming
          ? 'Próximos Capítulos'
          : `Año ${item.date.split('-')[0]}`);

      let existing = chapters.find((c) => c.title === chapterName);
      if (!existing) {
        let subtitle = 'Nuestra historia juntos';
        if (chapterName.includes('Capítulo I')) subtitle = 'El flechazo y las primeras miradas';
        else if (chapterName.includes('Capítulo II')) subtitle = 'Oficialmente nosotros';
        else if (chapterName.includes('Próximos')) subtitle = 'Planes e ilusiones por vivir';

        existing = { title: chapterName, subtitle, items: [] };
        chapters.push(existing);
      }
      existing.items.push(item);
    });

    return chapters;
  }, [filteredItems]);

  const handleCardPress = (item: TimelineItem) => {
    triggerHaptic('selection');
    setSelectedDetailItem(item);
    if (onSelectItem) onSelectItem(item);
  };

  return (
    <View style={styles.container}>
      {/* ── Compact Romantic Hero Card ── */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroAvatarPair}>
            <View style={[styles.miniAvatar, { backgroundColor: '#EF826A' }]}>
              <Text style={styles.miniAvatarText}>T</Text>
            </View>
            <View style={[styles.miniAvatar, { backgroundColor: '#E05666', marginLeft: -8 }]}>
              <Text style={styles.miniAvatarText}>A</Text>
            </View>
          </View>
          <View style={styles.heroBadgePill}>
            <View style={styles.pulseDot} />
            <Text style={styles.heroBadgeText}>LÍNEA TEMPORAL</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Andrea & Tonet</Text>
        <Text style={styles.heroSubtitle}>
          💕 {daysTogether} días juntos · Nos conocimos hace {daysSinceMet} días
        </Text>

        <View style={styles.heroMetricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{timelineItems.length}</Text>
            <Text style={styles.metricLabel}>Momentos</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{groupedChapters.length}</Text>
            <Text style={styles.metricLabel}>Capítulos</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>Valencia</Text>
            <Text style={styles.metricLabel}>& Viajes ✈️</Text>
          </View>
        </View>
      </View>

      {/* ── Interactive Category Filter Chips ── */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.key;
            const count = filterCounts[opt.key] || 0;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveFilter(opt.key);
                }}
              >
                <Text style={styles.filterChipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {opt.label}
                </Text>
                <View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Chapters & Timeline Nodes ── */}
      <View style={styles.timelineStream}>
        {groupedChapters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Sin momentos en esta categoría</Text>
            <Text style={styles.emptySubtitle}>
              Prueba a seleccionar "✦ Todo" para explorar toda la historia completa.
            </Text>
          </View>
        ) : (
          groupedChapters.map((chapter) => (
            <View key={chapter.title} style={styles.chapterBlock}>
              {/* Chapter Header Banner */}
              <View style={styles.chapterHeader}>
                <View style={styles.chapterBadge}>
                  <Text style={styles.chapterBadgeTitle}>{chapter.title}</Text>
                </View>
                {chapter.subtitle && (
                  <Text style={styles.chapterBadgeSubtitle}>{chapter.subtitle}</Text>
                )}
              </View>

              {/* Nodes Container with Continuous Vertical Spine */}
              <View style={styles.nodesContainer}>
                <View style={styles.spineLine} />

                {chapter.items.map((item) => {
                  const hasImage = Boolean(item.imageUrl || (item.photos && item.photos.length > 0));
                  const displayImage = item.imageUrl || (item.photos && item.photos[0]);
                  const badgeBg = `${item.badgeColor || Colors.light.primary}15`;
                  const badgeFg = item.badgeColor || Colors.light.primary;

                  return (
                    <View key={item.id} style={styles.timelineNodeRow}>
                      {/* Left Orb Node with connected glow */}
                      <View style={styles.orbWrapper}>
                        <View style={[styles.nodeOrb, { borderColor: badgeFg }]}>
                          <Text style={styles.nodeOrbEmoji}>{item.emoji || '✦'}</Text>
                        </View>
                      </View>

                      {/* Right Timeline Card */}
                      <TouchableOpacity
                        style={styles.cardWrapper}
                        onPress={() => handleCardPress(item)}
                        activeOpacity={0.82}
                      >
                        <View style={styles.itemCard}>
                          {/* Card Header: Badge & Date */}
                          <View style={styles.cardHeaderRow}>
                            <View style={[styles.badgePill, { backgroundColor: badgeBg }]}>
                              <Text style={[styles.badgeText, { color: badgeFg }]}>
                                {item.badgeLabel || 'Momento'}
                              </Text>
                            </View>

                            <Text style={styles.itemDateText}>
                              {formatDateFriendly(item.date)}
                              {item.time ? ` · ${item.time}` : ''}
                            </Text>
                          </View>

                          {/* Content Row with side-by-side or stacked image preview */}
                          <View style={styles.cardBodyRow}>
                            <View style={styles.cardTextContent}>
                              <Text style={styles.itemTitleText} numberOfLines={2}>
                                {item.title}
                              </Text>

                              {item.subtitle && (
                                <Text style={styles.itemSubtitleText} numberOfLines={1}>
                                  {item.subtitle}
                                </Text>
                              )}

                              {item.description && (
                                <Text style={styles.itemDescText} numberOfLines={2}>
                                  {item.description}
                                </Text>
                              )}
                            </View>

                            {hasImage && displayImage && (
                              <View style={styles.thumbImageContainer}>
                                <Image
                                  source={{ uri: displayImage }}
                                  style={styles.thumbImage}
                                  resizeMode="cover"
                                />
                              </View>
                            )}
                          </View>

                          {/* Card Footer: Location Tag */}
                          {item.locationName && (
                            <View style={styles.locationFooterRow}>
                              <IconMapPin size={12} color={Colors.light.textMuted} strokeWidth={2} />
                              <Text style={styles.locationText} numberOfLines={1}>
                                {item.locationName}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </View>

      {/* ── Footer Dedication ── */}
      <View style={styles.footerBlock}>
        <View style={styles.footerHeartIcon}>
          <IconHeart size={18} color="#E05666" />
        </View>
        <Text style={styles.footerText}>
          "Lo mejor de nuestra historia es que aún queda casi todo por escribir."
        </Text>
        <Text style={styles.footerSign}>Andrea & Tonet 💕</Text>
      </View>

      {/* ── Full Detail Modal on Card Tap ── */}
      <Modal
        visible={Boolean(selectedDetailItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDetailItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedDetailItem && (
              <>
                {/* Modal Top Bar */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View
                      style={[
                        styles.badgePill,
                        {
                          backgroundColor: `${
                            selectedDetailItem.badgeColor || Colors.light.primary
                          }18`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              selectedDetailItem.badgeColor || Colors.light.primary,
                          },
                        ]}
                      >
                        {selectedDetailItem.badgeLabel || 'Momento'}
                      </Text>
                    </View>
                    <Text style={styles.modalDateText}>
                      {formatDateFriendly(selectedDetailItem.date)}
                      {selectedDetailItem.time ? ` · ${selectedDetailItem.time}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedDetailItem(null)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.modalCloseBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Modal Scroll Content */}
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Hero Image in Modal */}
                  {(selectedDetailItem.imageUrl ||
                    (selectedDetailItem.photos && selectedDetailItem.photos.length > 0)) && (
                    <View style={styles.modalHeroImageContainer}>
                      <Image
                        source={{
                          uri:
                            selectedDetailItem.imageUrl ||
                            (selectedDetailItem.photos && selectedDetailItem.photos[0]),
                        }}
                        style={styles.modalHeroImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <Text style={styles.modalTitle}>{selectedDetailItem.title}</Text>

                  {selectedDetailItem.subtitle && (
                    <Text style={styles.modalSubtitle}>{selectedDetailItem.subtitle}</Text>
                  )}

                  {selectedDetailItem.description && (
                    <View style={styles.modalDescCard}>
                      <Text style={styles.modalDescText}>{selectedDetailItem.description}</Text>
                    </View>
                  )}

                  {selectedDetailItem.locationName && (
                    <View style={styles.modalLocationCard}>
                      <IconMapPin size={16} color={Colors.light.primary} strokeWidth={2} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalLocationLabel}>Ubicación</Text>
                        <Text style={styles.modalLocationText}>
                          {selectedDetailItem.locationName}
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedDetailItem.chapterTitle && (
                    <View style={styles.modalChapterInfo}>
                      <IconSparkles size={14} color="#D4AF37" />
                      <Text style={styles.modalChapterText}>
                        Pertenece a: {selectedDetailItem.chapterTitle}
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Modal Footer Button */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => setSelectedDetailItem(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Cerrar Detalle</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing['2xl'],
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.07)',
    ...Shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroAvatarPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2B2129',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 14,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2B2129',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    gap: 6,
    ...Shadows.subtle,
  },
  filterChipActive: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  filterChipEmoji: {
    fontSize: 13,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#3A2F38',
  },
  filterChipTextActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  filterCountBadge: {
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountBadgeActive: {
    backgroundColor: Colors.light.primary,
  },
  filterCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#3A2F38',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  timelineStream: {
    gap: 18,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  chapterBlock: {
    marginBottom: 6,
  },
  chapterHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  chapterBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    ...Shadows.subtle,
  },
  chapterBadgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.4,
  },
  chapterBadgeSubtitle: {
    fontSize: 11.5,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  nodesContainer: {
    position: 'relative',
    paddingLeft: 2,
  },
  spineLine: {
    position: 'absolute',
    left: 17,
    top: 8,
    bottom: 12,
    width: 2,
    backgroundColor: 'rgba(239, 130, 106, 0.22)',
    borderRadius: 1,
  },
  timelineNodeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  orbWrapper: {
    width: 36,
    alignItems: 'center',
    marginRight: 10,
    paddingTop: 2,
    zIndex: 2,
  },
  nodeOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  nodeOrbEmoji: {
    fontSize: 14,
  },
  cardWrapper: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.07)',
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  itemDateText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  cardBodyRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  cardTextContent: {
    flex: 1,
  },
  itemTitleText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2B2129',
    lineHeight: 19,
    marginBottom: 2,
  },
  itemSubtitleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 3,
  },
  itemDescText: {
    fontSize: 12,
    color: '#574C55',
    lineHeight: 16,
  },
  thumbImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  locationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 47, 56, 0.05)',
  },
  locationText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  footerBlock: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  footerHeartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  footerSign: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: 0.8,
  },

  /* ── Detail Modal Styles ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Shadows.cardHover,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.06)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2F38',
  },
  modalScroll: {
    flexGrow: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeroImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  modalHeroImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2B2129',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 14,
  },
  modalDescCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
  },
  modalDescText: {
    fontSize: 13.5,
    color: '#3A2F38',
    lineHeight: 20,
  },
  modalLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 130, 106, 0.15)',
  },
  modalLocationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  modalLocationText: {
    fontSize: 13,
    color: '#3A2F38',
    fontWeight: '600',
  },
  modalChapterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  modalChapterText: {
    fontSize: 12,
    color: '#854D0E',
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 47, 56, 0.06)',
    backgroundColor: '#FFFFFF',
  },
  modalPrimaryBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
