import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { Colors } from '../../../src/theme/colors';
import { Radii, Spacing, Typography } from '../../../src/theme/tokens';
import { ScreenWrapper, SectionHeader, Input, Button } from '../../../src/components/ui';
import { CoupleEventType } from '@andrea/types';

const EVENT_TYPES: { id: CoupleEventType; label: string }[] = [
  { id: 'shared_plan', label: '🍷 Cita romántica' },
  { id: 'important_date', label: '❤️ Aniversario / Cumpleaños' },
  { id: 'future_trip', label: '✈️ Viaje o escapada' },
  { id: 'ritual', label: '🌿 Ritual cotidiano' },
  { id: 'surprise', label: '🎁 Plan sorpresa' },
];

export default function NewCalendarEventScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [type, setType] = useState<CoupleEventType>('shared_plan');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const { addCoupleEvent } = useDev();
  const router = useRouter();

  const handleSave = () => {
    if (!title.trim() || !date.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa un título y una fecha para el evento.');
      return;
    }

    const notesArray = notes
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addCoupleEvent({
      eventType: type,
      title: title.trim(),
      date: date.trim(),
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      notes: notesArray.length > 0 ? notesArray : undefined,
    });

    router.back();
  };

  return (
    <ScreenWrapper>
      <SectionHeader
        title="Añadir Momento al Calendario"
        subtitle="Fechas señaladas, aniversarios o planes para esperar con ilusión"
      />

      <Input
        label="Título del Plan / Hito"
        placeholder="Ej. Cena en el mirador, Vuelo a Roma..."
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Tipo de Momento</Text>
      <View style={styles.typesRow}>
        {EVENT_TYPES.map((t) => {
          const isSelected = type === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeChip, isSelected && styles.typeChipSelected]}
              onPress={() => setType(t.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Input
        label="Fecha (AAAA-MM-DD)"
        placeholder="2026-08-29"
        value={date}
        onChangeText={setDate}
      />

      <Input
        label="Hora (Opcional)"
        placeholder="Ej. 20:30, Todo el día..."
        value={time}
        onChangeText={setTime}
      />

      <Input
        label="Lugar (Opcional)"
        placeholder="Ej. Restaurante italiano, en el salón..."
        value={location}
        onChangeText={setLocation}
      />

      <Input
        label="Notas o Recordatorio (Opcional)"
        placeholder="Detalles sobre qué llevar, vestimenta, reserva..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Button
        variant="primary"
        size="lg"
        onPress={handleSave}
        style={{ marginTop: Spacing.md }}
      >
        Guardar en el Calendario ✨
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  label: {
    ...Typography.captionBold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeChip: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  typeChipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeChipText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
