import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { ROMANTIC_IDEAS_CATALOG } from '../domain/calendar.ideas';
import { RomanticIdea } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface IdeasLibrarySheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectIdea: (idea: RomanticIdea) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'sorprender', label: '🎁 Sorprender' },
  { id: 'conectar', label: '🌿 Conectar' },
  { id: 'salir', label: '🍷 Salir' },
  { id: 'casa', label: '🛋️ En casa' },
  { id: 'hablar', label: '💌 Hablar' },
] as const;

export function IdeasLibrarySheet({
  visible,
  onClose,
  onSelectIdea,
}: IdeasLibrarySheetProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!visible) return null;

  const filteredIdeas = activeTab === 'all'
    ? ROMANTIC_IDEAS_CATALOG
    : ROMANTIC_IDEAS_CATALOG.filter((i) => i.category === activeTab);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Biblioteca de Ideas & Modos</Text>
              <Text style={styles.subtitle}>Planes, rituales y detalles para cuidar vuestra relación</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, color: '#66737C', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {CATEGORY_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabChip, activeTab === tab.id && styles.tabChipSelected]}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveTab(tab.id);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabChipText, activeTab === tab.id && styles.tabChipTextSelected]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Ideas Grid */}
          <ScrollView style={styles.ideasScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {filteredIdeas.map((idea) => (
                <TouchableOpacity
                  key={idea.id}
                  style={styles.ideaCard}
                  onPress={() => {
                    triggerHaptic('medium');
                    onSelectIdea(idea);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.emojiCircle}>
                      <Text style={{ fontSize: 22 }}>{idea.emoji}</Text>
                    </View>
                    <Text style={styles.actionTag}>{idea.actionLabel} ➔</Text>
                  </View>

                  <Text style={styles.ideaTitle}>{idea.title}</Text>
                  <Text style={styles.ideaDesc}>{idea.description}</Text>
                </TouchableOpacity>
              ))}
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
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '88%',
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
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
  tabsRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  tabChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  tabChipSelected: {
    backgroundColor: '#E86A58',
    borderColor: '#E86A58',
  },
  tabChipText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: '#1E252B',
  },
  tabChipTextSelected: {
    color: '#FFFFFF',
  },
  ideasScroll: {
    paddingHorizontal: Spacing.xl,
  },
  grid: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  ideaCard: {
    backgroundColor: '#FAF6F0',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  actionTag: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 11.5,
  },
  ideaTitle: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: '#1E252B',
    fontWeight: '800',
    marginBottom: 4,
  },
  ideaDesc: {
    ...Typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#66737C',
  },
});
