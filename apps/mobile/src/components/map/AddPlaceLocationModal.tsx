import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  KeyboardAvoidingView,
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
import { GoogleMapsPlaceSearchField, SelectedPlaceItem } from './GoogleMapsPlaceSearchField';
import { CalendarPickerModal } from '../ui/CalendarPickerModal';

interface AddPlaceLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePlace: (place: AndreaMapPlace) => void;
  initialPlace?: AndreaMapPlace | null;
  allPlaces?: AndreaMapPlace[];
}

export type WizardStep = 'entity' | 'title' | 'location' | 'specifics' | 'media';

export function AddPlaceLocationModal({
  visible,
  onClose,
  onSavePlace,
  initialPlace,
  allPlaces = [],
}: AddPlaceLocationModalProps) {
  const [step, setStep] = useState<WizardStep>('entity');
  const [calendarTarget, setCalendarTarget] = useState<'date' | 'startDate' | 'endDate' | null>(null);

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
  const [datePlanItems, setDatePlanItems] = useState<SelectedPlaceItem[]>([]);

  const [accommodation, setAccommodation] = useState('');
  const [accommodationItem, setAccommodationItem] = useState<SelectedPlaceItem | null>(null);
  const [tripDurationDays, setTripDurationDays] = useState('3');
  const [visitedPlaceItems, setVisitedPlaceItems] = useState<SelectedPlaceItem[]>([]);
  const [selectedMomentIds, setSelectedMomentIds] = useState<string[]>([]);

  // Trip Date / Escapada within Trip
  const [hasDateInTrip, setHasDateInTrip] = useState(false);
  const [tripDatePlan, setTripDatePlan] = useState('');
  const [tripDateRestaurantItem, setTripDateRestaurantItem] = useState<SelectedPlaceItem | null>(null);
  const [tripDateInvitedBy, setTripDateInvitedBy] = useState<'tonet' | 'andrea' | 'both'>('both');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Suggested moments within the stage date range
  const candidateMoments = useMemo(() => {
    if (type !== 'stage' || !allPlaces || allPlaces.length === 0) return [];
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = isOngoing ? Infinity : (endDate ? new Date(endDate).getTime() : Infinity);

    return allPlaces.filter((p) => {
      if (initialPlace && p.id === initialPlace.id) return false;
      if (p.type === 'stage') return false;
      const pDate = p.date || p.startDate;
      if (!pDate) return true;
      const t = new Date(pDate).getTime();
      return isNaN(t) || (t >= start && t <= end);
    });
  }, [type, allPlaces, startDate, endDate, isOngoing, initialPlace]);

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

        setStartDate(initialPlace.startDate || initialPlace.date || '2025-01-05');
        setEndDate(initialPlace.endDate || '');
        setIsOngoing(Boolean(initialPlace.isOngoing));
        setStageSummary(initialPlace.stageSummary || '');
        setSelectedMomentIds(initialPlace.linkedPlaceIds || []);
        setHasDateRange(Boolean(initialPlace.hasDateRange));
        setDateRangeEnd(initialPlace.dateRangeEnd || '');
        setEmotionTag(initialPlace.emotionTag || '');
        setInvitedBy(initialPlace.invitedBy || 'both');

        setAccommodation(initialPlace.accommodation || '');
        setAccommodationItem(null);
        setTripDurationDays(String(initialPlace.tripDurationDays || 3));

        if (Array.isArray(initialPlace.visitedPlaces) && initialPlace.visitedPlaces.length > 0) {
          setVisitedPlaceItems(
            initialPlace.visitedPlaces.map((name, i) => ({
              id: 'visited_' + i,
              name: String(name),
              formattedAddress: initialPlace.formattedAddress || initialPlace.city || 'Valencia',
              latitude: initialPlace.latitude,
              longitude: initialPlace.longitude,
              type: 'restaurant',
            }))
          );
        } else {
          setVisitedPlaceItems([]);
        }

        setDatePlanItems([]);
        setHasDateInTrip(false);
        setTripDatePlan('');
        setTripDateRestaurantItem(null);
        setTripDateInvitedBy('both');

        // Always start at step 1 (entity) so user can also change the category
        setStep('entity');
      } else {
        setStep('entity');
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
        setSelectedMomentIds([]);
        setHasDateRange(false);
        setDateRangeEnd('');
        setEmotionTag('');
        setInvitedBy('both');

        setAccommodation('');
        setAccommodationItem(null);
        setTripDurationDays('3');
        setVisitedPlaceItems([]);
        setDatePlanItems([]);
        setHasDateInTrip(false);
        setTripDatePlan('');
        setTripDateRestaurantItem(null);
        setTripDateInvitedBy('both');
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
    if (step !== 'location' || Platform.OS !== 'web' || typeof window === 'undefined') return;

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

      const marker = new googleMaps.Marker({
        position: center,
        map,
        draggable: true,
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF826A',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
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
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }
    };
  }, [step, selectedCoordinates[0], selectedCoordinates[1], locationPrecision]);

  const handleSelectResult = (item: GeocodingResult) => {
    triggerHaptic('selection');
    setSelectedCoordinates(item.coordinates);
    setVerifiedName(item.name);
    setVerifiedAddress(item.formattedAddress);
    setVerifiedCity(item.city || 'Valencia');
    setVerifiedCountry(item.country || 'España');
    setLocationPrecision('exact');
    setLocationSource('google_places');

    if (!title.trim() && item.name) {
      setTitle(item.name);
    }
  };

  const handleNextStep = () => {
    triggerHaptic('selection');
    if (step === 'entity') {
      setStep('title');
    } else if (step === 'title') {
      if (!title.trim()) {
        Alert.alert('Falta el nombre', 'Por favor escribe un título o nombre para este momento.');
        return;
      }
      setStep('location');
    } else if (step === 'location') {
      setStep('specifics');
    } else if (step === 'specifics') {
      setStep('media');
    }
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (step === 'title') setStep('entity');
    else if (step === 'location') setStep('title');
    else if (step === 'specifics') setStep('location');
    else if (step === 'media') setStep('specifics');
  };

  const getStepNumber = () => {
    switch (step) {
      case 'entity': return 1;
      case 'title': return 2;
      case 'location': return 3;
      case 'specifics': return 4;
      case 'media': return 5;
    }
  };

  const handleFinalSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Por favor escribe un nombre para este lugar.');
      return;
    }

    triggerHaptic('success');

    const primaryPlace: AndreaMapPlace = {
      id: initialPlace?.id || ('place-verified-' + Date.now()),
      type: type,
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
      photos: photoUrl
        ? Array.from(new Set([photoUrl, ...(initialPlace?.photos || [])]))
        : (initialPlace?.photos || []),
      date: (type === 'stage' || type === 'memory') ? undefined : (date || new Date().toISOString().split('T')[0]),
      isRevealed: true,

      startDate: (type === 'stage' || type === 'trip' || type === 'getaway') ? startDate : undefined,
      endDate: (type === 'stage' || type === 'trip' || type === 'getaway') ? (isOngoing ? undefined : endDate) : undefined,
      isOngoing: type === 'stage' ? isOngoing : undefined,
      stageSummary: stageSummary || undefined,
      linkedPlaceIds: type === 'stage' && selectedMomentIds.length > 0 ? selectedMomentIds : undefined,

      hasDateRange: type === 'memory' ? hasDateRange : undefined,
      dateRangeEnd: type === 'memory' && hasDateRange ? dateRangeEnd : undefined,
      emotionTag: (type === 'memory' || emotionTag) ? emotionTag : undefined,

      invitedBy: ['date', 'getaway', 'hotel', 'restaurant', 'trip'].includes(type) ? invitedBy : undefined,
      destination1: (type === 'date' || type === 'getaway') ? (datePlanItems[0]?.name || undefined) : undefined,
      destination2: (type === 'date' || type === 'getaway') ? (datePlanItems[1]?.name || undefined) : undefined,

      accommodation: accommodationItem ? accommodationItem.name : (accommodation || (type === 'hotel' ? title.trim() : undefined)),
      tripDurationDays: (type === 'trip' || type === 'getaway') ? Number(tripDurationDays) || 3 : undefined,
      visitedPlaces: visitedPlaceItems.length > 0
        ? visitedPlaceItems.map((p) => p.name)
        : undefined,
    };

    onSavePlace(primaryPlace);

    // 2. Cascade Global Persistence: Save child entities in the global map
    if (type === 'trip') {
      // Save Accommodation in global map
      if (accommodationItem) {
        const hotelPlace: AndreaMapPlace = {
          id: 'hotel_' + accommodationItem.id,
          type: 'trip',
          title: accommodationItem.name,
          subtitle: accommodationItem.formattedAddress,
          latitude: accommodationItem.latitude,
          longitude: accommodationItem.longitude,
          city: accommodationItem.city || verifiedCity,
          formattedAddress: accommodationItem.formattedAddress,
          description: `Alojamiento de nuestro viaje a ${title.trim()}`,
          date: startDate || date,
          source: 'google_places',
          precision: 'exact',
          parentExperienceId: primaryPlace.id,
        };
        onSavePlace(hotelPlace);
      }

      // Save each visited restaurant / spot in global map
      for (const item of visitedPlaceItems) {
        const isGastronomic = item.type?.includes('restaurant') || item.type?.includes('food') || item.type?.includes('bar');
        const childPlace: AndreaMapPlace = {
          id: 'place_item_' + item.id,
          type: isGastronomic ? 'restaurant' : 'memory',
          title: item.name,
          subtitle: item.formattedAddress,
          latitude: item.latitude,
          longitude: item.longitude,
          city: item.city || verifiedCity,
          formattedAddress: item.formattedAddress,
          description: `Rincón visitado durante nuestro viaje a ${title.trim()}`,
          date: startDate || date,
          source: 'google_places',
          precision: 'exact',
          parentExperienceId: primaryPlace.id,
        };
        onSavePlace(childPlace);
      }

      // Save romantic date in trip if configured
      if (hasDateInTrip && (tripDatePlan || tripDateRestaurantItem)) {
        const tripDatePlace: AndreaMapPlace = {
          id: 'date_trip_' + primaryPlace.id,
          type: 'date',
          title: tripDatePlan || `Cita en ${tripDateRestaurantItem?.name || title.trim()}`,
          subtitle: tripDateRestaurantItem?.formattedAddress || verifiedAddress,
          latitude: tripDateRestaurantItem?.latitude || selectedCoordinates[1],
          longitude: tripDateRestaurantItem?.longitude || selectedCoordinates[0],
          city: tripDateRestaurantItem?.city || verifiedCity,
          formattedAddress: tripDateRestaurantItem?.formattedAddress || verifiedAddress,
          invitedBy: tripDateInvitedBy,
          date: startDate || date,
          description: `Cita especial durante nuestro viaje a ${title.trim()}`,
          source: 'google_places',
          precision: 'exact',
          parentExperienceId: primaryPlace.id,
        };
        onSavePlace(tripDatePlace);
      }
    }

    // Save date plan items in global map if defined
    if (type === 'date' && datePlanItems.length > 0) {
      for (const item of datePlanItems) {
        const isGastronomic = item.type?.includes('restaurant') || item.type?.includes('food') || item.type?.includes('bar');
        const planChildPlace: AndreaMapPlace = {
          id: 'date_plan_' + item.id,
          type: isGastronomic ? 'restaurant' : 'memory',
          title: item.name,
          subtitle: item.formattedAddress,
          latitude: item.latitude,
          longitude: item.longitude,
          city: item.city || verifiedCity,
          formattedAddress: item.formattedAddress,
          description: `Parada de nuestra cita "${title.trim()}"`,
          date: date,
          source: 'google_places',
          precision: 'exact',
          parentExperienceId: primaryPlace.id,
        };
        onSavePlace(planChildPlace);
      }
    }

    onClose();
    Alert.alert('📍 Guardado con Éxito', `"${title.trim()}" sincronizado en el Atlas Global.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          style={styles.keyboardAvoid}
        >
          <View style={styles.sheetCard}>
          {/* Top Progress & Navigation Bar */}
          <View style={styles.topHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {step !== 'entity' && (
                <TouchableOpacity onPress={handlePrevStep} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
              )}
              <View>
                <Text style={styles.modalTitle}>
                  {initialPlace ? '✏️ Editar Rincón' : '📍 Guardar en el Atlas'}
                </Text>
                <Text style={styles.stepBadgeText}>
                  Paso {getStepNumber()} de 5
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* SCREEN 1: ENTITY SELECTOR */}
          {step === 'entity' && (
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.screenHeading}>1. ¿Qué deseas guardar?</Text>
              <Text style={styles.screenSubheading}>
                Selecciona la entidad que mejor describe este momento o rincón:
              </Text>

              <View style={styles.entityGrid}>
                {/* 1. Etapa */}
                <TouchableOpacity
                  style={[styles.entityCard, type === 'stage' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('stage');
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>🏡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, type === 'stage' && styles.entityCardTitleActive]}>
                      Etapa de Vida
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Gran contenedor de época: agrupa viajes, citas, hogares y recuerdos de convivencia.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Gran Viaje */}
                <TouchableOpacity
                  style={[styles.entityCard, type === 'trip' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('trip');
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>✈️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, type === 'trip' && styles.entityCardTitleActive]}>
                      Gran Viaje
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Viajes largos, vuelos, vacaciones y estancias internacionales juntos.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Escapada (Separada de Cita) */}
                <TouchableOpacity
                  style={[styles.entityCard, type === 'getaway' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('getaway');
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>🚗</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, type === 'getaway' && styles.entityCardTitleActive]}>
                      Escapada
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Fin de semana fuera, escapadas románticas, relax o desconexión en pareja.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 4. Cita Romántica */}
                <TouchableOpacity
                  style={[styles.entityCard, type === 'date' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('date');
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>🥂</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, type === 'date' && styles.entityCardTitleActive]}>
                      Cita Romántica
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Cenas, paseos, tardes especiales y planes íntimos memorables.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 5. Restaurante */}
                <TouchableOpacity
                  style={[styles.entityCard, type === 'restaurant' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('restaurant');
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>🍽️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, type === 'restaurant' && styles.entityCardTitleActive]}>
                      Restaurante
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Rincón culinario: comidas, cenas o meriendas especiales.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 6. Hotel / Airbnb */}
                <TouchableOpacity
                  style={[styles.entityCard, (type as string) === 'hotel' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('hotel' as any);
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>🏨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, (type as string) === 'hotel' && styles.entityCardTitleActive]}>
                      Hotel / Airbnb
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Alojamiento romántico o estancia de fin de semana.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 7. Lugar / Rincón Familiar */}
                <TouchableOpacity
                  style={[styles.entityCard, type === 'memory' && styles.entityCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType('memory');
                    triggerHaptic('selection');
                    setStep('title');
                  }}
                >
                  <Text style={styles.entityCardIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.entityCardTitle, type === 'memory' && styles.entityCardTitleActive]}>
                      Lugar / Rincón Familiar
                    </Text>
                    <Text style={styles.entityCardDesc}>
                      Atemporal: Casa padres Andrea, casa iaios, miradores o sitios propios.
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* SCREEN 2: TITLE / NAME */}
          {step === 'title' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.screenHeading}>2. ¿Cómo se llama?</Text>
              <Text style={styles.screenSubheading}>
                {type === 'stage' && 'Escribe el nombre de esta época o etapa juntos'}
                {type === 'trip' && 'Escribe el destino o título del viaje'}
                {type === 'date' && 'Escribe el nombre o plan de la cita'}
                {type === 'restaurant' && 'Escribe el nombre del restaurante o cafetería'}
                {(type as string) === 'hotel' && 'Escribe el nombre del hotel o Airbnb'}
                {type === 'memory' && 'Escribe el nombre del rincón familiar o lugar'}
              </Text>

              <TextInput
                style={styles.largeTitleInput}
                placeholder={
                  type === 'stage'
                    ? 'Ej: Nuestra etapa en Canet...'
                    : type === 'trip'
                    ? 'Ej: Viaje a Roma...'
                    : type === 'date'
                    ? 'Ej: Cena romántica en Don Salvatore...'
                    : type === 'restaurant'
                    ? 'Ej: Latte & Farina, Honest Greens...'
                    : (type as string) === 'hotel'
                    ? 'Ej: Segundo Airbnb Romántico...'
                    : 'Ej: Casa de los padres de Andrea...'
                }
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <TouchableOpacity style={styles.wizardNextButton} activeOpacity={0.85} onPress={handleNextStep}>
                <Text style={styles.wizardNextButtonText}>Continuar a Ubicación →</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* SCREEN 3: LOCATION */}
          {step === 'location' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.screenHeading}>3. ¿Dónde se encuentra?</Text>
              <Text style={styles.screenSubheading}>
                Busca en Google Maps o ajusta el marcador en el mapa:
              </Text>

              <View style={styles.contextToggleRow}>
                <TouchableOpacity
                  style={[styles.contextToggleBtn, searchContext === 'valencia' && styles.contextToggleBtnActive]}
                  onPress={() => setSearchContext('valencia')}
                >
                  <Text style={[styles.contextToggleText, searchContext === 'valencia' && styles.contextToggleTextActive]}>
                    📍 Valencia
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.contextToggleBtn, searchContext === 'global' && styles.contextToggleBtnActive]}
                  onPress={() => setSearchContext('global')}
                >
                  <Text style={[styles.contextToggleText, searchContext === 'global' && styles.contextToggleTextActive]}>
                    🌍 Viajes / Global
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar en Google Maps..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {isSearching && <ActivityIndicator size="small" color="#EF826A" />}
              </View>

              {results.length > 0 && (
                <View style={styles.searchResultsBox}>
                  {results.slice(0, 4).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.resultItem}
                      onPress={() => handleSelectResult(item)}
                    >
                      <Text style={styles.resultTitle}>{item.name}</Text>
                      <Text style={styles.resultAddress} numberOfLines={1}>{item.formattedAddress}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.mapPreviewBox}>
                <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                <View style={styles.dragHintBadge}>
                  <Text style={styles.dragHintText}>🖐️ Arrastra el punto rojo para precisar</Text>
                </View>
              </View>

              <View style={styles.verifiedAddressCard}>
                <Text style={styles.verifiedCardTitle}>{verifiedName || title || 'Punto seleccionado'}</Text>
                <Text style={styles.verifiedCardAddress}>
                  {isReverseGeocoding ? 'Detectando dirección...' : verifiedAddress || 'Valencia'}
                </Text>
              </View>

              <TouchableOpacity style={styles.wizardNextButton} activeOpacity={0.85} onPress={handleNextStep}>
                <Text style={styles.wizardNextButtonText}>Continuar a Detalles →</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* SCREEN 4: SPECIFICS & TACTILE CALENDAR */}
          {step === 'specifics' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.screenHeading}>4. Detalles y Fechas</Text>
              <Text style={styles.screenSubheading}>
                Toca las fechas para abrirlas en el calendario táctil:
              </Text>

              {/* 🏡 ETAPA */}
              {type === 'stage' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>🏡 Configuración de Etapa de Vida</Text>
                  
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha Inicio (Desde)</Text>
                      <TouchableOpacity
                        style={styles.calendarTriggerButton}
                        onPress={() => setCalendarTarget('startDate')}
                      >
                        <Text style={styles.calendarTriggerText}>📅 {startDate || 'Seleccionar'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha Fin (Hasta)</Text>
                      <TouchableOpacity
                        style={[styles.calendarTriggerButton, isOngoing && { opacity: 0.5 }]}
                        disabled={isOngoing}
                        onPress={() => setCalendarTarget('endDate')}
                      >
                        <Text style={styles.calendarTriggerText}>
                          📅 {isOngoing ? 'Actualidad' : endDate || 'Seleccionar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsOngoing(!isOngoing)}>
                    <Text style={styles.checkboxEmoji}>{isOngoing ? '☑️' : '◻️'}</Text>
                    <Text style={styles.checkboxLabel}>Actualmente conviviendo aquí (Hogar actual)</Text>
                  </TouchableOpacity>

                  <Text style={styles.subFieldLabel}>Resumen de la etapa</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Convivencia junto al mar, paseos al atardecer..."
                    value={stageSummary}
                    onChangeText={setStageSummary}
                  />

                  {/* Momentos y Recuerdos de esta Etapa */}
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.subFieldLabel, { color: '#EF826A', fontWeight: '800' }]}>
                      ✨ Momentos y Rincones de esta Etapa ({selectedMomentIds.length} seleccionados)
                    </Text>
                    <Text style={styles.boxHelperText}>
                      Sugeridos según el rango de fechas ({startDate || 'Inicio'} a {isOngoing ? 'hoy' : (endDate || 'fin')}):
                    </Text>

                    {candidateMoments.length === 0 ? (
                      <View style={styles.emptyMomentsBox}>
                        <Text style={styles.emptyMomentsText}>
                          No hay otros recuerdos guardados en este rango de fechas aún.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.momentsSelectList}>
                        {candidateMoments.map((moment) => {
                          const isChecked = selectedMomentIds.includes(moment.id);
                          const icon =
                            moment.type === 'restaurant'
                              ? '🍽️'
                              : moment.type === 'trip'
                              ? '✈️'
                              : moment.type === 'getaway'
                              ? '🚗'
                              : moment.type === 'date'
                              ? '🥂'
                              : moment.type === 'hotel'
                              ? '🏨'
                              : '❤️';

                          return (
                            <TouchableOpacity
                              key={moment.id}
                              style={[styles.momentSelectRow, isChecked && styles.momentSelectRowActive]}
                              activeOpacity={0.75}
                              onPress={() => {
                                triggerHaptic('selection');
                                if (isChecked) {
                                  setSelectedMomentIds(selectedMomentIds.filter((id) => id !== moment.id));
                                } else {
                                  setSelectedMomentIds([...selectedMomentIds, moment.id]);
                                }
                              }}
                            >
                              <Text style={styles.momentSelectCheckbox}>{isChecked ? '☑️' : '◻️'}</Text>
                              <Text style={styles.momentSelectIcon}>{icon}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.momentSelectTitle} numberOfLines={1}>
                                  {moment.title}
                                </Text>
                                <Text style={styles.momentSelectSub} numberOfLines={1}>
                                  {moment.date || moment.startDate || moment.city || 'Valencia'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* ✈️ GRAN VIAJE */}
              {type === 'trip' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>✈️ Configuración del Gran Viaje</Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha de Salida</Text>
                      <TouchableOpacity
                        style={styles.calendarTriggerButton}
                        onPress={() => setCalendarTarget('startDate')}
                      >
                        <Text style={styles.calendarTriggerText}>📅 {startDate || 'Seleccionar'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Días de Duración</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ej: 4"
                        keyboardType="numeric"
                        value={tripDurationDays}
                        onChangeText={setTripDurationDays}
                      />
                    </View>
                  </View>

                  <Text style={[styles.subFieldLabel, { marginTop: 4 }]}>¿Quién invitó o financió el plan?</Text>
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

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>🏨 ¿Dónde dormisteis? (Hotel / Airbnb)</Text>
                  {accommodationItem ? (
                    <View style={styles.selectedItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedItemName}>🏨 {accommodationItem.name}</Text>
                        <Text style={styles.selectedItemAddr} numberOfLines={1}>{accommodationItem.formattedAddress}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setAccommodationItem(null)} style={styles.removeBtn}>
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <GoogleMapsPlaceSearchField
                      placeholder="Buscar Hotel / Airbnb en Google Maps..."
                      buttonLabel="+ Añadir Hotel o Airbnb del Viaje"
                      onPlaceSelected={(place) => {
                        setAccommodationItem(place);
                        setAccommodation(place.name);
                      }}
                    />
                  )}

                  <Text style={[styles.subFieldLabel, { marginTop: 10 }]}>
                    🍽️ Restaurantes y paradas visitadas ({visitedPlaceItems.length})
                  </Text>
                  {visitedPlaceItems.map((item, idx) => (
                    <View key={item.id || idx} style={styles.selectedItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedItemName}>
                          {item.type?.includes('restaurant') || item.type?.includes('food') ? '🍽️ ' : '📍 '}{item.name}
                        </Text>
                        <Text style={styles.selectedItemAddr} numberOfLines={1}>{item.formattedAddress}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setVisitedPlaceItems(visitedPlaceItems.filter((_, i) => i !== idx))}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <GoogleMapsPlaceSearchField
                    placeholder="Buscar restaurante o parada en Maps..."
                    buttonLabel="+ Añadir restaurante o parada visitada"
                    onPlaceSelected={(place) => setVisitedPlaceItems([...visitedPlaceItems, place])}
                  />

                  <TouchableOpacity
                    style={[styles.checkboxRow, { marginTop: 10 }]}
                    onPress={() => setHasDateInTrip(!hasDateInTrip)}
                  >
                    <Text style={styles.checkboxEmoji}>{hasDateInTrip ? '☑️' : '◻️'}</Text>
                    <Text style={styles.checkboxLabel}>Tuvimos una cita o cena especial en este viaje</Text>
                  </TouchableOpacity>

                  {hasDateInTrip && (
                    <View style={styles.subDateBox}>
                      <Text style={styles.subFieldLabel}>¿Quién invitó a la cita?</Text>
                      <View style={styles.invitedRow}>
                        <TouchableOpacity
                          style={[styles.invitedPill, tripDateInvitedBy === 'tonet' && styles.invitedPillActive]}
                          onPress={() => setTripDateInvitedBy('tonet')}
                        >
                          <Text style={styles.invitedPillText}>Tonet ❤️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.invitedPill, tripDateInvitedBy === 'andrea' && styles.invitedPillActive]}
                          onPress={() => setTripDateInvitedBy('andrea')}
                        >
                          <Text style={styles.invitedPillText}>Andrea 💖</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.invitedPill, tripDateInvitedBy === 'both' && styles.invitedPillActive]}
                          onPress={() => setTripDateInvitedBy('both')}
                        >
                          <Text style={styles.invitedPillText}>Ambos ✨</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.subFieldLabel}>Plan / Título de la cita</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ej: Cena romántica en el Trastevere"
                        value={tripDatePlan}
                        onChangeText={setTripDatePlan}
                      />

                      <Text style={styles.subFieldLabel}>Restaurante o Sitio de la cita</Text>
                      {tripDateRestaurantItem ? (
                        <View style={styles.selectedItemCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.selectedItemName}>🍽️ {tripDateRestaurantItem.name}</Text>
                            <Text style={styles.selectedItemAddr} numberOfLines={1}>{tripDateRestaurantItem.formattedAddress}</Text>
                          </View>
                          <TouchableOpacity onPress={() => setTripDateRestaurantItem(null)} style={styles.removeBtn}>
                            <Text style={styles.removeBtnText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <GoogleMapsPlaceSearchField
                          placeholder="Buscar restaurante de la cita en Google Maps..."
                          buttonLabel="+ Seleccionar Restaurante de la Cita"
                          onPlaceSelected={(place) => setTripDateRestaurantItem(place)}
                        />
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* 🚗 ESCAPADA (Categoría independiente de Cita) */}
              {type === 'getaway' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>🚗 Configuración de la Escapada</Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha de Inicio</Text>
                      <TouchableOpacity
                        style={styles.calendarTriggerButton}
                        onPress={() => setCalendarTarget('startDate')}
                      >
                        <Text style={styles.calendarTriggerText}>📅 {startDate || 'Seleccionar'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha de Regreso</Text>
                      <TouchableOpacity
                        style={styles.calendarTriggerButton}
                        onPress={() => setCalendarTarget('endDate')}
                      >
                        <Text style={styles.calendarTriggerText}>📅 {endDate || 'Seleccionar'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.subFieldLabel, { marginTop: 6 }]}>¿Quién invitó?</Text>
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

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>🏨 Hotel / Casa Rural / Destino</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Hotel Spa Rural, Cabaña en la montaña..."
                    value={accommodation}
                    onChangeText={setAccommodation}
                  />

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>
                    📍 Paradas y planes de la escapada ({datePlanItems.length})
                  </Text>
                  {datePlanItems.map((item, idx) => (
                    <View key={item.id || idx} style={styles.selectedItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedItemName}>📍 {item.name}</Text>
                        <Text style={styles.selectedItemAddr} numberOfLines={1}>{item.formattedAddress}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setDatePlanItems(datePlanItems.filter((_, i) => i !== idx))}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <GoogleMapsPlaceSearchField
                    placeholder="Buscar parada o plan en Google Maps..."
                    buttonLabel="+ Añadir parada o plan a la escapada"
                    onPlaceSelected={(place) => setDatePlanItems([...datePlanItems, place])}
                  />
                </View>
              )}

              {/* 🥂 CITA ROMÁNTICA */}
              {type === 'date' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>🥂 Configuración de la Cita Romántica</Text>

                  <Text style={styles.subFieldLabel}>Fecha de la Cita</Text>
                  <TouchableOpacity
                    style={styles.calendarTriggerButton}
                    onPress={() => setCalendarTarget('date')}
                  >
                    <Text style={styles.calendarTriggerText}>📅 {date || 'Seleccionar fecha'}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.subFieldLabel, { marginTop: 10 }]}>¿Quién invitó?</Text>
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

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>
                    📍 Conjunto de planes y paradas de la cita ({datePlanItems.length})
                  </Text>
                  {datePlanItems.map((item, idx) => (
                    <View key={item.id || idx} style={styles.selectedItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedItemName}>📍 {item.name}</Text>
                        <Text style={styles.selectedItemAddr} numberOfLines={1}>{item.formattedAddress}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setDatePlanItems(datePlanItems.filter((_, i) => i !== idx))}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <GoogleMapsPlaceSearchField
                    placeholder="Buscar plan (Restaurante, cine, mirador...) en Maps..."
                    buttonLabel="+ Añadir parada o plan a la cita"
                    onPlaceSelected={(place) => setDatePlanItems([...datePlanItems, place])}
                  />
                </View>
              )}

              {/* 🏨 HOTEL */}
              {(type as string) === 'hotel' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>🏨 Alojamiento (Hotel / Airbnb)</Text>
                  <Text style={styles.subFieldLabel}>Fecha de la estancia</Text>
                  <TouchableOpacity
                    style={styles.calendarTriggerButton}
                    onPress={() => setCalendarTarget('date')}
                  >
                    <Text style={styles.calendarTriggerText}>📅 {date || 'Seleccionar fecha'}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>Detalles de la estancia</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Apartamento acogedor con vistas, jacuzzi..."
                    value={stageSummary}
                    onChangeText={setStageSummary}
                  />

                  <Text style={[styles.subFieldLabel, { marginTop: 10 }]}>¿Quién invitó?</Text>
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
                </View>
              )}

              {/* 📍 LUGAR FAMILIAR (Atemporal) */}
              {type === 'memory' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>📍 Lugar o Rincón Familiar (Atemporal)</Text>
                  <Text style={styles.boxHelperText}>
                    Los lugares físicos no tienen fecha principal: son atemporales en vuestro mapa.
                  </Text>
                  <Text style={styles.subFieldLabel}>Tipo o Vínculo Familiar</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Casa Padres Andrea, Casa Iaios Andrea, Casa Iaios Tonet..."
                    value={stageSummary}
                    onChangeText={setStageSummary}
                  />

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>Emoción o Qué tiene de especial este sitio</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Comidas familiares de domingo, tardes de risas..."
                    value={emotionTag}
                    onChangeText={setEmotionTag}
                  />
                </View>
              )}

              {/* 🍽️ RESTAURANTE */}
              {type === 'restaurant' && (
                <View style={styles.stepSpecificBox}>
                  <Text style={styles.stepSpecificBoxTitle}>🍽️ Restaurante / Gastronomía</Text>
                  
                  <Text style={styles.subFieldLabel}>Fecha de la visita</Text>
                  <TouchableOpacity
                    style={styles.calendarTriggerButton}
                    onPress={() => setCalendarTarget('date')}
                  >
                    <Text style={styles.calendarTriggerText}>📅 {date || 'Seleccionar fecha'}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>Plato recomendado o Tipo de cocina</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Pasta fresca al pesto, Brunch saludable, Arroz del senyoret..."
                    value={stageSummary}
                    onChangeText={setStageSummary}
                  />

                  <Text style={[styles.subFieldLabel, { marginTop: 10 }]}>¿Quién invitó?</Text>
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
                </View>
              )}

              <TouchableOpacity style={styles.wizardNextButton} activeOpacity={0.85} onPress={handleNextStep}>
                <Text style={styles.wizardNextButtonText}>Continuar a Foto y Recuerdos →</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* SCREEN 5: MEDIA & STORY */}
          {step === 'media' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.screenHeading}>5. Foto y Nuestra Historia</Text>
              <Text style={styles.screenSubheading}>
                Añade una foto especial y escribe lo que ocurrió:
              </Text>

              <Text style={styles.fieldLabel}>📸 Foto de Portada</Text>
              <PhotoUploadField
                photoUrl={photoUrl}
                onPhotoUploaded={(url) => setPhotoUrl(url)}
                onPhotoRemoved={() => setPhotoUrl(null)}
              />

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>¿Qué pasó? / Nuestra Historia</Text>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Cuenta lo que vivimos juntos, anécdotas, sensaciones..."
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity style={styles.finalSaveButton} activeOpacity={0.85} onPress={handleFinalSave}>
                <Text style={styles.finalSaveButtonText}>💾 Guardar en el Atlas</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          )}

          {/* Interactive DatePicker Modal */}
          <CalendarPickerModal
            visible={Boolean(calendarTarget)}
            initialDate={
              calendarTarget === 'startDate'
                ? startDate
                : calendarTarget === 'endDate'
                ? endDate
                : date
            }
            title={
              calendarTarget === 'startDate'
                ? 'Fecha de Inicio / Salida'
                : calendarTarget === 'endDate'
                ? 'Fecha de Fin'
                : 'Selecciona la fecha'
            }
            onSelectDate={(selected) => {
              if (calendarTarget === 'startDate') setStartDate(selected);
              else if (calendarTarget === 'endDate') setEndDate(selected);
              else setDate(selected);
            }}
            onClose={() => setCalendarTarget(null)}
          />
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    width: '100%',
    maxHeight: '94%',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '100%',
    maxHeight: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.08)',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    color: '#3A2F38',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  stepBadgeText: {
    fontSize: 11,
    color: '#EF826A',
    fontWeight: '700',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#766B72',
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  screenHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  screenSubheading: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
    marginBottom: 14,
    fontFamily: 'Inter, sans-serif',
  },
  entityGrid: {
    gap: 8,
    paddingBottom: 24,
  },
  entityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  entityCardActive: {
    backgroundColor: '#FFF5F1',
    borderColor: '#EF826A',
  },
  entityCardIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  entityCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A2F38',
    marginBottom: 2,
  },
  entityCardTitleActive: {
    color: '#EF826A',
  },
  entityCardDesc: {
    fontSize: 11,
    color: '#766B72',
    lineHeight: 15,
  },
  largeTitleInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#3A2F38',
    marginVertical: 14,
  },
  wizardNextButton: {
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 14,
    shadowColor: '#EF826A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  wizardNextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contextToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F5EFE8',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  contextToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  contextToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  contextToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#766B72',
  },
  contextToggleTextActive: {
    color: '#3A2F38',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#3A2F38',
  },
  searchResultsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  resultItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.05)',
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
  },
  resultAddress: {
    fontSize: 11,
    color: '#766B72',
  },
  mapPreviewBox: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    position: 'relative',
    marginBottom: 8,
  },
  dragHintBadge: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(58, 47, 56, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  dragHintText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  verifiedAddressCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  verifiedCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A2F38',
  },
  verifiedCardAddress: {
    fontSize: 11,
    color: '#766B72',
    marginTop: 2,
  },
  stepSpecificBox: {
    backgroundColor: '#FFFDF9',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
    marginBottom: 12,
  },
  stepSpecificBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF826A',
    marginBottom: 6,
  },
  boxHelperText: {
    fontSize: 11,
    color: '#766B72',
    marginBottom: 8,
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 4,
  },
  calendarTriggerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF826A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  calendarTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2F38',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#3A2F38',
  },
  emptyMomentsBox: {
    padding: 12,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  emptyMomentsText: {
    fontSize: 12,
    color: '#766B72',
    textAlign: 'center',
  },
  momentsSelectList: {
    gap: 4,
    marginTop: 4,
  },
  momentSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
    gap: 8,
  },
  momentSelectRowActive: {
    backgroundColor: '#FFF5F2',
    borderColor: '#EF826A',
  },
  momentSelectCheckbox: {
    fontSize: 14,
  },
  momentSelectIcon: {
    fontSize: 14,
  },
  momentSelectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
  },
  momentSelectSub: {
    fontSize: 11,
    color: '#766B72',
    marginTop: 1,
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
  selectedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
    marginVertical: 3,
  },
  selectedItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2F38',
  },
  selectedItemAddr: {
    fontSize: 10,
    color: '#766B72',
  },
  removeBtn: {
    padding: 6,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#EF826A',
    fontWeight: '700',
  },
  subDateBox: {
    backgroundColor: '#FFF8F4',
    padding: 10,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 130, 106, 0.2)',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 6,
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
