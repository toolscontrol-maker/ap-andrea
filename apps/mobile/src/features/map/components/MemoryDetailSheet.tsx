import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { MapPlace } from '@andrea/types';
import { formatDateLong, getCountryFlag } from '../utils/formatters';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Badge, Button } from '../../../components/ui';

interface MemoryDetailSheetProps {
  visible: boolean;
  place: MapPlace | null;
  onClose: () => void;
  currentUserId: string;
  partnerName: string;
}

export function MemoryDetailSheet({
  visible,
  place,
  onClose,
  currentUserId,
  partnerName,
}: MemoryDetailSheetProps) {
  if (!visible || !place) return null;

  const flag = getCountryFlag(place.country);
  const isMine = place.authorId === currentUserId;

  const getCategoryVariant = (cat: string): 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' => {
    switch (cat) {
      case 'viaje': return 'mistBlue';
      case 'cita': return 'primary';
      case 'primer_encuentro': return 'butter';
      default: return 'sage';
    }
  };

  const handleShare = () => {
    Alert.alert('Compartir recuerdo', 'Puedes exportar este recuerdo en una tarjeta visual para enviar a tu pareja.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheetContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.grabber} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Hero Photo / Photo Gallery */}
            {place.photos && place.photos.length > 0 ? (
              <View style={styles.heroPhotoWrapper}>
                <Image
                  source={{ uri: place.photos[0] }}
                  style={styles.heroPhoto}
                  resizeMode="cover"
                />
                <View style={styles.photoCountBadge}>
                  <Text style={styles.photoCountText}>📷 1 de {place.photos.length}</Text>
                </View>
              </View>
            ) : null}

            {/* Header: Category & Date */}
            <View style={styles.metaHeader}>
              <Badge variant={getCategoryVariant(place.category)} size="md">
                {place.category === 'viaje' ? '✈️ Gran Viaje' : place.category === 'cita' ? '🍷 Cita romántica' : place.category === 'primer_encuentro' ? '💫 Donde empezó todo' : '🌿 Escapada'}
              </Badge>
              <Text style={styles.dateLabel}>{formatDateLong(place.date)}</Text>
            </View>

            {/* Memory Title */}
            <Text style={styles.titleText}>{place.title}</Text>

            {/* Destination Pill */}
            <View style={styles.locationPill}>
              <Text style={styles.locationPillText}>
                {flag} {place.cityName}, {place.country}
              </Text>
            </View>

            {/* Emotional Story in Editorial Quote Box */}
            <View style={styles.quoteBox}>
              <Text style={styles.storyText}>
                "{place.story}"
              </Text>
            </View>

            {/* Author Attribution & Mood */}
            <View style={styles.attributionRow}>
              <Text style={styles.authorText}>
                {isMine ? '✍️ Guardado por ti' : `✍️ Guardado por ${partnerName}`}
              </Text>
              {place.moodTag && (
                <Text style={styles.moodText}>
                  {place.moodTag === 'love' ? '❤️ Con mucho amor' : place.moodTag === 'grateful' ? '🙏 Con gratitud' : '✨ Con ilusión'}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsGrid}>
              <Button
                variant="outline"
                size="md"
                onPress={handleShare}
                style={{ flex: 1 }}
              >
                💌 Compartir
              </Button>

              <Button
                variant="primary"
                size="md"
                onPress={onClose}
                style={{ flex: 1 }}
              >
                Cerrar
              </Button>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '90%',
    paddingTop: Spacing.md,
    ...Shadows.lg,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  heroPhotoWrapper: {
    width: '100%',
    height: 220,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(20, 27, 32, 0.75)',
    backdropFilter: 'blur(8px)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  photoCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  dateLabel: {
    ...Typography.captionBold,
    color: '#66737C',
    fontSize: 12,
  },
  titleText: {
    ...Typography.h1,
    fontSize: 24,
    color: '#1E252B',
    lineHeight: 30,
    marginBottom: Spacing.sm,
  },
  locationPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF6F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    marginBottom: Spacing.lg,
  },
  locationPillText: {
    ...Typography.captionBold,
    color: '#4A7C9B',
    fontSize: 13,
  },
  quoteBox: {
    backgroundColor: '#FAF7FD',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderLeftWidth: 3.5,
    borderLeftColor: '#E86A58',
    marginBottom: Spacing.lg,
  },
  storyText: {
    ...Typography.bodyLarge,
    fontSize: 16,
    lineHeight: 25,
    color: '#1E252B',
    fontStyle: 'italic',
  },
  attributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 33, 41, 0.08)',
    marginBottom: Spacing.xl,
  },
  authorText: {
    ...Typography.caption,
    color: '#66737C',
    fontSize: 12,
  },
  moodText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
