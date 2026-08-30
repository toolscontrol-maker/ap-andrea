import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// 1. apps/mobile/src/services/googlePlacesGeocoding.ts
const googlePlacesGeocodingTs = `import { loadGoogleMapsSDK, GOOGLE_MAPS_API_KEY } from '../lib/googleMaps';

export interface GeocodingResult {
  id: string;
  name: string;
  formattedAddress: string;
  city?: string;
  country?: string;
  coordinates: [number, number]; // [longitude, latitude]
  featureType: string;
  relevance: number;
  category?: string;
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
}

export interface SearchOptions {
  proximity?: [number, number]; // [longitude, latitude]
  country?: string; // e.g. 'es'
  types?: string;
}

let autocompleteServiceInstance: any = null;

/**
 * Search places using Google Places Autocomplete & Geocoder
 */
export async function searchGooglePlaces(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  try {
    const googleMaps = await loadGoogleMapsSDK();
    if (!googleMaps) {
      return searchGooglePlacesViaRest(q, options);
    }

    // Try Google Places Autocomplete first for richer restaurant and POI indexing
    if (googleMaps.places && typeof googleMaps.places.AutocompleteService === 'function') {
      try {
        if (!autocompleteServiceInstance) {
          autocompleteServiceInstance = new googleMaps.places.AutocompleteService();
        }

        const centerLat = options?.proximity ? options.proximity[1] : 39.4699;
        const centerLng = options?.proximity ? options.proximity[0] : -0.3763;

        const predictions: any[] = await new Promise((resolve) => {
          autocompleteServiceInstance.getPlacePredictions(
            {
              input: q,
              componentRestrictions: { country: options?.country || 'es' },
              locationBias: new googleMaps.LatLngBounds(
                new googleMaps.LatLng(centerLat - 0.35, centerLng - 0.35),
                new googleMaps.LatLng(centerLat + 0.35, centerLng + 0.35)
              ),
            },
            (preds: any[], status: string) => {
              if (status === 'OK' && preds) {
                resolve(preds);
              } else {
                resolve([]);
              }
            }
          );
        });

        if (predictions && predictions.length > 0) {
          const geocoder = new googleMaps.Geocoder();

          const mappedPromises = predictions.slice(0, 6).map(async (pred, idx) => {
            const mainText = pred.structured_formatting?.main_text || pred.description.split(',')[0];
            const secondaryText = pred.structured_formatting?.secondary_text || pred.description;

            // Geocode placeId to get exact lat/lng
            let coords: [number, number] = [centerLng, centerLat];
            let city = 'Valencia';
            let country = 'España';
            let formattedAddress = pred.description;

            try {
              const geoRes: any = await new Promise((res) => {
                geocoder.geocode({ placeId: pred.place_id }, (r: any[], s: string) => {
                  if (s === 'OK' && r && r[0]) res(r[0]);
                  else res(null);
                });
              });

              if (geoRes) {
                coords = [geoRes.geometry.location.lng(), geoRes.geometry.location.lat()];
                formattedAddress = geoRes.formatted_address || pred.description;
                const comps = geoRes.address_components || [];
                for (const c of comps) {
                  if (c.types.includes('locality')) city = c.long_name;
                  if (c.types.includes('country')) country = c.long_name;
                }
              }
            } catch {
              // fallback
            }

            const isRestaurant =
              pred.types?.some((t: string) =>
                ['restaurant', 'food', 'cafe', 'bar', 'bakery', 'meal_takeaway'].includes(t)
              ) || false;

            return {
              id: pred.place_id || ('pred-' + idx + '-' + Date.now()),
              placeId: pred.place_id,
              name: mainText,
              formattedAddress: secondaryText || formattedAddress,
              city,
              country,
              coordinates: coords,
              featureType: isRestaurant ? 'restaurant' : (pred.types?.[0] || 'poi'),
              relevance: 1 - idx * 0.1,
              category: isRestaurant ? 'restaurant' : undefined,
            };
          });

          const resolved = await Promise.all(mappedPromises);
          if (resolved.length > 0) return resolved;
        }
      } catch (autoErr) {
        console.warn('[GooglePlaces] Autocomplete error, falling back to Geocoder:', autoErr);
      }
    }

    // Geocoder fallback
    const geocoder = new googleMaps.Geocoder();
    const centerLat = options?.proximity ? options.proximity[1] : 39.4699;
    const centerLng = options?.proximity ? options.proximity[0] : -0.3763;

    return new Promise((resolve) => {
      geocoder.geocode(
        {
          address: q,
          componentRestrictions: { country: options?.country || 'es' },
          bounds: new googleMaps.LatLngBounds(
            new googleMaps.LatLng(centerLat - 0.3, centerLng - 0.3),
            new googleMaps.LatLng(centerLat + 0.3, centerLng + 0.3)
          ),
        },
        (results: any[], status: string) => {
          if (status !== 'OK' || !results || results.length === 0) {
            resolve(searchGooglePlacesViaRest(q, options));
            return;
          }

          const parsed: GeocodingResult[] = results.slice(0, 6).map((item, index) => {
            const lat = item.geometry.location.lat();
            const lng = item.geometry.location.lng();
            const addressComponents = item.address_components || [];

            let city = 'Valencia';
            let country = 'España';

            for (const comp of addressComponents) {
              if (comp.types.includes('locality')) city = comp.long_name;
              if (comp.types.includes('country')) country = comp.long_name;
            }

            const name = item.formatted_address.split(',')[0] || q;

            return {
              id: item.place_id || ('gplace-' + index + '-' + Date.now()),
              placeId: item.place_id,
              name,
              formattedAddress: item.formatted_address,
              city,
              country,
              coordinates: [lng, lat],
              featureType: item.types?.[0] || 'poi',
              relevance: 1 - index * 0.1,
            };
          });

          resolve(parsed);
        }
      );
    });
  } catch (err) {
    console.warn('[GooglePlaces] Search failed, fallback to REST:', err);
    return searchGooglePlacesViaRest(q, options);
  }
}

/**
 * Fallback REST search
 */
async function searchGooglePlacesViaRest(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  try {
    const lat = options?.proximity ? options.proximity[1] : 39.4699;
    const lng = options?.proximity ? options.proximity[0] : -0.3763;
    const url =
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
      encodeURIComponent(query) +
      '&components=country:es&key=' +
      GOOGLE_MAPS_API_KEY;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    return data.results.slice(0, 6).map((item: any, idx: number) => {
      const latVal = item.geometry.location.lat;
      const lngVal = item.geometry.location.lng;
      return {
        id: item.place_id || ('rest-' + idx),
        name: item.formatted_address.split(',')[0] || query,
        formattedAddress: item.formatted_address,
        city: 'Valencia',
        country: 'España',
        coordinates: [lngVal, latVal],
        featureType: item.types?.[0] || 'poi',
        relevance: 1 - idx * 0.1,
      };
    });
  } catch (e) {
    console.error('[GooglePlaces] REST fallback error:', e);
    return [];
  }
}

/**
 * Reverse geocodes coordinates to a human-readable address
 */
export async function reverseGeocodeGoogleCoordinates(
  coordinates: [number, number] // [lng, lat]
): Promise<GeocodingResult | null> {
  const [lng, lat] = coordinates;

  try {
    const googleMaps = await loadGoogleMapsSDK();
    if (googleMaps && googleMaps.Geocoder) {
      const geocoder = new googleMaps.Geocoder();
      return new Promise((resolve) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any[], status: string) => {
            if (status !== 'OK' || !results || results.length === 0) {
              resolve(reverseGeocodeViaRest(coordinates));
              return;
            }

            const item = results[0];
            let city = 'Valencia';
            let country = 'España';

            for (const comp of item.address_components || []) {
              if (comp.types.includes('locality')) city = comp.long_name;
              if (comp.types.includes('country')) country = comp.long_name;
            }

            resolve({
              id: item.place_id || 'rev-place',
              placeId: item.place_id,
              name: item.formatted_address.split(',')[0] || 'Lugar seleccionado',
              formattedAddress: item.formatted_address,
              city,
              country,
              coordinates: [lng, lat],
              featureType: item.types?.[0] || 'address',
              relevance: 1.0,
            });
          }
        );
      });
    }

    return reverseGeocodeViaRest(coordinates);
  } catch (err) {
    return reverseGeocodeViaRest(coordinates);
  }
}

async function reverseGeocodeViaRest(
  coordinates: [number, number]
): Promise<GeocodingResult | null> {
  const [lng, lat] = coordinates;
  try {
    const url =
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      lat +
      ',' +
      lng +
      '&key=' +
      GOOGLE_MAPS_API_KEY;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const top = data.results[0];
    return {
      id: top.place_id || 'rest-rev',
      placeId: top.place_id,
      name: top.formatted_address.split(',')[0],
      formattedAddress: top.formatted_address,
      city: 'Valencia',
      country: 'España',
      coordinates: [lng, lat],
      featureType: 'address',
      relevance: 1.0,
    };
  } catch {
    return null;
  }
}
`;

