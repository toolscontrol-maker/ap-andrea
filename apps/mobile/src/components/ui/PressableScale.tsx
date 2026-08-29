import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleProp } from 'react-native';
import { triggerHaptic } from '../../utils/haptics';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  scaleTo?: number; // Apple standard 0.96
  haptic?: 'light' | 'medium' | 'selection' | 'heavy' | 'none';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function PressableScale({
  children,
  onPress,
  onLongPress,
  scaleTo = 0.96,
  haptic = 'light',
  style,
  disabled = false,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    if (haptic !== 'none') {
      triggerHaptic(haptic);
    }
    Animated.spring(scale, {
      toValue: scaleTo,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
