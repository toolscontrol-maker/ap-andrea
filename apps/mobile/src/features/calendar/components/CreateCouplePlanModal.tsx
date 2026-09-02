import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDev } from '../../../context/DevContext';
import { UniversalEventType } from '../domain/calendar.types';
import { AddCoupleEventPayload, CoupleEventType } from '@andrea/types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { Button } from '../../../components/ui';
import { PhotoUploadField } from '../../../components/ui/PhotoUploadField';
import { IconMapPin, IconCalendar, IconSparkles } from '../../../components/ui/Icons';

interface CreateCouplePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (payload: AddCoupleEventPayload) => void;
  initialType?: UniversalEventType;
  initialDate?: string;
  partnerName: string;
}

interface PlanTypeOption {
  id: UniversalEventType;
  eventType: CoupleEventType;
  label: string;
  emoji: string;
  color: string;
  defaultTitle: string;
}

const PLAN_TYPE_OPTIONS: PlanTypeOption[] = [
  {
    id: 'date',
    eventType: 'shared_plan',
    label: '🍷 Plan o Cita',
    emoji: '🍷',
    color: '#E05666',
    defaultTitle: 'Cena romántica juntos',
  },
  {
    id: 'restaurant',
    eventType: 'shared_plan',
    label: '🍽️ Reserva / Restaurante',
    emoji: '🍽️',
    color: '#D4AF37',
    defaultTitle: 'Mesa en restaurante',
  },
  {
    id: 'trip',
    eventType: 'future_trip',
    label: '✈️ Viaje o Escapada',
    emoji: '✈️',
    color: '#5C9F9A',
    defaultTitle: 'Escapada de fin de semana',
  },
  {
    id: 'important_date',
    eventType: 'important_date',
    label: '✨ Fecha Especial',
    emoji: '✨',
    color: '#D4AF37',
    defaultTitle: 'Celebración especial',
  },
  {
    id: 'reminder',
    eventType: 'shared_plan',
    label: '📌 Recordatorio Básico',
    emoji: '📌',
    color: '#83A98C',
    defaultTitle: 'Recordatorio para los dos',
  },
  {
    id: 'memory',
    eventType: 'ritual',
    label: '🌿 Recuerdo de Hoy',
    emoji: '📷',
    color: '#6D9E7B',
    defaultTitle: 'Recuerdo del día',
  },
];

