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
  showOverlayText = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flashAnim = useRef(new Animated.Value(0)).current;

  // 0.3s (300ms) Rapid Shooting Cycle
  useEffect(() => {
    if (isPaused || INTRO_PHOTOS.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INTRO_PHOTOS.length);
      
      // Micro shutter flash animation on each frame
      flashAnim.setValue(0.35);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, intervalMs]);

  const currentPhoto = INTRO_PHOTOS[currentIndex] || INTRO_PHOTOS[0];
  const photoCounter = `${String(currentIndex + 1).padStart(2, '0')} / ${String(INTRO_PHOTOS.length).padStart(2, '0')}`;

  const handleTap = () => {
    triggerHaptic('light');
    if (onTogglePause) onTogglePause();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
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

      {/* ⚡ Camera Shutter Flash Overlay */}
      <Animated.View
        style={[
          styles.shutterFlash,
          {
            opacity: flashAnim,
          },
        ]}
        pointerEvents="none"
      />

      {/* 🎬 Dark Vignette & Gradient Overlays */}
      <View style={styles.topVignette} pointerEvents="none" />
      <View style={styles.bottomVignette} pointerEvents="none" />

      {/* 🎞️ Shooting HUD / Film Indicators */}
      {showOverlayText && (
        <View style={styles.hudOverlay} pointerEvents="none">
          <View style={styles.hudTopRow}>
            <View style={styles.recBadge}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>SHOOTING · 0.3s</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{photoCounter}</Text>
            </View>
          </View>

          <View style={styles.hudCenterEditorial}>
            <Text style={styles.subBrand}>ANDREA & TONET</Text>
            <Text style={styles.mainTitle}>Atlas Privado</Text>
            <Text style={styles.dateTag}>15 · 02 · 2025</Text>
          </View>
        </View>
      )}
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
  shutterFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
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
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 24,
    paddingBottom: 380,
  },
  hudTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  recText: {
    fontFamily: Typography.family.medium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#FAF8F5',
    fontWeight: '700',
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  counterText: {
    fontFamily: Typography.family.medium,
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
    letterSpacing: 1,
  },
  hudCenterEditorial: {
    alignItems: 'center',
    marginTop: 20,
  },
  subBrand: {
    fontFamily: Typography.family.medium,
    fontSize: 12,
    letterSpacing: 3,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: Typography.family.bold,
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  dateTag: {
    fontFamily: Typography.family.regular,
    fontSize: 12,
    color: '#D4AF37',
    letterSpacing: 2,
    marginTop: 4,
  },
});
