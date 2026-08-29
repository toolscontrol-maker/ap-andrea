import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Shadows } from '../../theme/tokens';

interface TiltedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'subtle';
  maxScale?: number;
}

export function TiltedCard({
  children,
  onPress,
  style,
  variant = 'elevated',
  maxScale = 0.98
}: TiltedCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: maxScale,
        friction: 5,
        tension: 100,
        useNativeDriver: true
      }),
      Animated.spring(rotateX, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true
      }),
      Animated.spring(rotateX, {
        toValue: 0,
        friction: 5,
        tension: 80,
        useNativeDriver: true
      })
    ]).start();
  };

  const rotateXInterpolate = rotateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg']
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ overflow: 'visible' }}
    >
      <Animated.View
        style={[
          styles.base,
          variant === 'elevated' && styles.elevated,
          variant === 'subtle' && styles.subtle,
          style,
          {
            transform: [
              { scale },
              { perspective: 800 },
              { rotateX: rotateXInterpolate }
            ]
          }
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden'
  },
  elevated: {
    backgroundColor: Colors.light.surfaceElevated,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.md
  },
  subtle: {
    backgroundColor: Colors.light.surfaceSubtle,
    borderColor: 'transparent'
  }
});
