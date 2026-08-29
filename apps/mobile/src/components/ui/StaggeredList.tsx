import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface StaggeredItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  style?: ViewStyle;
}

export function StaggeredItem({
  children,
  index,
  delay = 50,
  style
}: StaggeredItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay: index * delay,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 80,
        delay: index * delay,
        useNativeDriver: true
      })
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}
