import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getRandomDateIdea, RandomDateIdea } from '../domain/calendar.randomDate';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Badge, Button } from '../../../components/ui';

interface RandomDateGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveAsPlan: (idea: RandomDateIdea) => void;
}

export function RandomDateGeneratorModal({
  visible,
  onClose,
  onSaveAsPlan,
}: RandomDateGeneratorModalProps) {
  const [currentIdea, setCurrentIdea] = useState<RandomDateIdea>(() => getRandomDateIdea());
  const [settingFilter, setSettingFilter] = useState<'all' | 'interior' | 'exterior'>('all');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'gratis' | 'moderado' | 'especial'>('all');

  if (!visible) return null;

  const handleReroll = () => {
    triggerHaptic('medium');
    const newIdea = getRandomDateIdea(currentIdea.id, settingFilter, budgetFilter);
    setCurrentIdea(newIdea);
  };

  const handleSave = () => {
    triggerHaptic('success');
    onSaveAsPlan(currentIdea);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdropOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🎲 Cita Aleatoria</Text>
              <Text style={styles.subtitle}>Una idea especial para hacer juntos esta semana</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, color: '#66737C', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Idea Card */}
          <View style={styles.ideaBox}>
            <View style={styles.badgesRow}>
              <Badge variant="primary" size="sm">
                {currentIdea.category === 'cena' ? '🍷 Cena' : currentIdea.category === 'casa' ? '🛋️ En casa' : currentIdea.category === 'cultural' ? '📚 Cultural' : '✨ Aventura'}
              </Badge>
              <Text style={styles.badgeText}>
                {currentIdea.budgetLevel === 'gratis' ? '🌿 Sin coste' : currentIdea.budgetLevel === 'moderado' ? '💶 Presupuesto medio' : '✨ Ocasión especial'}
              </Text>
              <Text style={styles.badgeText}>⏰ {currentIdea.duration}</Text>
            </View>

            <Text style={styles.ideaTitle}>{currentIdea.title}</Text>
            <Text style={styles.ideaDesc}>{currentIdea.description}</Text>

            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>💡 Hora sugerida: {currentIdea.suggestedTime}</Text>
            </View>
          </View>

          {/* Quick Filters */}
          <View style={styles.filtersSection}>
            <Text style={styles.filterSectionTitle}>AMBIENTE</Text>
            <View style={styles.chipsRow}>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'exterior', label: '🌿 Aire libre' },
                { id: 'interior', label: '🛋️ Interior' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.filterChip, settingFilter === s.id && styles.filterChipSelected]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSettingFilter(s.id as any);
                    setCurrentIdea(getRandomDateIdea(currentIdea.id, s.id as any, budgetFilter));
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, settingFilter === s.id && styles.filterChipTextSelected]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Button
              variant="outline"
              size="lg"
              onPress={handleReroll}
              style={{ flex: 1 }}
            >
              🎲 Otra idea
            </Button>

            <Button
              variant="primary"
              size="lg"
              onPress={handleSave}
              style={{ flex: 1.3 }}
            >
              Guardar como plan ✨
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
    ...Shadows.lg,
    zIndex: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    color: '#1E252B',
  },
  subtitle: {
    ...Typography.caption,
    color: '#66737C',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 33, 41, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaBox: {
    backgroundColor: '#FAF7FD',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 106, 88, 0.2)',
    marginBottom: Spacing.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  badgeText: {
    ...Typography.captionBold,
    color: '#66737C',
    fontSize: 11,
  },
  ideaTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: '#1E252B',
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  ideaDesc: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#66737C',
  },
  timeTag: {
    marginTop: Spacing.md,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  timeTagText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 11,
  },
  filtersSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    ...Typography.overline,
    fontSize: 10,
    color: '#66737C',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  filterChipSelected: {
    backgroundColor: '#E86A58',
    borderColor: '#E86A58',
  },
  filterChipText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: '#1E252B',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