fs.writeFileSync(path.join(mobileRoot, 'src', 'services', 'googlePlacesGeocoding.ts'), googlePlacesGeocodingTs, 'utf8');

// 2. apps/mobile/src/components/map/AddPlaceLocationModal.tsx
const addPlaceModalTs = `import React, { useState, useEffect, useRef } from 'react';
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
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';

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
  const [locationSource, setLocationSource] = useState<LocationSource>('google_places');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Details state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MapPlaceType>('memory');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Web Map reference for interactive pin adjustment
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
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
        setLocationSource(initialPlace.source || 'google_places');
        setType(initialPlace.type || 'memory');
        setDate(initialPlace.date || new Date().toISOString().split('T')[0]);
        setDescription(initialPlace.description || '');
        setPhotoUrl(initialPlace.imageUrl || null);
        setSearchQuery(initialPlace.title);
        setStep('search'); // Open directly with search indexed for immediate re-searching!
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
      }
    }
  }, [visible, initialPlace]);

  // Debounced forward Google Places search
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

  // Interactive Web Map for Pin Confirmation
  useEffect(() => {
    if (step !== 'confirm_pin' || Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isMounted = true;

    async function initMiniMap() {
      if (!mapContainerRef.current) return;

      const googleMaps = await loadGoogleMapsSDK();
      if (!isMounted || !mapContainerRef.current || !googleMaps) return;

      // Clean old marker instance
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

      const markerColor = type === 'restaurant' ? '#F4C95D' : '#EF826A';
      const markerIcon = type === 'restaurant' ? '🍽️' : '📍';

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

  // Handle selecting a Google Places suggestion
  const handleSelectSuggestion = (res: GeocodingResult) => {
    triggerHaptic('selection');
    setSelectedCoordinates(res.coordinates); // [lng, lat]
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

  // Handle manual pin option
  const handleManualPin = () => {
    triggerHaptic('medium');
    setSelectedCoordinates([-0.3763, 39.4699]); // Valencia Center
    setVerifiedName('Punto en el mapa');
    setVerifiedAddress('Valencia, España');
    setVerifiedCity('Valencia');
    setTitle(searchQuery || 'Nuestro Rincón');
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
      id: initialPlace?.id || ('place-verified-' + Date.now()),
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
    Alert.alert('📍 Guardado en el Mapa', '"' + title.trim() + '" sincronizado con éxito.');
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

          {/* Stepper Progress Bar */}
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 1: GOOGLE PLACES SEARCH BAR & INDEXED AUTOCOMPLETE        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 'search' && (
            <View style={styles.contentContainer}>
              <Text style={styles.stepSubtitle}>
                Busca cualquier restaurante, café, plaza, playa o rincón en Google Maps:
              </Text>

              {/* Search Bar Input */}
              <View style={styles.searchBarWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ej: Casa d'Aragona, Honest Greens, Plaza de la Virgen..."
                  placeholderTextColor="#9E8ACD"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  clearButtonMode="while-editing"
                />
                {isSearching && <ActivityIndicator size="small" color="#EF826A" />}
                {Boolean(searchQuery) && !isSearching && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Scope toggle chips */}
              <View style={styles.scopeChipsRow}>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'valencia' && styles.scopeChipActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSearchContext('valencia');
                  }}
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
                  onPress={() => {
                    triggerHaptic('selection');
                    setSearchContext('global');
                  }}
                >
                  <Text
                    style={[
                      styles.scopeChipText,
                      searchContext === 'global' && styles.scopeChipTextActive,
                    ]}
                  >
                    🌍 Toda España / Viajes
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Autocomplete Results List */}
              <ScrollView style={styles.resultsScrollView} keyboardShouldPersistTaps="handled">
                {results.map((res) => (
                  <TouchableOpacity
                    key={res.id}
                    style={styles.resultRow}
                    activeOpacity={0.8}
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

                {searchQuery.trim().length >= 2 && !isSearching && results.length === 0 && (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      No se encontraron sugerencias exactas para "{searchQuery}".
                    </Text>
                    <TouchableOpacity style={styles.manualPinBtn} onPress={handleManualPin}>
                      <Text style={styles.manualPinBtnText}>📍 Colocar pin manualmente en el mapa</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Pre-existing / quick actions */}
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 2: CONFIRM PIN & INTERACTIVE GOOGLE MAP ADJUSTMENT        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 'confirm_pin' && (
            <View style={styles.contentContainer}>
              <View style={styles.pinHeaderCard}>
                <Text style={styles.pinHeaderTitle} numberOfLines={1}>
                  {verifiedName || title || 'Ubicación seleccionada'}
                </Text>
                <Text style={styles.pinHeaderSubtitle} numberOfLines={2}>
                  {isReverseGeocoding ? 'Detectando dirección exacta...' : verifiedAddress || verifiedCity}
                </Text>

                {/* Quick Re-Search Action */}
                <TouchableOpacity
                  style={styles.reSearchPill}
                  onPress={() => {
                    triggerHaptic('selection');
                    setStep('search');
                  }}
                >
                  <Text style={styles.reSearchPillText}>🔍 Buscar otro restaurante o sitio en Google Maps</Text>
                </TouchableOpacity>
              </View>

              {/* Interactive Mini Google Map */}
              <View style={styles.miniMapContainer}>
                <div
                  ref={mapContainerRef}
                  style={{ width: '100%', height: '100%', borderRadius: 16 }}
                />
                <View style={styles.mapBadgeOverlay}>
                  <Text style={styles.mapBadgeText}>👆 Toca o arrastra el marcador para ajustar los metros</Text>
                </View>
              </View>

              {/* Precision selector */}
              <View style={styles.precisionRow}>
                <TouchableOpacity
                  style={[
                    styles.precisionPill,
                    locationPrecision === 'exact' && styles.precisionPillActive,
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setLocationPrecision('exact');
                  }}
                >
                  <Text
                    style={[
                      styles.precisionPillText,
                      locationPrecision === 'exact' && styles.precisionPillTextActive,
                    ]}
                  >
                    🎯 Punto Exacto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.precisionPill,
                    locationPrecision === 'approximate' && styles.precisionPillActive,
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setLocationPrecision('approximate');
                  }}
                >
                  <Text
                    style={[
                      styles.precisionPillText,
                      locationPrecision === 'approximate' && styles.precisionPillTextActive,
                    ]}
                  >
                    🫧 Zona Aproximada
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.primaryActionButton} onPress={handleConfirmPin}>
                <Text style={styles.primaryActionText}>Continuar a Detalles →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 3: DETAILS, CATEGORY, DATE, PHOTO & SAVE                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 'details' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              {/* Title Field */}
              <Text style={styles.fieldLabel}>Nombre / Título del Rincón</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Cena especial en Casa d'Aragona..."
                value={title}
                onChangeText={setTitle}
              />

              {/* Category Pills */}
              <Text style={styles.fieldLabel}>Categoría del Lugar</Text>
              <View style={styles.categoryRow}>
                <TouchableOpacity
                  style={[styles.categoryPill, type === 'memory' && styles.categoryPillActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setType('memory');
                  }}
                >
                  <Text style={styles.categoryPillText}>❤️ Recuerdo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'restaurant' && styles.categoryPillActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setType('restaurant');
                  }}
                >
                  <Text style={styles.categoryPillText}>🍽️ Restaurante</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'trip' && styles.categoryPillActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setType('trip');
                  }}
                >
                  <Text style={styles.categoryPillText}>🧭 Viaje / Escapada</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'surprise' && styles.categoryPillActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setType('surprise');
                  }}
                >
                  <Text style={styles.categoryPillText}>🎁 Sorpresa</Text>
                </TouchableOpacity>
              </View>

              {/* Date Field */}
              <Text style={styles.fieldLabel}>Fecha del Momento</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />

              {/* Description Field */}
              <Text style={styles.fieldLabel}>Nuestra Historia / Nota Especial</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="¿Qué hizo especial este momento juntos? Risas, anécdotas, platos favoritos..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              {/* Photo Upload Field */}
              <Text style={styles.fieldLabel}>Fotografía del Lugar (Opcional)</Text>
              <PhotoUploadField
                photoUrl={photoUrl}
                onPhotoSelected={setPhotoUrl}
                placeholderText="Toca para añadir una foto de la galería o cámara"
              />

              {/* Final Save Button */}
              <TouchableOpacity style={styles.finalSaveButton} onPress={handleFinalSave}>
                <Text style={styles.finalSaveButtonText}>
                  💾 {initialPlace ? 'Guardar Cambios' : 'Anclar Momento en el Mapa'}
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
    maxHeight: '90%',
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
    fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#9E8ACD',
    paddingHorizontal: 4,
    fontWeight: 'bold',
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
    fontFamily: 'Inter, sans-serif',
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
    shadowColor: '#3A2F38',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
    fontFamily: 'Inter, sans-serif',
    marginBottom: 2,
  },
  resultSubAddress: {
    fontSize: 12,
    color: '#766B72',
    fontFamily: 'Inter, sans-serif',
  },
  resultArrow: {
    fontSize: 16,
    color: '#EF826A',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
    marginBottom: 12,
  },
  manualPinBtn: {
    backgroundColor: '#EF826A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  manualPinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontFamily: 'Inter, sans-serif',
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
    marginBottom: 12,
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
    fontFamily: 'Inter, sans-serif',
  },
  precisionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  precisionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
  },
  precisionPillActive: {
    backgroundColor: '#3A2F38',
  },
  precisionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#766B72',
  },
  precisionPillTextActive: {
    color: '#FFFFFF',
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
    fontFamily: 'Inter, sans-serif',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 6,
    marginTop: 10,
    fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    fontFamily: 'Inter, sans-serif',
  },
});
`;

fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'AddPlaceLocationModal.tsx'), addPlaceModalTs, 'utf8');

console.log('✅ Clean Google Places Autocomplete and AddPlaceLocationModal upgrade complete.');
`;

fs.writeFileSync(path.join(projectRoot, 'scratch', 'upgrade_google_places_clean.mjs'), cleanScript, 'utf8');
