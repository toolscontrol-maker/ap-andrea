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
import { SurpriseCreationPayload } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { Button } from '../../../components/ui';

interface CreateSurpriseFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (surprise: SurpriseCreationPayload) => void;
  initialTitle?: string;
  initialCategory?: 'cena' | 'regalo' | 'flores' | 'escapada' | 'plan_juntos' | 'carta' | 'especial';
  initialDate?: string;
  initialTime?: string;
  initialLocation?: string;
  initialNotes?: string;
}

const SURPRISE_TYPES = [
  { id: 'cena', label: '🍷 Cena especial', icon: '🍷' },
  { id: 'regalo', label: '🎁 Regalo', icon: '🎁' },
  { id: 'flores', label: '💐 Flores sorpresa', icon: '💐' },
  { id: 'escapada', label: '✈️ Escapada', icon: '✈️' },
  { id: 'plan_juntos', label: '🎬 Plan juntos', icon: '🎬' },
  { id: 'carta', label: '💌 Carta o Nota', icon: '💌' },
  { id: 'especial', label: '✨ Algo diferente', icon: '✨' },
] as const;

const REVEAL_OPTIONS = [
  { id: 'one_day_before', label: 'Un día antes', desc: 'Recibirá una notificación 24h antes del plan' },
  { id: 'same_day_morning', label: 'El mismo día por la mañana', desc: 'Para despertarse con una bonita señal' },
  { id: 'specific_time', label: 'A la hora del plan', desc: 'Se desvelará justo al comenzar' },
  { id: 'custom_date', label: '📅 En una fecha y hora exacta', desc: 'Elige el día y hora exactos para desvelarla' },
  { id: 'manual', label: 'Solo cuando yo lo revele', desc: 'Tú controlas el momento exacto' },
  { id: 'now', label: 'Ahora mismo', desc: 'Visible desde este momento' },
] as const;

