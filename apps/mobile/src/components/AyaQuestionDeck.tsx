import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Radii, Shadows, Spacing, Typography } from '../theme/tokens';
import { AyaQuestionPrompt } from '@andrea/types';

interface AyaQuestionDeckProps {
  onSelectQuestion: (question: AyaQuestionPrompt) => void;
  getRandomQuestion: () => AyaQuestionPrompt;
}

export function AyaQuestionDeck({ onSelectQuestion, getRandomQuestion }: AyaQuestionDeckProps) {
  const [currentPrompt, setCurrentPrompt] = useState<AyaQuestionPrompt>(() => getRandomQuestion());

  const handleShuffle = () => {
    const next = getRandomQuestion();
    setCurrentPrompt(next);
  };

  const handleAsk = () => {
    onSelectQuestion(currentPrompt);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Luxury Gold Border Card */}
      <View style={styles.cardInner}>
        {/* Card Header with category ribbon and shuffle button */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              CARTA DE CONEXIÓN • {currentPrompt.category.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shuffleBtn}
            onPress={handleShuffle}
            activeOpacity={0.7}
          >
            <Text style={styles.shuffleBtnText}>Otra carta</Text>
          </TouchableOpacity>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>"{currentPrompt.question}"</Text>

        {/* Action Button to drop into conversation */}
        <TouchableOpacity
          style={styles.askButton}
          onPress={handleAsk}
          activeOpacity={0.8}
        >
          <Text style={styles.askButtonText}>Responder juntos en el chat ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: Spacing.md,
    borderRadius: Radii['2xl'],
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.45)',
    ...Shadows.md,
    overflow: 'hidden',
  },
  cardInner: {
    padding: Spacing.lg,
    backgroundColor: '#FFFDF9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    backgroundColor: Colors.light.butterLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A6812',
    letterSpacing: 0.6,
  },
  shuffleBtn: {
    backgroundColor: Colors.light.surfaceSubtle,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
  },
  shuffleBtnText: {
    ...Typography.captionBold,
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
  questionText: {
    ...Typography.h3,
    color: Colors.light.text,
    lineHeight: 25,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  askButton: {
    backgroundColor: Colors.light.butterDark,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  askButtonText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
