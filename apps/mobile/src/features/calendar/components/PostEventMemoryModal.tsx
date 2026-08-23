import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../context/DevContext';
import { SanitizedEventItem } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Button } from '../../../components/ui';

interface PostEventMemoryModalProps {
  visible: boolean;
  event: SanitizedEventItem | null;
  onClose: () => void;
}

export function PostEventMemoryModal({
  visible,
  event,
  onClose,
}: PostEventMemoryModalProps) {
  const router = useRouter();
  const { addPlace } = useDev();

  if (!visible || !event) return null;

  const handleSaveToMap = () => {
    triggerHaptic('success');
    addPlace({
      cityName: event.locationName || 'Ciudad especial',
      country: 'España',
      title: event.title,
      story: `Vivimos este momento especial juntos: ${event.title}.`,
      date: event.date,
      category: event.eventType === 'surprise' ? 'cita' : 'viaje',
      moodTag: 'love',
      locationPrecision: 'exact',
      visibility: 'couple',
    });
    onClose();
    router.push('/(tabs)/map');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 26 }}>✨</Text>
          </View>

          <Text style={styles.title}>¡Momento vivido juntos!</Text>
          <Text style={styles.subtitle}>
            Habéis completado "{event.title}". ¿Queréis inmortalizar este momento en vuestra historia compartida?
          </Text>

          <View style={styles.buttonsColumn}>
            <Button
              variant="primary"
              size="md"
              onPress={handleSaveToMap}
            >
              🗺️ Añadir chincheta al Mapa
            </Button>

            <Button
              variant="ghost"
              size="md"
              onPress={onClose}
            >
              Ahora no
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDEEEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 19,
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
    marginBottom: Spacing.xl,
  },
  buttonsColumn: {
    width: '100%',
    gap: Spacing.xs,
  },
});
