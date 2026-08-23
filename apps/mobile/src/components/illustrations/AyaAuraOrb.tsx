import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface AyaAuraOrbProps {
  size?: number;
}

export function AyaAuraOrb({ size = 72 }: AyaAuraOrbProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="35%" stopColor={Colors.light.secondary} stopOpacity="0.9" />
            <Stop offset="70%" stopColor={Colors.light.primary} stopOpacity="0.6" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="innerCore" cx="40%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="40%" stopColor="#D8CDFA" stopOpacity="0.9" />
            <Stop offset="100%" stopColor={Colors.light.secondaryDark} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Outer Glow Halo */}
        <Circle cx="50" cy="50" r="48" fill="url(#auraGlow)" />
        {/* Secondary Halo Ring */}
        <Circle cx="50" cy="50" r="38" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Core Sphere */}
        <Circle cx="50" cy="50" r="28" fill="url(#innerCore)" />
        {/* Sparkle High Light */}
        <Circle cx="42" cy="42" r="5" fill="#FFFFFF" opacity="0.85" />
        <Circle cx="58" cy="56" r="2" fill="#FFFFFF" opacity="0.7" />
      </Svg>
      <View style={styles.sparkleBadge}>
        <Text style={styles.sparkleEmoji}>✨</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  sparkleEmoji: {
    fontSize: 14,
  },
});
