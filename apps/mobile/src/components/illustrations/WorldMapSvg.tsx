import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface WorldMapSvgProps {
  width?: number | string;
  height?: number;
}

export function WorldMapSvg({ width = '100%', height = 210 }: WorldMapSvgProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Svg width={width as any} height={height} viewBox="0 0 800 420" fill="none">
        <Defs>
          <RadialGradient id="oceanGlow" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor="#DDEAF2" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#C8DDE9" stopOpacity="0.95" />
          </RadialGradient>
          <LinearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#F4F8FA" stopOpacity="0.85" />
          </LinearGradient>
          <LinearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={Colors.light.primary} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={Colors.light.butter} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={Colors.light.secondary} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Ocean Background */}
        <Path d="M0 0 H800 V420 H0 Z" fill="url(#oceanGlow)" />

        {/* Delicate Latitude / Longitude Grid Lines */}
        <Line x1="0" y1="105" x2="800" y2="105" stroke="rgba(74, 124, 155, 0.12)" strokeWidth="1" strokeDasharray="4 6" />
        <Line x1="0" y1="210" x2="800" y2="210" stroke="rgba(74, 124, 155, 0.18)" strokeWidth="1" />
        <Line x1="0" y1="315" x2="800" y2="315" stroke="rgba(74, 124, 155, 0.12)" strokeWidth="1" strokeDasharray="4 6" />
        <Line x1="200" y1="0" x2="200" y2="420" stroke="rgba(74, 124, 155, 0.12)" strokeWidth="1" strokeDasharray="4 6" />
        <Line x1="400" y1="0" x2="400" y2="420" stroke="rgba(74, 124, 155, 0.15)" strokeWidth="1" />
        <Line x1="600" y1="0" x2="600" y2="420" stroke="rgba(74, 124, 155, 0.12)" strokeWidth="1" strokeDasharray="4 6" />

        {/* North America */}
        <Path
          d="M120 70 Q160 60 210 90 Q240 120 220 160 Q190 190 170 210 Q140 190 120 150 Q90 120 120 70 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.25)"
          strokeWidth="1.5"
        />

        {/* South America */}
        <Path
          d="M210 230 Q250 240 260 280 Q250 340 220 380 Q190 340 195 290 Q190 250 210 230 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.25)"
          strokeWidth="1.5"
        />

        {/* Europe & North Africa */}
        <Path
          d="M370 70 Q430 65 460 90 Q480 130 450 160 Q400 170 370 140 Q350 100 370 70 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.25)"
          strokeWidth="1.5"
        />

        {/* Africa */}
        <Path
          d="M380 180 Q450 170 470 220 Q480 290 430 350 Q380 330 370 260 Q360 210 380 180 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.25)"
          strokeWidth="1.5"
        />

        {/* Asia */}
        <Path
          d="M480 80 Q590 60 670 100 Q710 150 680 200 Q600 230 540 190 Q490 150 480 80 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.25)"
          strokeWidth="1.5"
        />

        {/* Japan Islands */}
        <Path
          d="M710 120 Q725 130 720 150 Q710 160 705 140 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.3)"
          strokeWidth="1.5"
        />

        {/* Oceania / Australia */}
        <Path
          d="M620 270 Q690 260 710 300 Q700 350 640 350 Q600 330 620 270 Z"
          fill="url(#landGrad)"
          stroke="rgba(74, 124, 155, 0.25)"
          strokeWidth="1.5"
        />

        {/* Romantic Arc Travel Flight Paths connecting our cities (Madrid -> Roma -> París -> Kioto -> Bali) */}
        {/* Madrid(385, 135) to Roma(420, 130) */}
        <Path d="M385 135 Q402 115 420 130" stroke="url(#arcGlow)" strokeWidth="2.5" strokeDasharray="3 4" />
        {/* Roma(420, 130) to Paris(395, 110) */}
        <Path d="M420 130 Q405 105 395 110" stroke="url(#arcGlow)" strokeWidth="2.5" strokeDasharray="3 4" />
        {/* Paris(395, 110) to Kioto(712, 138) */}
        <Path d="M395 110 Q550 40 712 138" stroke="url(#arcGlow)" strokeWidth="2.5" strokeDasharray="4 5" />
        {/* Kioto(712, 138) to Bali(645, 255) */}
        <Path d="M712 138 Q690 200 645 255" stroke="url(#arcGlow)" strokeWidth="2.5" strokeDasharray="4 5" />

        {/* Subtle Constellation Glow Stars */}
        <Circle cx="150" cy="50" r="1.5" fill="#FFFFFF" opacity="0.8" />
        <Circle cx="300" cy="40" r="2" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="520" cy="45" r="1.5" fill="#FFFFFF" opacity="0.7" />
        <Circle cx="750" cy="80" r="2" fill="#FFFFFF" opacity="0.8" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
});