export function CreateCouplePlanModal({
  visible,
  onClose,
  onSuccess,
  initialType = 'date',
  initialDate,
  partnerName,
}: CreateCouplePlanModalProps) {
  const { savedPlaces, currentDevUser, addSavedPlace } = useDev();

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedType, setSelectedType] = useState<UniversalEventType>(initialType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || todayStr);
  const [time, setTime] = useState('21:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [invitedBy, setInvitedBy] = useState<'me' | 'partner' | 'both'>('me');

  useEffect(() => {
    if (visible) {
      setSelectedType(initialType);
      if (initialDate) setDate(initialDate);
      if (initialType === 'restaurant') {
        setTime('21:30');
      } else if (initialType === 'memory') {
        setTime('22:00');
      } else {
        setTime('20:30');
      }
    }
  }, [visible, initialType, initialDate]);

  if (!visible) return null;

  const currentOption =
    PLAN_TYPE_OPTIONS.find((p) => p.id === selectedType) || PLAN_TYPE_OPTIONS[0];

  // Quick Restaurant Suggestions from couple saved places
  const restaurantSuggestions = savedPlaces
    .filter((p) => p.category === 'restaurant' || p.category === 'cafe' || p.category === 'bar')
    .slice(0, 6);

  const handleSave = () => {
    if (!title.trim()) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');

    const whoInvitedStr =
      invitedBy === 'me'
        ? `Invita ${currentDevUser.name}`
        : invitedBy === 'partner'
        ? `Invita ${partnerName}`
        : 'Plan de los dos';

    const subtitleText = notes.trim()
      ? `${whoInvitedStr} · ${notes.trim()}`
      : whoInvitedStr;

    // If restaurant and not already in savedPlaces, add it
    if (selectedType === 'restaurant' && location.trim()) {
      const alreadySaved = savedPlaces.some(
        (p) => p.name.toLowerCase() === title.trim().toLowerCase()
      );
      if (!alreadySaved) {
        addSavedPlace({
          name: title.trim(),
          category: 'restaurant',
          status: 'want_to_go',
          city: location.trim() || 'Valencia',
          note: notes.trim() || undefined,
        });
      }
    }

    onSuccess({
      eventType: currentOption.eventType,
      date,
      time: time.trim() || undefined,
      title: title.trim(),
      subtitle: subtitleText,
      location: location.trim() || undefined,
      notes: notes.trim() ? [notes.trim()] : undefined,
    });

    // Reset & close
    setTitle('');
    setLocation('');
    setNotes('');
    setPhotoUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <TouchableOpacity style={styles.backdropOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
              <View>
                <Text style={styles.title}>Guardar en el Calendario</Text>
                <Text style={styles.subtitle}>
                  Para disfrutar juntos y recordar siempre
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={{ fontSize: 13, color: '#66737C', fontWeight: '800' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Step 1: Type Selector */}
              <Text style={styles.stepLabel}>1. TIPO DE PLAN O CITA</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeScroll}
              >
                {PLAN_TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedType === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.typePill,
                        isSelected && {
                          backgroundColor: `${opt.color}18`,
                          borderColor: opt.color,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setSelectedType(opt.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          isSelected && { color: opt.color, fontWeight: '800' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Step 2: Title & Context */}
              <Text style={styles.stepLabel}>
                2.{' '}
                {selectedType === 'restaurant'
                  ? 'NOMBRE DEL RESTAURANTE O LOCAL *'
                  : selectedType === 'trip'
                  ? 'DESTINO DE LA ESCAPADA *'
                  : selectedType === 'memory'
                  ? 'TÍTULO DEL RECUERDO DE HOY *'
                  : 'TÍTULO DE LA CITA O PLAN *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={
                  selectedType === 'restaurant'
                    ? 'ej. Alqueria del Pou / Sacha / Don Salvatore'
                    : selectedType === 'trip'
                    ? 'ej. Escapada a Menorca / Cabaña Dolomitas'
                    : selectedType === 'memory'
                    ? 'ej. Tarde de risas en el parque y merienda'
                    : 'ej. Cena romántica en terraza / Cine y paseo'
                }
                placeholderTextColor="#9B8E98"
                value={title}
                onChangeText={setTitle}
              />

              {/* Quick Restaurant Chips */}
              {selectedType === 'restaurant' && restaurantSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>
                    💡 De vuestros restaurantes guardados:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionsScroll}
                  >
                    {restaurantSuggestions.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        style={styles.suggChip}
                        onPress={() => {
                          triggerHaptic('light');
                          setTitle(place.name);
                          if (place.city) setLocation(place.city);
                        }}
                      >
                        <Text style={styles.suggChipText}>🍽️ {place.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Step 3: Date and Time */}
              <Text style={styles.stepLabel}>3. FECHA Y HORA</Text>
              <View style={styles.twoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldTitle}>Fecha (AAAA-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={todayStr}
                    placeholderTextColor="#9B8E98"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
                <View style={{ width: 110 }}>
                  <Text style={styles.fieldTitle}>Hora</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="21:00"
                    placeholderTextColor="#9B8E98"
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>

              {/* Step 4: Location */}
              <Text style={styles.stepLabel}>4. LUGAR O DIRECCIÓN (OPCIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Ruzafa, Valencia / En casa / Paseo Alameda"
                placeholderTextColor="#9B8E98"
                value={location}
                onChangeText={setLocation}
              />

              {/* Step 5: Who is inviting */}
              <Text style={styles.stepLabel}>5. ¿QUIÉN LO PROPONE O INVITA?</Text>
              <View style={styles.invitedByRow}>
                {[
                  { id: 'me', label: `❤️ ${currentDevUser.name}` },
                  { id: 'partner', label: `💖 ${partnerName}` },
                  { id: 'both', label: '✨ Los dos' },
                ].map((inv) => (
                  <TouchableOpacity
                    key={inv.id}
                    style={[
                      styles.invitedChip,
                      invitedBy === inv.id && styles.invitedChipActive,
                    ]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setInvitedBy(inv.id as any);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.invitedChipText,
                        invitedBy === inv.id && styles.invitedChipTextActive,
                      ]}
                    >
                      {inv.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 6: Notes or Dedication */}
              <Text style={styles.stepLabel}>6. NOTAS O DETALLES</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="ej. Llevar ropa cómoda, reservar mesa en terraza..."
                placeholderTextColor="#9B8E98"
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              {/* Save CTA */}
              <Button
                variant="primary"
                size="lg"
                onPress={handleSave}
                style={{ marginTop: Spacing.lg, marginBottom: Spacing['3xl'] }}
              >
                {selectedType === 'restaurant'
                  ? 'Guardar reserva en el Calendario 🍽️'
                  : selectedType === 'memory'
                  ? 'Guardar recuerdo de hoy 🌿'
                  : 'Guardar plan en el Calendario ✨'}
              </Button>
            </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '92%',
    paddingTop: Spacing.md,
    ...Shadows.lg,
    zIndex: 10,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(43, 33, 41, 0.06)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2129',
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(43, 33, 41, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  typeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.lg,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  typePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4A3E47',
  },
  fieldTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B2129',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2B2129',
    marginBottom: Spacing.xs,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  suggestionsContainer: {
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  suggestionsTitle: {
    fontSize: 11.5,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionsScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  suggChip: {
    backgroundColor: '#FFF8F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 130, 106, 0.2)',
  },
  suggChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  invitedByRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  invitedChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.md,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitedChipActive: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  invitedChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4A3E47',
  },
  invitedChipTextActive: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
});
