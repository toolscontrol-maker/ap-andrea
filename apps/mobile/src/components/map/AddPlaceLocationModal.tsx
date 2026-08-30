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
  searchGooglePlaces,
  reverseGeocodeGoogleCoordinates,
  GeocodingResult,
} from '../../services/googlePlacesGeocoding';
import { loadGoogleMapsSDK, ANDREA_GOOGLE_MAP_STYLES } from '../../lib/googleMaps';
import { AndreaMapPlace, MapPlaceType, LocationPrecision, LocationSource } from '../../types/map';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';

interface AddPlaceLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePlace: (place: AndreaMapPlace) => void;
  initialPlace?: AndreaMapPlace | null;
}

type ModalStep = 'search' | 'confirm_pin' | 'details';

export function AddPlaceLocationModal({
  visible,
  onClose,
  onSavePlace,
  initialPlace,
}: AddPlaceLocationModalProps) {
  const [step, setStep] = useState<ModalStep>('search');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searchContext, setSearchContext] = useState<'valencia' | 'global'>('valencia');

  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number]>([
    -0.3763, 39.4699,
  ]);
  const [verifiedName, setVerifiedName] = useState('');
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [verifiedCity, setVerifiedCity] = useState('Valencia');
  const [verifiedCountry, setVerifiedCountry] = useState('España');
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('exact');
  const [locationSource, setLocationSource] = useState<LocationSource>('google_places');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MapPlaceType>('memory');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('2025-01-05');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [stageSummary, setStageSummary] = useState('');

  const [hasDateRange, setHasDateRange] = useState(false);
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [emotionTag, setEmotionTag] = useState('');

  const [invitedBy, setInvitedBy] = useState<'tonet' | 'andrea' | 'both'>('both');
  const [destination1, setDestination1] = useState('');
  const [destination2, setDestination2] = useState('');

  const [accommodation, setAccommodation] = useState('');
  const [tripDurationDays, setTripDurationDays] = useState('3');
  const [visitedPlacesText, setVisitedPlacesText] = useState('');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      if (initialPlace) {
        setTitle(initialPlace.title);
        setVerifiedName(initialPlace.title);
        setVerifiedAddress(initialPlace.formattedAddress || initialPlace.subtitle || '');
        setVerifiedCity(initialPlace.city || 'Valencia');
        setSelectedCoordinates([initialPlace.longitude, initialPlace.latitude]);
        setLocationPrecision(initialPlace.precision || 'exact');
        setLocationSource(initialPlace.source || 'google_places');
        setType(initialPlace.type || 'memory');
        setDate(initialPlace.date || new Date().toISOString().split('T')[0]);
        setDescription(initialPlace.description || '');
        setPhotoUrl(initialPlace.imageUrl || null);
        setSearchQuery(initialPlace.title);

        setStartDate(initialPlace.startDate || initialPlace.date || '');
        setEndDate(initialPlace.endDate || '');
        setIsOngoing(Boolean(initialPlace.isOngoing));
        setStageSummary(initialPlace.stageSummary || '');
        setHasDateRange(Boolean(initialPlace.hasDateRange));
        setDateRangeEnd(initialPlace.dateRangeEnd || '');
        setEmotionTag(initialPlace.emotionTag || '');
        setInvitedBy(initialPlace.invitedBy || 'both');
        setDestination1(initialPlace.destination1 || '');
        setDestination2(initialPlace.destination2 || '');
        setAccommodation(initialPlace.accommodation || '');
        setTripDurationDays(String(initialPlace.tripDurationDays || 3));
        setVisitedPlacesText((initialPlace.visitedPlaces || []).join(', '));

        setStep('confirm_pin');
      } else {
        setStep('search');
        setSearchQuery('');
        setResults([]);
        setTitle('');
        setVerifiedName('');
        setVerifiedAddress('');
        setDescription('');
        setPhotoUrl(null);
        setType('memory');
        setSelectedCoordinates([-0.3763, 39.4699]);
        setLocationPrecision('exact');
        setLocationSource('google_places');

        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setIsOngoing(false);
        setStageSummary('');
        setHasDateRange(false);
        setDateRangeEnd('');
        setEmotionTag('');
        setInvitedBy('both');
        setDestination1('');
        setDestination2('');
        setAccommodation('');
        setTripDurationDays('3');
        setVisitedPlacesText('');
      }
    }
  }, [visible, initialPlace]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchGooglePlaces(searchQuery, {
        country: searchContext === 'valencia' ? 'es' : undefined,
        proximity: searchContext === 'valencia' ? [-0.3763, 39.4699] : undefined,
      });
      setResults(res);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, searchContext]);

  useEffect(() => {
    if (step !== 'confirm_pin' || Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isMounted = true;

    async function initMiniMap() {
      if (!mapContainerRef.current) return;

      const googleMaps = await loadGoogleMapsSDK();
      if (!isMounted || !mapContainerRef.current || !googleMaps) return;

      if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }

      const center = { lat: selectedCoordinates[1], lng: selectedCoordinates[0] };
      const map = new googleMaps.Map(mapContainerRef.current, {
        center,
        zoom: locationPrecision === 'city' ? 12 : 16,
        styles: ANDREA_GOOGLE_MAP_STYLES,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        backgroundColor: '#FFF8F2',
      });

      const markerColor =
        type === 'stage'
          ? '#5B7A62'
          : type === 'restaurant'
          ? '#F4C95D'
          : type === 'date'
          ? '#E28743'
          : type === 'trip'
          ? '#9E8ACD'
          : '#EF826A';

      const markerIcon =
        type === 'stage'
          ? '🏡'
          : type === 'restaurant'
          ? '🍽️'
          : type === 'date'
          ? '🥂'
          : type === 'trip'
          ? '✈️'
          : '❤️';

      const pinSvg =
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="' +
        markerColor +
        '" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(58,47,56,0.16))"/><text x="20" y="24" text-anchor="middle" font-size="14">' +
        markerIcon +
        '</text></svg>';

      const marker = new googleMaps.Marker({
        position: center,
        map,
        draggable: true,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
          scaledSize: new googleMaps.Size(40, 40),
          anchor: new googleMaps.Point(20, 20),
        },
      });

      markerInstanceRef.current = marker;

      marker.addListener('dragend', async () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const lng = pos.lng();
        const lat = pos.lat();
        setSelectedCoordinates([lng, lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeGoogleCoordinates([lng, lat]);
        if (rev) {
          setVerifiedAddress(rev.formattedAddress);
          setVerifiedCity(rev.city || 'Valencia');
          setVerifiedCountry(rev.country || 'España');
        }
        setIsReverseGeocoding(false);
      });

      map.addListener('click', async (e: any) => {
        if (!e.latLng) return;
        const lng = e.latLng.lng();
        const lat = e.latLng.lat();
        marker.setPosition(e.latLng);
        setSelectedCoordinates([lng, lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeGoogleCoordinates([lng, lat]);
        if (rev) {
          setVerifiedAddress(rev.formattedAddress);
          setVerifiedCity(rev.city || 'Valencia');
          setVerifiedCountry(rev.country || 'España');
        }
        setIsReverseGeocoding(false);
      });

      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      initMiniMap();
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }
    };
  }, [step, selectedCoordinates[0], selectedCoordinates[1], type, locationPrecision]);

  const handleSelectSuggestion = (res: GeocodingResult) => {
    triggerHaptic('selection');
    setSelectedCoordinates(res.coordinates);
    setVerifiedName(res.name);
    setVerifiedAddress(res.formattedAddress);
    setVerifiedCity(res.city || 'Valencia');
    setVerifiedCountry(res.country || 'España');
    setTitle(res.name);
    setLocationSource('google_places');

    if (res.featureType === 'restaurant' || res.category === 'restaurant') {
      setType('restaurant');
    }

    setStep('confirm_pin');
  };

  const handleManualPin = () => {
    triggerHaptic('medium');
    if (!initialPlace) {
      setSelectedCoordinates([-0.3763, 39.4699]);
      setVerifiedName('Punto en el mapa');
      setVerifiedAddress('Valencia, España');
      setVerifiedCity('Valencia');
      setTitle(searchQuery || 'Nuestro Rincón');
    }
    setLocationSource('manual_pin');
    setStep('confirm_pin');
  };

  const handleConfirmPin = () => {
    triggerHaptic('medium');
    if (!title.trim() && verifiedName) {
      setTitle(verifiedName);
    }
    setStep('details');
  };

  const handleFinalSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Por favor escribe un nombre para este lugar.');
      return;
    }

    triggerHaptic('success');

    const visitedPlaces = visitedPlacesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const placeToSave: AndreaMapPlace = {
      id: initialPlace?.id || ('place-verified-' + Date.now()),
      type,
      title: title.trim(),
      subtitle: verifiedAddress || verifiedCity,
      description: description.trim() || undefined,
      latitude: selectedCoordinates[1],
      longitude: selectedCoordinates[0],
      precision: locationPrecision,
      source: locationSource,
      verifiedByUser: true,
      formattedAddress: verifiedAddress,
      city: verifiedCity,
      imageUrl: photoUrl || initialPlace?.imageUrl || undefined,
      photos: initialPlace?.photos || (photoUrl ? [photoUrl] : []),
      date: date || new Date().toISOString().split('T')[0],
      isRevealed: true,

      startDate: type === 'stage' ? startDate : undefined,
      endDate: type === 'stage' ? (isOngoing ? undefined : endDate) : undefined,
      isOngoing: type === 'stage' ? isOngoing : undefined,
      stageSummary: type === 'stage' ? stageSummary : undefined,

      hasDateRange: type === 'memory' ? hasDateRange : undefined,
      dateRangeEnd: type === 'memory' && hasDateRange ? dateRangeEnd : undefined,
      emotionTag: type === 'memory' ? emotionTag : undefined,

      invitedBy: type === 'date' ? invitedBy : undefined,
      destination1: type === 'date' ? destination1 : undefined,
      destination2: type === 'date' ? destination2 : undefined,

      accommodation: type === 'trip' ? accommodation : undefined,
      tripDurationDays: type === 'trip' ? Number(tripDurationDays) || 3 : undefined,
      visitedPlaces: type === 'trip' ? visitedPlaces : undefined,
    };

    onSavePlace(placeToSave);
    onClose();
    Alert.alert('📍 Guardado con Éxito', '"' + title.trim() + '" sincronizado.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetCard}>
          <View style={styles.topHeader}>
            {step !== 'search' ? (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  setStep(step === 'details' ? 'confirm_pin' : 'search');
                }}
                style={styles.headerBackBtn}
              >
                <Text style={styles.headerBackText}>← Volver</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}

            <Text style={styles.headerTitle}>
              {initialPlace ? 'Editar Rincón' : 'Guardar Momento'}
            </Text>

            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={[styles.stepTab, step === 'search' && styles.stepTabActive]}
              onPress={() => {
                triggerHaptic('selection');
                setStep('search');
              }}
            >
              <Text style={[styles.stepTabText, step === 'search' && styles.stepTabTextActive]}>
                1. Buscar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, step === 'confirm_pin' && styles.stepTabActive]}
              onPress={() => {
                triggerHaptic('selection');
                setStep('confirm_pin');
              }}
            >
              <Text style={[styles.stepTabText, step === 'confirm_pin' && styles.stepTabTextActive]}>
                2. Ajustar Pin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, step === 'details' && styles.stepTabActive]}
              onPress={() => {
                triggerHaptic('selection');
                setStep('details');
              }}
            >
              <Text style={[styles.stepTabText, step === 'details' && styles.stepTabTextActive]}>
                3. Detalles
              </Text>
            </TouchableOpacity>
          </View>

          {step === 'search' && (
            <View style={styles.contentContainer}>
              <Text style={styles.stepSubtitle}>
                Busca en Google Maps cualquier restaurante, cafetería, playa, plaza o rincón:
              </Text>

              <View style={styles.searchBarWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ej: Casa d'Aragona, Honest Greens, Canet..."
                  placeholderTextColor="#9E8ACD"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {isSearching && <ActivityIndicator size="small" color="#EF826A" />}
              </View>

              <View style={styles.scopeChipsRow}>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'valencia' && styles.scopeChipActive]}
                  onPress={() => setSearchContext('valencia')}
                >
                  <Text style={[styles.scopeChipText, searchContext === 'valencia' && styles.scopeChipTextActive]}>
                    📍 Valencia
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'global' && styles.scopeChipActive]}
                  onPress={() => setSearchContext('global')}
                >
                  <Text style={[styles.scopeChipText, searchContext === 'global' && styles.scopeChipTextActive]}>
                    🌍 Toda España / Viajes
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.resultsScrollView} keyboardShouldPersistTaps="handled">
                {results.map((res) => (
                  <TouchableOpacity
                    key={res.id}
                    style={styles.resultRow}
                    onPress={() => handleSelectSuggestion(res)}
                  >
                    <View style={styles.resultIconCircle}>
                      <Text style={styles.resultEmoji}>
                        {res.featureType === 'restaurant' ? '🍽️' : '📍'}
                      </Text>
                    </View>
                    <View style={styles.resultTextCol}>
                      <Text style={styles.resultMainTitle} numberOfLines={1}>
                        {res.name}
                      </Text>
                      <Text style={styles.resultSubAddress} numberOfLines={2}>
                        {res.formattedAddress}
                      </Text>
                    </View>
                    <Text style={styles.resultArrow}>→</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.manualPinSection}>
                  <TouchableOpacity style={styles.manualPinOutlineBtn} onPress={handleManualPin}>
                    <Text style={styles.manualPinOutlineBtnText}>
                      📌 ¿Prefieres arrastrar el pin manualmente? Pulsa aquí
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          {step === 'confirm_pin' && (
            <View style={styles.contentContainer}>
              <View style={styles.pinHeaderCard}>
                <Text style={styles.pinHeaderTitle} numberOfLines={1}>
                  {verifiedName || title || 'Ubicación seleccionada'}
                </Text>
                <Text style={styles.pinHeaderSubtitle} numberOfLines={2}>
                  {isReverseGeocoding ? 'Detectando dirección...' : verifiedAddress || verifiedCity}
                </Text>
                <TouchableOpacity style={styles.reSearchPill} onPress={() => setStep('search')}>
                  <Text style={styles.reSearchPillText}>🔍 Buscar otro sitio en Google Maps</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.miniMapContainer}>
                <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                <View style={styles.mapBadgeOverlay}>
                  <Text style={styles.mapBadgeText}>👆 Toca o arrastra para ajustar la posición</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryActionButton} onPress={handleConfirmPin}>
                <Text style={styles.primaryActionText}>Continuar a Detalles →</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'details' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Categoría del Lugar</Text>
              <View style={styles.categoryRow}>
                <TouchableOpacity
                  style={[styles.categoryPill, type === 'stage' && styles.categoryPillActive]}
                  onPress={() => setType('stage')}
                >
                  <Text style={styles.categoryPillText}>🏡 Etapa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'memory' && styles.categoryPillActive]}
                  onPress={() => setType('memory')}
                >
                  <Text style={styles.categoryPillText}>❤️ Recuerdo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'date' && styles.categoryPillActive]}
                  onPress={() => setType('date')}
                >
                  <Text style={styles.categoryPillText}>🥂 Cita</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'restaurant' && styles.categoryPillActive]}
                  onPress={() => setType('restaurant')}
                >
                  <Text style={styles.categoryPillText}>🍽️ Restaurante</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'trip' && styles.categoryPillActive]}
                  onPress={() => setType('trip')}
                >
                  <Text style={styles.categoryPillText}>✈️ Viaje</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Nombre / Título</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Nuestra etapa en Canet, Cena en Don Salvatore..."
                value={title}
                onChangeText={setTitle}
              />

              {type === 'stage' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>🏡 Configuración de Etapa de Vida</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha Inicio (Desde)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        value={startDate}
                        onChangeText={setStartDate}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha Fin (Hasta)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={isOngoing ? 'Actualidad' : 'YYYY-MM-DD'}
                        value={endDate}
                        onChangeText={setEndDate}
                        editable={!isOngoing}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setIsOngoing(!isOngoing)}
                  >
                    <Text style={styles.checkboxEmoji}>{isOngoing ? '☑️' : '◻️'}</Text>
                    <Text style={styles.checkboxLabel}>Actualmente viviendo o conviviendo aquí</Text>
                  </TouchableOpacity>

                  <Text style={styles.subFieldLabel}>Resumen de la etapa</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Convivencia junto al mar, paseos al atardecer..."
                    value={stageSummary}
                    onChangeText={setStageSummary}
                  />
                </View>
              )}

              {type === 'date' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>🥂 Configuración de la Cita</Text>
                  <Text style={styles.subFieldLabel}>¿Quién invitó?</Text>
                  <View style={styles.invitedRow}>
                    <TouchableOpacity
                      style={[styles.invitedPill, invitedBy === 'tonet' && styles.invitedPillActive]}
                      onPress={() => setInvitedBy('tonet')}
                    >
                      <Text style={styles.invitedPillText}>Tonet ❤️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.invitedPill, invitedBy === 'andrea' && styles.invitedPillActive]}
                      onPress={() => setInvitedBy('andrea')}
                    >
                      <Text style={styles.invitedPillText}>Andrea 💖</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.invitedPill, invitedBy === 'both' && styles.invitedPillActive]}
                      onPress={() => setInvitedBy('both')}
                    >
                      <Text style={styles.invitedPillText}>Ambos ✨</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subFieldLabel}>Destino 1 (Plan / Sitio)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Cines ABC Park"
                    value={destination1}
                    onChangeText={setDestination1}
                  />

                  <Text style={styles.subFieldLabel}>Destino 2 (Opcional: Segundo sitio / Cena)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Cena en Don Salvatore"
                    value={destination2}
                    onChangeText={setDestination2}
                  />
                </View>
              )}

              {type === 'trip' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>✈️ Configuración de Viaje / Escapada</Text>
                  <Text style={styles.subFieldLabel}>¿Dónde nos alojamos?</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Hotel Boutique, Airbnb frente al mar..."
                    value={accommodation}
                    onChangeText={setAccommodation}
                  />

                  <Text style={styles.subFieldLabel}>Días de duración</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: 4"
                    keyboardType="numeric"
                    value={tripDurationDays}
                    onChangeText={setTripDurationDays}
                  />

                  <Text style={styles.subFieldLabel}>Restaurantes y sitios visitados (separados por comas)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Trattoria del Porto, Mirador del Faro, Café Central"
                    value={visitedPlacesText}
                    onChangeText={setVisitedPlacesText}
                  />
                </View>
              )}

              {type === 'memory' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>❤️ Connotación del Recuerdo</Text>
                  <Text style={styles.subFieldLabel}>Significado / Emoción clave</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Primer beso, Donde supimos que estábamos enamorados..."
                    value={emotionTag}
                    onChangeText={setEmotionTag}
                  />

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setHasDateRange(!hasDateRange)}
                  >
                    <Text style={styles.checkboxEmoji}>{hasDateRange ? '☑️' : '◻️'}</Text>
                    <Text style={styles.checkboxLabel}>Fue un rango de días (ej: fin de semana)</Text>
                  </TouchableOpacity>

                  {hasDateRange && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.subFieldLabel}>Fecha de Fin</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        value={dateRangeEnd}
                        onChangeText={setDateRangeEnd}
                      />
                    </View>
                  )}
                </View>
              )}

              {type !== 'stage' && (
                <>
                  <Text style={styles.fieldLabel}>Fecha Principal</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={setDate}
                  />
                </>
              )}

              <Text style={styles.fieldLabel}>¿Qué pasó? / Nuestra Historia</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Cuenta lo que vivimos juntos, anécdotas, sensaciones..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Foto Principal de Portada</Text>
              <PhotoUploadField
                photoUrl={photoUrl}
                onPhotoSelected={setPhotoUrl}
                placeholderText="Toca para añadir foto desde la galería o cámara"
              />

              <TouchableOpacity style={styles.finalSaveButton} onPress={handleFinalSave}>
                <Text style={styles.finalSaveButtonText}>
                  💾 {initialPlace ? 'Guardar Cambios' : 'Anclar en el Mapa'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
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
    backgroundColor: 'rgba(58, 47, 56, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFF8F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
    minHeight: '65%',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  headerBackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF826A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A5F68',
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#F5EFE8',
    padding: 4,
    borderRadius: 12,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  stepTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7F88',
  },
  stepTabTextActive: {
    color: '#EF826A',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#766B72',
    marginBottom: 12,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF826A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#EF826A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3A2F38',
  },
  scopeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scopeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F5EFE8',
  },
  scopeChipActive: {
    backgroundColor: '#3A2F38',
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#766B72',
  },
  scopeChipTextActive: {
    color: '#FFFFFF',
  },
  resultsScrollView: {
    flex: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
  },
  resultIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultEmoji: {
    fontSize: 18,
  },
  resultTextCol: {
    flex: 1,
  },
  resultMainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  resultSubAddress: {
    fontSize: 12,
    color: '#766B72',
  },
  resultArrow: {
    fontSize: 16,
    color: '#EF826A',
    fontWeight: 'bold',
  },
  manualPinSection: {
    marginTop: 12,
    paddingBottom: 24,
  },
  manualPinOutlineBtn: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF826A',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  manualPinOutlineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF826A',
  },
  pinHeaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  pinHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  pinHeaderSubtitle: {
    fontSize: 12,
    color: '#766B72',
    marginBottom: 8,
  },
  reSearchPill: {
    backgroundColor: '#F5EFE8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reSearchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF826A',
  },
  miniMapContainer: {
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
  },
  mapBadgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 248, 242, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A2F38',
  },
  primaryActionButton: {
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#EF826A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 6,
    marginTop: 10,
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3A2F38',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: '#F5EFE8',
  },
  categoryPillActive: {
    backgroundColor: '#3A2F38',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A2F38',
  },
  specificFieldsBox: {
    backgroundColor: '#FFFDF9',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
  },
  specificBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF826A',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  checkboxEmoji: {
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#3A2F38',
    fontWeight: '600',
  },
  invitedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  invitedPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    alignItems: 'center',
  },
  invitedPillActive: {
    backgroundColor: '#EF826A',
    borderColor: '#EF826A',
  },
  invitedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2F38',
  },
  finalSaveButton: {
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EF826A',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  finalSaveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
