import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { INTRO_PHOTOS } from '../../constants/introImages';
import { Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IntroShootingAnimationProps {
  intervalMs?: number; // Default: 300ms (0.3s)
  isPaused?: boolean;
  onTogglePause?: () => void;
  showOverlayText?: boolean;
}

export const IntroShootingAnimation: React.FC<IntroShootingAnimationProps> = ({
  intervalMs = 300,
  isPaused = false,
  onTogglePause,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 0.3s (300ms) Clean Image Transition (No flash)
  useEffect(() => {
    if (isPaused || INTRO_PHOTOS.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INTRO_PHOTOS.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, intervalMs]);

  const currentPhoto = INTRO_PHOTOS[currentIndex] || INTRO_PHOTOS[0];

  const handleTap = () => {
    triggerHaptic('light');
    if (onTogglePause) onTogglePause();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.98}
      onPress={handleTap}
      style={styles.container}
    >
      {/* 📸 Background Photo with Cover Aspect */}
      {currentPhoto && (
        <Image
          source={currentPhoto.source}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      {/* 🎬 Dark Vignette & Gradient Overlays for High Legibility */}
      <View style={styles.topVignette} pointerEvents="none" />
      <View style={styles.bottomVignette} pointerEvents="none" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0E0D',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(15, 14, 13, 0.45)',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 440,
    backgroundColor: 'rgba(15, 14, 13, 0.88)',
  },
});
