import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AndreaMapPlace } from '../../types/map';
import { Radii } from '../../theme/tokens';
import {
  IconHeart,
  IconUtensils,
  IconSparkles,
  IconMapPin,
  IconGift,
  IconCalendar,
} from '../ui/Icons';

interface MapMarkerProps {
  place: AndreaMapPlace;
  itemCount?: number;
  isSelected?: boolean;
  onPress?: () => void;
}

export function MapMarker({
  place,
  itemCount = 1,
  isSelected = false,
  onPress,
}: MapMarkerProps) {
  const getMarkerColor = () => {
    if (place.color) return place.color;
    switch (place.type) {
      case 'memory':
      case 'date':
        return '#E05666'; // Romantic Coral
      case 'restaurant':
        return '#D4AF37'; // Butter / Gold
      case 'cafe':
        return '#C88A58'; // Warm Mocha
      case 'bar':
        return '#9B5DE5'; // Grape / Tardeo
      case 'home':
      case 'stage':
        return '#E76F51'; // Terracotta
      case 'hotel':
        return '#3A86FF'; // Ocean Stay
      case 'nature':
        return '#2A9D8F'; // Sage Nature
      case 'shop':
        return '#F15BB5'; // Pink Boutique
      case 'trip':
      case 'getaway':
      case 'future_place':
        return '#5C9F9A'; // Lavanda / Teal
      case 'surprise':
        return '#C47089'; // Deep Coral
      case 'important_date':
        return '#D4AF37';
      default:
        return '#5C9F9A';
    }
  };

  const renderIcon = () => {
    const iconColor = '#FFFFFF';
    const iconSize = isSelected ? 17 : 14;

    switch (place.type) {
      case 'memory':
      case 'date':
      case 'home':
      case 'stage':
        return <IconHeart size={iconSize} color={iconColor} strokeWidth={2.4} />;
      case 'restaurant':
      case 'cafe':
        return <IconUtensils size={iconSize} color={iconColor} strokeWidth={2.4} />;
      case 'bar':
      case 'trip':
      case 'getaway':
      case 'future_place':
      case 'nature':
        return <IconSparkles size={iconSize} color={iconColor} strokeWidth={2.4} />;
      case 'shop':
      case 'surprise':
        return <IconGift size={iconSize} color={iconColor} strokeWidth={2.4} />;
      case 'important_date':
        return <IconCalendar size={iconSize} color={iconColor} strokeWidth={2.4} />;
      default:
        return <IconMapPin size={iconSize} color={iconColor} strokeWidth={2.4} />;
    }
  };

  const markerColor = getMarkerColor();
  const isMulti = itemCount > 1;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.markerContainer,
        isSelected && styles.markerContainerSelected,
      ]}
    >
      {/* 1. Minimalist Circular Orb */}
      <View
        style={[
          styles.markerOrb,
          { backgroundColor: markerColor },
          isMulti && styles.markerOrbMulti,
          isSelected && styles.markerOrbSelected,
        ]}
      >
        {renderIcon()}

        {isMulti && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>+{itemCount}</Text>
          </View>
        )}
      </View>

      {/* 2. SHORT LABEL RULE: Only visible when isSelected is true */}
      {isSelected && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText} numberOfLines={2}>
            {place.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  markerContainerSelected: {
    transform: [{ scale: 1.15 }],
    zIndex: 999,
  },
  markerOrb: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 248, 242, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  markerOrbMulti: {
    width: 42,
    height: 42,
  },
  markerOrbSelected: {
    width: 42,
    height: 42,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#E05666',
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  badgePill: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: '#0A1426',
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 248, 242, 0.95)',
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  labelContainer: {
    marginTop: 6,
    backgroundColor: 'rgba(8, 16, 32, 0.92)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.2)',
    maxWidth: 140,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  labelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },
});
