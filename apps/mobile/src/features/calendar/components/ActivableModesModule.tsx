import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ROMANTIC_IDEAS_CATALOG } from '../domain/calendar.ideas';
import { RomanticIdea } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface ActivableModesModuleProps {
  onTriggerIdea: (idea: RomanticIdea) => void;
  onOpenAllIdeas: () => void;
}

export function ActivableModesModule({
  onTriggerIdea,
  onOpenAllIdeas,
}: ActivableModesModuleProps) {
  // Show top 4 priority ideas
  const featuredIdeas = ROMANTIC_IDEAS_CATALOG.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Header with Title & Action */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Ideas para vosotros</Text>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            onOpenAllIdeas();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Ver todas ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Cards ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsScroll}
        decelerationRate="fast"
      >
        {featuredIdeas.map((item) => (
          <View key={item.id} style={styles.ideaCard}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                triggerHaptic('medium');
                onTriggerIdea(item);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
    fontWeight: '800',
  },
  viewAllText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 12,
  },
  cardsScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  ideaCard: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
    justifyContent: 'space-between',
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs + 2,
  },
  emojiText: {
    fontSize: 20,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#1E252B',
    fontWeight: '800',
    marginBottom: 2,
  },
  cardSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 16,
    color: '#66737C',
    marginBottom: Spacing.md,
    height: 32,
  },
  actionBtn: {
    backgroundColor: '#FDEEEB',
    paddingVertical: 7,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 88, 0.25)',
  },
  actionBtnText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 11.5,
  },
});
