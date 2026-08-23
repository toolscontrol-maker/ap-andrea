import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MapFilter, MapCategoryFilter, DateRangeFilter, MoodTagFilter } from '../domain/map.types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Button } from '../../../components/ui';

interface MapFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filter: MapFilter;
  onApplyFilter: (filter: Partial<MapFilter>) => void;
  onResetFilter: () => void;
  matchingCount: number;
  partnerName: string;
}

const CATEGORY_OPTIONS: { id: MapCategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'viaje', label: '✈️ Grandes Viajes' },
  { id: 'escapada', label: '🌿 Escapadas' },
  { id: 'cita', label: '🍷 Citas especiales' },
  { id: 'primer_encuentro', label: '💫 Donde empezó todo' },
];

const DATE_OPTIONS: { id: DateRangeFilter; label: string }[] = [
  { id: 'all', label: 'Todo el tiempo' },
  { id: 'this_year', label: 'Este año' },
  { id: 'last_year', label: 'Año pasado' },
];

const MOOD_OPTIONS: { id: MoodTagFilter; label: string }[] = [
  { id: 'all', label: 'Todos los estados' },
  { id: 'love', label: '❤️ Amor' },
  { id: 'excited', label: '✨ Ilusión' },
  { id: 'calm', label: '🌿 Calma' },
  { id: 'grateful', label: '🙏 Gratitud' },
];

export function MapFilterSheet({
  visible,
  onClose,
  filter,
  onApplyFilter,
  onResetFilter,
  matchingCount,
  partnerName,
}: MapFilterSheetProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheetContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filtrar recuerdos</Text>
            <TouchableOpacity onPress={onResetFilter} activeOpacity={0.7}>
              <Text style={styles.resetText}>Restablecer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            {/* Category Filter */}
            <Text style={styles.sectionLabel}>TIPO DE MOMENTO</Text>
            <View style={styles.chipGrid}>
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = filter.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onApplyFilter({ category: cat.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Filter */}
            <Text style={styles.sectionLabel}>PERIODO</Text>
            <View style={styles.chipGrid}>
              {DATE_OPTIONS.map((d) => {
                const isSelected = filter.dateRange === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onApplyFilter({ dateRange: d.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mood Tag Filter */}
            <Text style={styles.sectionLabel}>ESTADO DE ÁNIMO</Text>
            <View style={styles.chipGrid}>
              {MOOD_OPTIONS.map((m) => {
                const isSelected = filter.moodTag === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onApplyFilter({ moodTag: m.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action CTA */}
          <Button
            variant="primary"
            size="lg"
            onPress={onClose}
            style={{ marginTop: Spacing.md }}
          >
            Ver {matchingCount} {matchingCount === 1 ? 'recuerdo' : 'recuerdos'}
          </Button>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    maxHeight: '82%',
    ...Shadows.lg,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  headerRow: {
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
  resetText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 13,
  },
  scrollContent: {
    maxHeight: 380,
  },
  sectionLabel: {
    ...Typography.overline,
    fontSize: 10.5,
    letterSpacing: 1,
    color: '#66737C',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs + 2,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  chipSelected: {
    backgroundColor: '#E86A58',
    borderColor: '#E86A58',
  },
  chipText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: '#1E252B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