export function CreateSurpriseFlow({
  visible,
  onClose,
  onSuccess,
  initialTitle,
  initialCategory,
  initialDate,
  initialTime,
  initialLocation,
  initialNotes,
}: CreateSurpriseFlowProps) {
  const { partnerDevUser } = useDev();

  const todayStr = new Date().toISOString().split('T')[0];

  const [category, setCategory] = useState<'cena' | 'regalo' | 'flores' | 'escapada' | 'plan_juntos' | 'carta' | 'especial'>(
    initialCategory || 'cena'
  );
  const [title, setTitle] = useState(initialTitle || '');
  const [date, setDate] = useState(initialDate || todayStr);
  const [time, setTime] = useState(initialTime || '21:00');
  const [location, setLocation] = useState(initialLocation || '');
  const [revealOption, setRevealOption] = useState<'now' | 'one_day_before' | 'same_day_morning' | 'specific_time' | 'manual' | 'custom_date'>('one_day_before');
  const [revealDate, setRevealDate] = useState(initialDate || todayStr);
  const [revealTime, setRevealTime] = useState('12:00');
  const [visibilityPreset, setVisibilityPreset] = useState<'total_secret' | 'gentle_hint' | 'visible_plan'>('gentle_hint');
  const [privateNotes, setPrivateNotes] = useState(initialNotes || '');

  useEffect(() => {
    if (visible) {
      if (initialTitle) setTitle(initialTitle);
      if (initialCategory) setCategory(initialCategory);
      if (initialDate) {
        setDate(initialDate);
        setRevealDate(initialDate);
      }
      if (initialTime) setTime(initialTime);
      if (initialLocation) setLocation(initialLocation);
      if (initialNotes) setPrivateNotes(initialNotes);
    }
  }, [visible, initialTitle, initialCategory, initialDate, initialTime, initialLocation, initialNotes]);

  if (!visible) return null;

  const handleSave = () => {
    triggerHaptic('success');
    const notesArray = privateNotes
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSuccess({
      category,
      title: title.trim() || `Sorpresa especial para ${partnerDevUser.name}`,
      date,
      time,
      location: location.trim() || undefined,
      notes: notesArray.length > 0 ? notesArray : ['Reservar y preparar detalles'],
      revealOption,
      revealDate: revealOption === 'custom_date' ? revealDate : undefined,
      revealTime: revealOption === 'custom_date' ? revealTime : undefined,
      visibilityPreset,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.grabber} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Preparar una Sorpresa</Text>
                <Text style={styles.subtitle}>Para sorprender con cariño a {partnerDevUser.name}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={{ fontSize: 13, color: '#66737C', fontWeight: '800' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Step 1: Type */}
              <Text style={styles.stepLabel}>PASO 1 · TIPO DE SORPRESA</Text>
              <View style={styles.chipsGrid}>
                {SURPRISE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeChip, category === t.id && styles.typeChipSelected]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setCategory(t.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipText, category === t.id && styles.typeChipTextSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 2: Real Event Timing & Details */}
              <Text style={styles.stepLabel}>PASO 2 · ¿CUÁNDO OCURRE?</Text>
              <Text style={styles.fieldTitle}>Título de tu sorpresa (solo para ti al inicio)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Cena romántica en terraza con vistas"
                placeholderTextColor="#9B8E98"
                value={title}
                onChangeText={setTitle}
              />

              <View style={styles.twoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldTitle}>Fecha del plan (AAAA-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-08-29"
                    placeholderTextColor="#9B8E98"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
                <View style={{ width: 100 }}>
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

              <Text style={styles.fieldTitle}>Lugar o Restaurante (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Restaurante Mirador / Cesta de picnic"
                placeholderTextColor="#9B8E98"
                value={location}
                onChangeText={setLocation}
              />

              {/* Step 3: When to Reveal */}
              <Text style={styles.stepLabel}>PASO 3 · ¿CUÁNDO SE REVELA?</Text>
              <View style={styles.optionsList}>
                {REVEAL_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.radioCard, revealOption === r.id && styles.radioCardSelected]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setRevealOption(r.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, revealOption === r.id && styles.radioCircleSelected]}>
                      {revealOption === r.id && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.radioTitle, revealOption === r.id && styles.radioTitleSelected]}>
                        {r.label}
                      </Text>
                      <Text style={styles.radioDesc}>{r.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Reveal Date & Time Picker */}
              {revealOption === 'custom_date' && (
                <View style={styles.customRevealContainer}>
                  <Text style={styles.customRevealHeading}>Elige cuándo desvelar la sorpresa</Text>
                  <View style={styles.twoCols}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldTitle}>Fecha de revelación (AAAA-MM-DD)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={todayStr}
                        placeholderTextColor="#9B8E98"
                        value={revealDate}
                        onChangeText={setRevealDate}
                      />
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={styles.fieldTitle}>Hora</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="12:00"
                        placeholderTextColor="#9B8E98"
                        value={revealTime}
                        onChangeText={setRevealTime}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Step 4: What partner sees beforehand */}
              <Text style={styles.stepLabel}>PASO 4 · QUÉ VE {partnerDevUser.name.toUpperCase()} ANTES DE LA REVELACIÓN</Text>
              <View style={styles.visibilityRow}>
                {[
                  { id: 'total_secret', label: '🔒 Secreto total', desc: 'Solo alerta general' },
                  { id: 'gentle_hint', label: '✨ Pista suave', desc: 'Verá día y señal' },
                  { id: 'visible_plan', label: '🍷 Plan visible', desc: 'Mayor parte visible' },
                ].map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.vCard, visibilityPreset === v.id && styles.vCardSelected]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setVisibilityPreset(v.id as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.vCardTitle, visibilityPreset === v.id && styles.vCardTitleSelected]}>
                      {v.label}
                    </Text>
                    <Text style={styles.vCardDesc}>{v.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 5: Private Checklist */}
              <Text style={styles.stepLabel}>PASO 5 · NOTAS PRIVADAS PARA TI</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="- Reservar mesa en restaurante&#10;- Comprar flores de camino&#10;- Llevar la cámara cargada"
                placeholderTextColor="#9B8E98"
                value={privateNotes}
                onChangeText={setPrivateNotes}
                multiline
              />

              {/* Save CTA */}
              <Button
                variant="primary"
                size="lg"
                onPress={handleSave}
                style={{ marginTop: Spacing.lg, marginBottom: Spacing['3xl'] }}
              >
                Guardar sorpresa ✨
              </Button>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    maxHeight: '92%',
    paddingTop: Spacing.md,
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
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(43, 33, 41, 0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipSelected: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3E47',
  },
  typeChipTextSelected: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  fieldTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2B2129',
    marginTop: Spacing.xs,
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
  optionsList: {
    gap: 8,
    marginBottom: Spacing.xs,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radii.lg,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
    gap: 10,
  },
  radioCardSelected: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(43, 33, 41, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.light.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  radioTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2B2129',
  },
  radioTitleSelected: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  radioDesc: {
    fontSize: 11.5,
    color: '#7D707B',
    marginTop: 2,
  },
  customRevealContainer: {
    backgroundColor: '#FFF8F5',
    borderRadius: Radii.lg,
    padding: 12,
    marginTop: 4,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(239, 130, 106, 0.25)',
  },
  customRevealHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 6,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  vCard: {
    flex: 1,
    padding: 10,
    borderRadius: Radii.md,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
  },
  vCardSelected: {
    backgroundColor: '#FFF5F2',
    borderColor: Colors.light.primary,
  },
  vCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4A3E47',
    marginBottom: 2,
  },
  vCardTitleSelected: {
    color: Colors.light.primary,
  },
  vCardDesc: {
    fontSize: 10,
    color: '#7D707B',
    lineHeight: 13,
  },
});
