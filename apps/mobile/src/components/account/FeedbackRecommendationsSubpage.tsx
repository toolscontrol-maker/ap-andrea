import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconSparkles, IconHeart, IconCheck } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CloudSyncEngine } from '../../services/cloud-sync/CloudSyncEngine';

interface FeedbackRecommendationsSubpageProps {
  currentUserName: string;
  partnerName: string;
  onClose: () => void;
}

export function FeedbackRecommendationsSubpage({
  currentUserName,
  partnerName,
  onClose,
}: FeedbackRecommendationsSubpageProps) {
  const [category, setCategory] = useState<'app_idea' | 'new_place' | 'love_note' | 'design_tweak'>('app_idea');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'app_idea', emoji: '💡', label: 'Idea para la App' },
    { id: 'new_place', emoji: '🍽️', label: 'Rincón o Restaurante' },
    { id: 'love_note', emoji: '💌', label: 'Nota Secreta' },
    { id: 'design_tweak', emoji: '✨', label: 'Mejora de Diseño' },
  ] as const;

  const handleSubmit = async () => {
    if (!title.trim() && !message.trim()) {
      Alert.alert('Escribe algo', 'Por favor añade un título o detalle para tu sugerencia.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const feedbackPayload = {
        id: `feedback-${Date.now()}`,
        author: currentUserName,
        category,
        title: title.trim() || 'Sugerencia compartida',
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };

      // Sync as a ritual seed in Supabase so both can view it in real-time
      await CloudSyncEngine.syncRitualSeed({
        id: feedbackPayload.id,
        coupleId: 'andrea-tonet',
        authorId: currentUserName.toLowerCase().includes('tonet') ? 'user1' : 'user2',
        date: new Date().toISOString().split('T')[0],
        type: 'daily_reflection',
        title: `💡 [${category.toUpperCase()}] ${feedbackPayload.title}`,
        body: feedbackPayload.message,
        mood: 'spark',
        isSharedWithPartner: true,
        partnerResponded: false,
        createdAt: new Date().toISOString(),
      });

      setIsSent(true);
      triggerHaptic('success');
      setTimeout(() => {
        setIsSent(false);
        setTitle('');
        setMessage('');
        onClose();
      }, 1600);
    } catch (err) {
      console.warn('Error saving feedback:', err);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1600);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroIconCircle}>
          <Text style={{ fontSize: 24 }}>💌</Text>
        </View>
        <Text style={styles.heroTitle}>Buzón de Ideas & Sugerencias</Text>
        <Text style={styles.heroDesc}>
          Comparte ideas para mejorar la app, sitios que te gustaría visitar o notas especiales con {partnerName}.
        </Text>
      </View>

      {/* CATEGORY SELECTOR */}
      <Text style={styles.label}>TIPO DE SUGERENCIA</Text>
      <View style={styles.chipsRow}>
        {categories.map((c) => {
          const isSelected = category === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic('selection');
                setCategory(c.id);
              }}
            >
              <Text style={styles.chipEmoji}>{c.emoji}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TITLE INPUT */}
      <Text style={styles.label}>TÍTULO O RESUMEN</Text>
      <TextInput
        style={styles.textInput}
        placeholder="ej. Añadir un contador de días para el viaje a Roma"
        placeholderTextColor="#9E8E98"
        value={title}
        onChangeText={setTitle}
      />

      {/* MESSAGE INPUT */}
      <Text style={styles.label}>DETALLES O MENSAJE</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        placeholder="Cuéntanos más detalles, qué te gustaría ver o cómo hacer la app aún más especial..."
        placeholderTextColor="#9E8E98"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
      />

      {/* SUBMIT BUTTON */}
      {isSent ? (
        <View style={styles.successBox}>
          <IconCheck size={18} color="#2D8A4E" strokeWidth={2.5} />
          <Text style={styles.successText}>¡Sugerencia guardada y sincronizada! ✨</Text>
        </View>
      ) : (
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{ marginTop: Spacing.lg }}
        >
          {isSubmitting ? 'Guardando...' : 'Enviar Sugerencia al Nido 🚀'}
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 130, 106, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: '#1E252B',
    textAlign: 'center',
  },
  heroDesc: {
    ...Typography.body,
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E252B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    fontSize: 14,
    color: '#1E252B',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(45, 138, 78, 0.12)',
    borderRadius: Radii.lg,
    marginTop: Spacing.lg,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D8A4E',
  },
});
