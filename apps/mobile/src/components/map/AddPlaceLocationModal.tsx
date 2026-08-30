import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import {
  searchMapboxPlaces,
  reverseGeocodeCoordinates,
  GeocodingResult,
  getMapboxToken,
} from '../../services/mapboxGeocoding';
import { AndreaMapPlace, MapPlaceType, LocationPrecision, LocationSource } from '../../types/map';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';
import { IconMapPin, IconCheck } from '../ui/Icons';

interface AddPlaceLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePlace: (place: AndreaMapPlace) => void;
  initialPlace?: AndreaMapPlace | null; // For editing existing pins!
}

type ModalStep = 'search' | 'confirm_pin' | 'details';

export function AddPlaceLocationModal({
  visible,
  onClose,
  onSavePlace,
  initialPlace,
}: AddPlaceLocationModalProps) {
  const [step, setStep] = useState<ModalStep>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searchContext, setSearchContext] = useState<'valencia' | 'global'>('valencia');

  // Location verified state
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number]>([
    -0.3763, 39.4699,
  ]); // [lng, lat]
  const [verifiedName, setVerifiedName] = useState('');
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [verifiedCity, setVerifiedCity] = useState('Valencia');
  const [verifiedCountry, setVerifiedCountry] = useState('España');
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('exact');
  const [locationSource, setLocationSource] = useState<LocationSource>('mapbox_search');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Details state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MapPlaceType>('memory');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Web Map reference for interactive pin adjustment
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapboxInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (visible) {
      if (initialPlace) {
        setTitle(initialPlace.title);
        setVerifiedName(initialPlace.title);
        setVerifiedAddress(initialPlace.formattedAddress || initialPlace.subtitle || '');
        setVerifiedCity(initialPlace.city || 'Valencia');
        setSelectedCoordinates([initialPlace.longitude, initialPlace.latitude]);
        setLocationPrecision(initialPlace.precision || 'exact');
        setLocationSource(initialPlace.source || 'manual_pin');
        setType(initialPlace.type || 'memory');
        setDate(initialPlace.date || new Date().toISOString().split('T')[0]);
        setDescription(initialPlace.description || '');
        setPhotoUrl(initialPlace.imageUrl || null);
        setStep('confirm_pin');
      } else {
        setStep('search');
        setSearchQuery('');
        setResults([]);
        setTitle('');
        setDescription('');
        setPhotoUrl(null);
        setType('memory');
        setSelectedCoordinates([-0.3763, 39.4699]);
        setLocationPrecision('exact');
        setLocationSource('mapbox_search');
      }
    }
  }, [visible, initialPlace]);

  // Debounced forward geocoding search
  useEffect(() => {
    if (step !== 'search' || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchMapboxPlaces(searchQuery, {
        country: searchContext === 'valencia' ? 'ES' : undefined,
        proximity: searchContext === 'valencia' ? [-0.3763, 39.4699] : undefined,
      });
      setResults(res);
      setIsSearching(false);
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery, searchContext, step]);

  // Interactive Web Map for Pin Confirmation
  useEffect(() => {
    if (step !== 'confirm_pin' || Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isMounted = true;

    async function initMiniMap() {
      if (!mapContainerRef.current) return;

      // 1. Ensure Mapbox CSS is loaded
      if (!document.getElementById('mapbox-gl-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-gl-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      // 2. Ensure Mapbox JS is loaded
      if (!(window as any).mapboxgl) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.head.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current) return;

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;

      mapboxgl.accessToken = getMapboxToken();

      // Clean old instance
      if (mapboxInstanceRef.current) {
        mapboxInstanceRef.current.remove();
        mapboxInstanceRef.current = null;
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: selectedCoordinates,
        zoom: locationPrecision === 'city' ? 11 : 15.5,
        attributionControl: false,
      });

      // Draggable / Interactive Marker
      const el = document.createElement('div');
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#E05666';
      el.style.border = '2.5px solid #FFFFFF';
      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.45)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '17px';
      el.style.cursor = 'grab';
      el.innerHTML = type === 'restaurant' ? '🍽️' : '📍';

      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(selectedCoordinates)
        .addTo(map);

      markerInstanceRef.current = marker;

      // On Drag End -> Reverse Geocode coordinates
      marker.on('dragend', async () => {
        const lngLat = marker.getLngLat();
        setSelectedCoordinates([lngLat.lng, lngLat.lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeCoordinates(lngLat.lng, lngLat.lat);
        setVerifiedAddress(rev.formattedAddress);
        setVerifiedCity(rev.city || 'Valencia');
        setVerifiedCountry(rev.country || 'España');
        setIsReverseGeocoding(false);
      });

      // On Map Click -> Reposition marker & reverse geocode
      map.on('click', async (e: any) => {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        setSelectedCoordinates([e.lngLat.lng, e.lngLat.lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeCoordinates(e.lngLat.lng, e.lngLat.lat);
        setVerifiedAddress(rev.formattedAddress);
        setVerifiedCity(rev.city || 'Valencia');
        setVerifiedCountry(rev.country || 'España');
        setIsReverseGeocoding(false);
      });

      mapboxInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      initMiniMap();
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapboxInstanceRef.current) {
        mapboxInstanceRef.current.remove();
        mapboxInstanceRef.current = null;
      }
    };
  }, [step, selectedCoordinates[0], selectedCoordinates[1], type, locationPrecision]);

  // Handle selecting a search suggestion
  const handleSelectSuggestion = (res: GeocodingResult) => {
    triggerHaptic('selection');
    setSelectedCoordinates(res.coordinates); // [lng, lat]
    setVerifiedName(res.name);
    setVerifiedAddress(res.formattedAddress);
    setVerifiedCity(res.city || 'Valencia');
    setVerifiedCountry(res.country || 'España');
    setTitle(res.name);
    setLocationSource('mapbox_search');

    if (res.featureType === 'poi' && res.category?.includes('restaurant')) {
      setType('restaurant');
    }

    setStep('confirm_pin');
  };

  // Handle manual pin option
  const handleManualPin = () => {
    triggerHaptic('medium');
    setSelectedCoordinates([-0.3763, 39.4699]); // Valencia Center
    setVerifiedName('Punto en el mapa');
    setVerifiedAddress('Valencia, España');
    setVerifiedCity('Valencia');
    setTitle('');
    setLocationSource('manual_pin');
    setStep('confirm_pin');
  };

  // Confirm pin and move to final details
  const handleConfirmPin = () => {
    triggerHaptic('medium');
    if (!title.trim() && verifiedName) {
      setTitle(verifiedName);
    }
    setStep('details');
  };

  // Save place
  const handleFinalSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Por favor escribe un nombre para este rincón especial.');
      return;
    }

    triggerHaptic('success');

    const placeToSave: AndreaMapPlace = {
      id: initialPlace?.id || `place-verified-${Date.now()}`,
      type,
      title: title.trim(),
      subtitle: verifiedAddress || verifiedCity,
      description: description.trim() || undefined,
      latitude: selectedCoordinates[1], // Latitude is index 1
      longitude: selectedCoordinates[0], // Longitude is index 0
      precision: locationPrecision,
      source: locationSource,
      verifiedByUser: true,
      formattedAddress: verifiedAddress,
      city: verifiedCity,
      imageUrl: photoUrl || undefined,
      date: date || new Date().toISOString().split('T')[0],
      isRevealed: true,
    };

    onSavePlace(placeToSave);
    onClose();
    Alert.alert('📍 Lugar Confirmado', `"${title.trim()}" se ha anclado en su ubicación oficial.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetCard}>
          {/* Header */}
          <View style={styles.topHeader}>
            {step !== 'search' ? (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  setStep(step === 'details' ? 'confirm_pin' : 'search');
                }}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>‹ Volver</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.headerTitle}>Añadir Rincón al Mapa</Text>
            )}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* STEP 1: Search Real Mapbox Places */}
          {step === 'search' && (
            <View style={styles.stepContainer}>
              <Text style={styles.instructionText}>
                Escribe el nombre del restaurante, calle o rincón especial:
              </Text>

              {/* Context Scope Filter */}
              <View style={styles.scopeRow}>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'valencia' && styles.scopeChipActive]}
                  onPress={() => setSearchContext('valencia')}
                >
                  <Text
                    style={[
                      styles.scopeChipText,
                      searchContext === 'valencia' && styles.scopeChipTextActive,
                    ]}
                  >
                    📍 Valencia y alrededores
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'global' && styles.scopeChipActive]}
                  onPress={() => setSearchContext('global')}
                >
                  <Text
                    style={[
                      styles.scopeChipText,
                      searchContext === 'global' && styles.scopeChipTextActive,
                    ]}
                  >
                    🌍 Todo el mundo (Viajes)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar Input */}
              <View style={styles.searchBar}>
                <IconMapPin size={17} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Ej. Kibo Omakase, Alqueria del Pou, Alameda 44..."
                  placeholderTextColor={Colors.light.textMuted}
                  autoFocus
                />
                {isSearching && <ActivityIndicator size="small" color={Colors.light.primary} />}
              </View>

              {/* Manual Pin Action Card */}
              <TouchableOpacity
                style={styles.manualPinCard}
                onPress={handleManualPin}
                activeOpacity={0.8}
              >
                <View style={styles.manualPinIconCircle}>
                  <Text style={{ fontSize: 16 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.manualPinTitle}>Colocar pin en el mapa manualmente</Text>
                  <Text style={styles.manualPinSubtitle}>
                    Para rincones íntimos, bancos, miradores o sitios sin número
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              {/* Suggestions List */}
              <ScrollView showsVerticalScrollIndicator={false} style={styles.resultsScroll}>
                {results.map((res) => (
                  <TouchableOpacity
                    key={res.id}
                    style={styles.resultItem}
                    onPress={() => handleSelectSuggestion(res)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultIconWrap}>
                      <Text style={{ fontSize: 16 }}>
                        {res.featureType === 'poi' ? '🍽️' : '📍'}
                      </Text>
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultName}>{res.name}</Text>
                      <Text style={styles.resultAddress} numberOfLines={1}>
                        {res.formattedAddress}
                      </Text>
                      <Text style={styles.resultCityTag}>{res.city || res.country}</Text>
                    </View>
                    <Text style={styles.selectBtnBadge}>Seleccionar</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* STEP 2: Interactive Visual Pin Confirmation */}
          {step === 'confirm_pin' && (
            <View style={styles.stepContainer}>
              <Text style={styles.instructionText}>
                Comprueba y ajusta el pin. Puedes tocar o arrastrar el marcador:
              </Text>

              {/* Embedded Interactive Mapbox Map */}
              <View style={styles.mapFrame}>
                {Platform.OS === 'web' ? (
                  <div
                    ref={mapContainerRef as any}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  />
                ) : (
                  <View style={styles.nativeFallbackMap}>
                    <Text style={{ color: Colors.light.textSecondary, fontSize: 13 }}>
                      📍 Coordenadas: {selectedCoordinates[1].toFixed(5)},{' '}
                      {selectedCoordinates[0].toFixed(5)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Location Feedback Card */}
              <View style={styles.verifiedAddressCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifiedAddressTitle}>{verifiedName || 'Punto exacto'}</Text>
                  <Text style={styles.verifiedAddressText}>
                    {isReverseGeocoding ? 'Detectando dirección...' : verifiedAddress}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <IconCheck size={12} color={Colors.light.primary} />
                  <Text style={styles.verifiedBadgeText}>Verificado</Text>
                </View>
              </View>

              {/* Precision Picker */}
              <View style={styles.precisionRow}>
                <Text style={styles.precisionLabel}>Precisión en el mapa:</Text>
                <View style={styles.precisionChips}>
                  {(['exact', 'approximate', 'city'] as LocationPrecision[]).map((prec) => (
                    <TouchableOpacity
                      key={prec}
                      style={[
                        styles.precisionChip,
                        locationPrecision === prec && styles.precisionChipActive,
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setLocationPrecision(prec);
                      }}
                    >
                      <Text
                        style={[
                          styles.precisionChipText,
                          locationPrecision === prec && styles.precisionChipTextActive,
                        ]}
                      >
                        {prec === 'exact'
                          ? 'Exacta'
                          : prec === 'approximate'
                          ? 'Aproximada'
                          : 'Solo ciudad'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Confirm Pin Button */}
              <TouchableOpacity
                style={styles.confirmPinBtn}
                onPress={handleConfirmPin}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmPinBtnText}>Confirmar este lugar →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Details & Memory Details */}
          {step === 'details' && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.detailsScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título del Rincón</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej. Kibo Omakase, Paseo en la playa..."
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <View style={styles.categoryGrid}>
                  {(
                    [
                      { id: 'memory', label: 'Recuerdo', icon: '❤️' },
                      { id: 'restaurant', label: 'Restaurante', icon: '🍽️' },
                      { id: 'trip', label: 'Viaje / Escapada', icon: '✈️' },
                      { id: 'future_place', label: 'Deseo / Pendiente', icon: '💫' },
                    ] as const
                  ).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryCard, type === cat.id && styles.categoryCardActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setType(cat.id);
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryCardText,
                          type === cat.id && styles.categoryCardTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha del recuerdo o plan</Text>
                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>

              {/* Story / Note */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nuestra Historia o Nota (Opcional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Lo que sentimos, lo que pedimos o lo que queremos vivir aquí..."
                  placeholderTextColor={Colors.light.textMuted}
                  multiline
                />
              </View>

              {/* Photo Upload */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fotografía del Momento</Text>
                <PhotoUploadField
                  imageUri={photoUrl}
                  onImageChange={(uri) => setPhotoUrl(uri)}
                  label=""
                  placeholderText="Toca para subir foto de tu cámara o carrete"
                  aspect={[4, 3]}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.finalSaveBtn}
                onPress={handleFinalSave}
                activeOpacity={0.85}
              >
                <Text style={styles.finalSaveBtnText}>✦ Anclar en Nuestro Mapa</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 16, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.06)',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.light.text,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    ...Typography.bodyMedium,
    color: Colors.light.primary,
    fontSize: 15,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '700',
  },
  stepContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  instructionText: {
    ...Typography.body,
    fontSize: 13.5,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
  },
  scopeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  scopeChipText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.textSecondary,
  },
  scopeChipTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.text,
  },
  manualPinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  manualPinIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  manualPinTitle: {
    ...Typography.bodyMedium,
    fontSize: 13.5,
    color: Colors.light.text,
  },
  manualPinSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    color: Colors.light.textMuted,
  },
  resultsScroll: {
    maxHeight: 280,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
  },
  resultIconWrap: {
    marginRight: Spacing.sm,
  },
  resultContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  resultName: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.light.text,
  },
  resultAddress: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  resultCityTag: {
    ...Typography.captionBold,
    fontSize: 10.5,
    color: Colors.light.primary,
    marginTop: 2,
  },
  selectBtnBadge: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.primary,
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
  mapFrame: {
    width: '100%',
    height: 220,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  nativeFallbackMap: {
    flex: 1,
    backgroundColor: '#1E2430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.subtle,
  },
  verifiedAddressTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.light.text,
  },
  verifiedAddressText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  verifiedBadgeText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.primary,
  },
  precisionRow: {
    marginBottom: Spacing.lg,
  },
  precisionLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  precisionChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  precisionChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    alignItems: 'center',
  },
  precisionChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  precisionChipText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.textSecondary,
  },
  precisionChipTextActive: {
    color: '#FFFFFF',
  },
  confirmPinBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: Radii.full,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  confirmPinBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: 480,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.text,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
  },
  categoryCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(224, 86, 102, 0.06)',
  },
  categoryCardText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  categoryCardTextActive: {
    color: Colors.light.primary,
  },
  finalSaveBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 13,
    borderRadius: Radii.full,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  finalSaveBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
