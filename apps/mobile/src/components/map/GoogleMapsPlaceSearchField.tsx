import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { searchGooglePlaces, GeocodingResult } from '../../services/googlePlacesGeocoding';
import { triggerHaptic } from '../../utils/haptics';

export interface SelectedPlaceItem {
  id: string;
  name: string;
  formattedAddress: string;
  city?: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface GoogleMapsPlaceSearchFieldProps {
  placeholder?: string;
  buttonLabel?: string;
  onPlaceSelected: (place: SelectedPlaceItem) => void;
}

export function GoogleMapsPlaceSearchField({
  placeholder = 'Buscar en Google Maps (ej: Restaurante, Hotel...)',
  buttonLabel = '+ Añadir parada',
  onPlaceSelected,
}: GoogleMapsPlaceSearchFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodingResult[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim() || text.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchGooglePlaces(text);
      setResults(res.slice(0, 5));
    } catch (e) {
      console.warn('[SearchField] Error searching:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (r: GeocodingResult) => {
    triggerHaptic('selection');
    onPlaceSelected({
      id: 'place_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: r.name,
      formattedAddress: r.formattedAddress,
      city: r.city || 'Valencia',
      latitude: r.coordinates[1],
      longitude: r.coordinates[0],
      type: r.featureType || 'restaurant',
    });
    setQuery('');
    setResults([]);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.expandButton}
        activeOpacity={0.8}
        onPress={() => {
          triggerHaptic('light');
          setIsExpanded(true);
        }}
      >
        <Text style={styles.expandButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          autoCorrect={false}
        />
        {isSearching ? (
          <ActivityIndicator size= small color=#EF826A style={{ marginRight: 8 }} />
        ) : (
          <TouchableOpacity
            onPress={() => {
              setIsExpanded(false);
              setQuery('');
              setResults([]);
            }}
          >
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 && (
        <View style={styles.resultsList}>
          {results.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.resultItem}
              onPress={() => handleSelect(r)}
              activeOpacity={0.75}
            >
              <Text style={styles.resultName} numberOfLines={1}>{r.name}</Text>
              <Text style={styles.resultAddress} numberOfLines={1}>{r.formattedAddress}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expandButton: {
    backgroundColor: '#FFF3EE',
    borderWidth: 1.5,
    borderColor: '#EF826A',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF826A',
  },
  container: {
    marginVertical: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF826A',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#3A2F38',
  },
  cancelText: {
    fontSize: 14,
    color: '#766B72',
    padding: 4,
  },
  resultsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultItem: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.05)',
  },
  resultName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
  },
  resultAddress: {
    fontSize: 11,
    color: '#766B72',
  },
});
