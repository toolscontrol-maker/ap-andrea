import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../context/DevContext';
import { LocationPrecision } from '@andrea/types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Button } from '../../../components/ui';

const CATEGORIES = [
  { id: 'viaje', label: '✈️ Gran Viaje' },
  { id: 'escapada', label: '🌿 Escapada' },
  { id: 'cita', label: '🍷 Cita romántica' },
  { id: 'primer_encuentro', label: '💫 Donde empezó todo' },
  { id: 'especial', label: '✨ Rincón especial' },
] as const;

const MOODS = [
  { id: 'love', label: '❤️ Amor' },
  { id: 'excited', label: '✨ Ilusión' },
  { id: 'calm', label: '🌿 Calma' },
  { id: 'grateful', label: '🙏 Gratitud' },
] as const;

const SAMPLE_CURATED_PHOTOS = [
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&auto=format&fit=crop',
];

export function AddMemoryFlow() {
  const router = useRouter();
  const { addPlace, partnerDevUser } = useDev();

  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('España');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'viaje' | 'cita' | 'especial' | 'escapada' | 'primer_encuentro'>('viaje');
  const [moodTag, setMoodTag] = useState<'love' | 'grateful' | 'happy' | 'calm' | 'excited'>('love');
  const [precision, setPrecision] = useState<LocationPrecision>('exact');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddSamplePhoto = () => {
    const randomPhoto = SAMPLE_CURATED_PHOTOS[Math.floor(Math.random() * SAMPLE_CURATED_PHOTOS.length)];
    if (!photos.includes(randomPhoto)) {
      setPhotos((prev) => [...prev, randomPhoto]);
    }
  };

  const handleRemovePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSave = () => {
    if (!cityName.trim()) {
      Alert.alert('Ciudad requerida', 'Indica en qué ciudad o lugar ocurrió este recuerdo.');
      return;
    }

    let lat = 40.4168 + (Math.random() - 0.5) * 8;
    let lng = -3.7038 + (Math.random() - 0.5) * 16;

    const lowerCountry = (country + ' ' + cityName).toLowerCase();
    if (lowerCountry.includes('italia') || lowerCountry.includes('roma')) { lat = 41.9028; lng = 12.4964; }
    else if (lowerCountry.includes('francia') || lowerCountry.includes('parís') || lowerCountry.includes('paris')) { lat = 48.8566; lng = 2.3522; }
    else if (lowerCountry.includes('japón') || lowerCountry.includes('japon') || lowerCountry.includes('kioto') || lowerCountry.includes('tokio')) { lat = 35.0116; lng = 135.7681; }
    else if (lowerCountry.includes('bali') || lowerCountry.includes('indonesia')) { lat = -8.5069; lng = 115.2625; }
    else if (lowerCountry.includes('granada')) { lat = 37.1773; lng = -3.5986; }

    addPlace({
      cityName: cityName.trim(),
      country: country.trim(),
      title: title.trim() || `Nuestro momento en ${cityName.trim()}`,
      story: story.trim() || `Un día inolvidable juntos en ${cityName.trim()}.`,
      category,
      moodTag,
      date,
      lat,
      lng,
      photos: photos.length > 0 ? photos : undefined,
      locationPrecision: precision,
      visibility: 'couple',
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Recuerdo en el Mapa</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Step 1: Photos */}
      <View style={styles.sectionCard}>
        <Text style={styles.stepNumber}>PASO 1</Text>
        <Text style={styles.sectionTitle}>Añade un recuerdo visual</Text>
        <Text style={styles.sectionSub}>Fotos de aquel día o rincón especial</Text>

        <View style={styles.photosGrid}>
          {photos.map((p, idx) => (
            <View key={idx} style={styles.photoThumbWrapper}>
              <Image source={{ uri: p }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.photoDeleteBtn} onPress={() => handleRemovePhoto(p)}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addPhotoBox} onPress={handleAddSamplePhoto} activeOpacity={0.7}>
            <Text style={{ fontSize: 22, marginBottom: 2 }}>📸</Text>
            <Text style={styles.addPhotoText}>Añadir foto</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 2: Location */}
      <View style={styles.sectionCard}>
        <Text style={styles.stepNumber}>PASO 2</Text>
        <Text style={styles.sectionTitle}>¿Dónde ocurrió?</Text>
        
        <Text style={styles.fieldLabel}>Ciudad o Lugar</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Roma, Kioto, San Sebastián, Sevilla..."
          placeholderTextColor="#9B8E98"
          value={cityName}
          onChangeText={setCityName}
        />

        <Text style={styles.fieldLabel}>País</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. España, Italia, Francia, Japón..."
          placeholderTextColor="#9B8E98"
          value={country}
          onChangeText={setCountry}
        />
      </View>

      {/* Step 3: Story */}
      <View style={styles.sectionCard}>
        <Text style={styles.stepNumber}>PASO 3</Text>
        <Text style={styles.sectionTitle}>¿Qué queréis recordar?</Text>

        <Text style={styles.fieldLabel}>Título del momento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Aquella cena bajo los farolillos"
          placeholderTextColor="#9B8E98"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.fieldLabel}>Vuestra historia (sin prisas)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={`Escribe lo que sentisteis, la anécdota o lo que te gustaría que ${partnerDevUser.name} y tú recordéis siempre...`}
          placeholderTextColor="#9B8E98"
          value={story}
          onChangeText={setStory}
          multiline
        />
      </View>

      {/* Step 4: Date & Meaning */}
      <View style={styles.sectionCard}>
        <Text style={styles.stepNumber}>PASO 4</Text>
        <Text style={styles.sectionTitle}>Fecha y Significado</Text>

        <Text style={styles.fieldLabel}>Fecha (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-08-23"
          placeholderTextColor="#9B8E98"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.fieldLabel}>Tipo de momento</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, category === cat.id && styles.categoryChipSelected]}
              onPress={() => setCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryChipText, category === cat.id && styles.categoryChipTextSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>¿Cómo os hizo sentir?</Text>
        <View style={styles.chipsRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.moodChip, moodTag === m.id && styles.moodChipSelected]}
              onPress={() => setMoodTag(m.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.moodChipText, moodTag === m.id && styles.moodChipTextSelected]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step 5: Precision */}
      <View style={styles.sectionCard}>
        <Text style={styles.stepNumber}>PASO 5</Text>
        <Text style={styles.sectionTitle}>Privacidad del lugar</Text>
        <View style={styles.precisionRow}>
          {[
            { id: 'exact', label: '📍 Exacta' },
            { id: 'approximate', label: '🌿 Zona aproximada' },
            { id: 'private', label: '🔒 Privada' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.precisionPill, precision === item.id && styles.precisionPillSelected]}
              onPress={() => setPrecision(item.id as LocationPrecision)}
              activeOpacity={0.7}
            >
              <Text style={[styles.precisionText, precision === item.id && styles.precisionTextSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save CTA */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleSave}
        style={{ marginBottom: Spacing['3xl'], marginTop: Spacing.md }}
      >
        Guardar recuerdo en el mapa ✨
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(43, 33, 41, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#1E252B',
    fontWeight: '800',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: '#1E252B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
  },
  stepNumber: {
    ...Typography.overline,
    fontSize: 10,
    letterSpacing: 1.1,
    color: '#E86A58',
    marginBottom: 2,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: '#1E252B',
    marginBottom: 2,
  },
  sectionSub: {
    ...Typography.caption,
    color: '#66737C',
    marginBottom: Spacing.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  photoThumbWrapper: {
    position: 'relative',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: Radii.lg,
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 27, 32, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBox: {
    width: 80,
    height: 80,
    borderRadius: Radii.lg,
    backgroundColor: '#FAF6F0',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(43, 33, 41, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    ...Typography.caption,
    fontSize: 10,
    color: '#66737C',
    fontWeight: '700',
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: '#1E252B',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  input: {
    backgroundColor: '#FAF6F0',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Typography.body,
    fontSize: 14,
    color: '#1E252B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  categoryChipSelected: {
    backgroundColor: '#4A7C9B',
    borderColor: '#4A7C9B',
  },
  categoryChipText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: '#1E252B',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  moodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  moodChipSelected: {
    backgroundColor: '#E86A58',
    borderColor: '#E86A58',
  },
  moodChipText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: '#1E252B',
  },
  moodChipTextSelected: {
    color: '#FFFFFF',
  },
  precisionRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginTop: Spacing.sm,
  },
  precisionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.lg,
    backgroundColor: '#FAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  precisionPillSelected: {
    backgroundColor: '#E86A58',
    borderColor: '#E86A58',
  },
  precisionText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: '#1E252B',
  },
  precisionTextSelected: {
    color: '#FFFFFF',
  },
});
