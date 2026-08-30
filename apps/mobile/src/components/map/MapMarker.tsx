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
        return '#E05666'; // Coral primary
      case 'restaurant':
        return '#D4AF37'; // Butter / Gold
      case 'trip':
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
    const iconSize = isSelected ? 16 : 14;

    switch (place.type) {
      case 'memory':
        return <IconHeart size={iconSize} color={iconColor} strokeWidth={2.4} />;
      case 'restaurant':
        return <IconUtensils size={iconSize} color={iconColor} strokeWidth={2.4} />;
      case 'trip':
      case 'future_place':
        return <IconSparkles size={iconSize} color={iconColor} strokeWidth={2.4} />;
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
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  markerOrbSelected: {
    width: 38,
    height: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#E05666',
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  badgePill: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: '#141210',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  labelContainer: {
    marginTop: 5,
    backgroundColor: 'rgba(18, 16, 15, 0.88)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: 130,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },
});
