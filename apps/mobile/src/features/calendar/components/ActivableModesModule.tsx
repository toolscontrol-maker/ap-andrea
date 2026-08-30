import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ROMANTIC_IDEAS_CATALOG } from '../domain/calendar.ideas';
import { RomanticIdea } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';

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
          <Text style={styles.viewAllText}>Ver todas ›</Text>
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
            <View style={styles.cardTopRow}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emojiText}>{item.emoji}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>Inspiración</Text>
              </View>
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
    marginTop: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 16,
    color: Colors.light.text,
  },
  viewAllText: {
    ...Typography.captionBold,
    color: Colors.light.primary,
    fontSize: 12,
  },
  cardsScroll: {
    gap: Spacing.sm + 4,
    paddingRight: Spacing.md,
  },
  ideaCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  emojiCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  categoryBadge: {
    backgroundColor: 'rgba(20, 19, 18, 0.04)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: Radii.sm,
  },
  categoryBadgeText: {
    ...Typography.captionBold,
    fontSize: 9.5,
    color: Colors.light.textMuted,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    ...Typography.caption,
    fontSize: 11.5,
    lineHeight: 15,
    color: Colors.light.textMuted,
    marginBottom: Spacing.md,
    height: 30,
  },
  actionBtn: {
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    paddingVertical: 6.5,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.2)',
  },
  actionBtnText: {
    ...Typography.captionBold,
    color: Colors.light.primary,
    fontSize: 11.5,
  },
});

