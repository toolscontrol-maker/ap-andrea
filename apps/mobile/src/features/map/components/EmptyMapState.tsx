import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface EmptyMapStateProps {
  onAddFirstMemory: () => void;
}

export function EmptyMapState({ onAddFirstMemory }: EmptyMapStateProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>✨</Text>
        </View>

        <Text style={styles.title}>Aquí empezará vuestra historia.</Text>
        <Text style={styles.subtitle}>
          Guardad el lugar de vuestra primera cita, el viaje que nunca olvidaréis o un rincón que solo tiene sentido para vosotros.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onAddFirstMemory} activeOpacity={0.8}>
          <Text style={styles.buttonText}>+ Añadir primer recuerdo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDEEEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconEmoji: {
    fontSize: 22,
  },
  title: {
    ...Typography.h3,
    fontSize: 18,
    color: '#1E252B',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: '#66737C',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: '#E86A58',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.full,
  },
  buttonText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
