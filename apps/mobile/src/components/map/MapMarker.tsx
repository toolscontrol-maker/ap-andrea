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
  isSelected?: boolean;
  onPress?: () => void;
}

export function MapMarker({ place, isSelected = false, onPress }: MapMarkerProps) {
  const getMarkerColor = () => {
    if (place.color) return place.color;
    switch (place.type) {
      case 'memory':
        return '#FF5376'; // Vivid Coral Rose
      case 'restaurant':
        return '#FFB800'; // Apple Maps Warm Gold
      case 'trip':
      case 'future_place':
        return '#38B6FF'; // Apple Maps Ocean Cyan / Sapphire
      case 'surprise':
        return '#FF3B30'; // Apple Maps Secret Red
      case 'important_date':
        return '#FFB800';
      default:
        return '#2E88FF';
    }
  };

  const renderIcon = () => {
    const iconColor = '#FFFFFF';
    const iconSize = isSelected ? 17 : 15;

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

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.markerContainer,
        isSelected && styles.markerContainerSelected,
      ]}
    >
      {/* 1. Apple Maps Floating Circular Orb */}
      <View
        style={[
          styles.markerOrb,
          { backgroundColor: markerColor },
          isSelected && styles.markerOrbSelected,
        ]}
      >
        {/* Inner Glass Glow */}
        <View style={styles.innerGlow} />
        {renderIcon()}
      </View>

      {/* 2. Apple Maps Multi-line Text Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.labelText, isSelected && styles.labelTextSelected]} numberOfLines={2}>
          {place.title}
        </Text>
        {place.subtitle ? (
          <Text style={styles.labelSubtext} numberOfLines={1}>
            {place.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    zIndex: 10,
  },
  markerContainerSelected: {
    transform: [{ scale: 1.1 }],
    zIndex: 999,
  },
  markerOrb: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  markerOrbSelected: {
    width: 42,
    height: 42,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#38B6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  labelContainer: {
    marginTop: 4,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  labelTextSelected: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: '#000000',
    textShadowRadius: 6,
  },
  labelSubtext: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 9.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
});
