# 📱 React Native Reanimated 3 & Gesture Handler Animations

Patrones de animación de 60/120 FPS en el thread nativo de UI para aplicaciones móviles y React Native Web.

---

## 1. Staggered Cascade Entry (Entrada en Cascada para Listas)

Cada elemento de una lista entra secuencialmente con una elevación suave y desvanecimiento de opacidad:

```tsx
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring
} from 'react-native-reanimated';

export function StaggeredCardItem({
  children,
  index = 0
}: {
  children: React.ReactNode;
  index?: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withSpring(1, { damping: 20, stiffness: 200 }));
    translateY.value = withDelay(index * 60, withSpring(0, { damping: 20, stiffness: 200 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
```

---

## 2. Interactive Pressable Scale con Haptic Touch

Efecto de compresión elástica ultra-satisfactoria al pulsar cualquier botón o tarjeta:

```tsx
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

export function ElasticPressable({
  children,
  onPress,
  scaleTo = 0.96,
  style
}: {
  children: React.ReactNode;
  onPress?: () => void;
  scaleTo?: number;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { stiffness: 450, damping: 25 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 350, damping: 20 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
```
