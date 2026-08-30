import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { Colors } from '../../../src/theme/colors';
import { Radii, Spacing, Typography } from '../../../src/theme/tokens';
import { ScreenWrapper, SectionHeader, Input, Button } from '../../../src/components/ui';

const OCCASIONS = ['cumpleaños', 'aniversario', 'sin_ocasión', 'reconciliación', 'logro', 'otro'] as const;

export default function NewSurpriseScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState<typeof OCCASIONS[number]>('aniversario');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const { addSurprise, partnerDevUser } = useDev();
  const router = useRouter();

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa un título y una descripción para la sorpresa.');
      return;
    }

    const budgetRange: [number, number] | undefined =
      minBudget || maxBudget ? [Number(minBudget) || 0, Number(maxBudget) || 0] : undefined;

    addSurprise({
      type: 'surprise',
      visibility: 'private',
      content: {
        title: title.trim(),
        description: description.trim(),
        occasion,
        budgetRange,
        status: 'idea'
      },
      moodTag: 'excited'
    });

    router.back();
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Nueva Idea Secreta"
        subtitle={`Prepara un detalle con cariño para ${partnerDevUser.name}`}
      />

      <View style={styles.secretNotice}>
        <Text style={styles.secretIcon}>🔒</Text>
        <Text style={styles.secretText}>
          Esta nota está guardada como borrador privado en tu dispositivo. {partnerDevUser.name} no podrá verla hasta que decidas entregársela.
        </Text>
      </View>

      <Input
        label="Título de la Idea"
        placeholder="Ej. Fin de semana en una cabaña con chimenea"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Ocasión</Text>
      <View style={styles.occasionsRow}>
        {OCCASIONS.map((occ) => {
          const isSelected = occasion === occ;
          return (
            <TouchableOpacity
              key={occ}
              style={[styles.occChip, isSelected && styles.occChipSelected]}
              onPress={() => setOccasion(occ)}
              activeOpacity={0.7}
            >
              <Text style={[styles.occChipText, isSelected && styles.occChipTextSelected]}>
                {occ.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Input
        label="Detalles y Notas Secretas"
        hint="Actividades planeadas, ideas, posibles fechas..."
        placeholder="Escribe los detalles con total libertad..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Presupuesto Estimado (€)</Text>
      <View style={styles.budgetRow}>
        <Input
          containerStyle={{ flex: 1 }}
          placeholder="Mín (€)"
          value={minBudget}
          onChangeText={setMinBudget}
          keyboardType="numeric"
        />
        <Text style={styles.budgetDash}>—</Text>
        <Input
          containerStyle={{ flex: 1 }}
          placeholder="Máx (€)"
          value={maxBudget}
          onChangeText={setMaxBudget}
          keyboardType="numeric"
        />
      </View>

      <Button
        variant="primary"
        size="lg"
        onPress={handleSave}
        style={{ marginTop: Spacing.md }}
      >
        Guardar Idea Secreta 🎁
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  secretNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.butterLight,
    borderWidth: 1,
    borderColor: 'rgba(244, 201, 93, 0.4)',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  secretIcon: {
    fontSize: 16,
  },
  secretText: {
    ...Typography.caption,
    color: '#8A6812',
    flex: 1,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  occasionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  occChip: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  occChipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  occChipText: {
    ...Typography.caption,
    textTransform: 'capitalize',
    color: Colors.light.textSecondary,
  },
  occChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  budgetDash: {
    color: Colors.light.textMuted,
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
});
