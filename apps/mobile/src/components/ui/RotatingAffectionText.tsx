import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

const AFFECTION_WORDS = [
  'Andrea',
  'my love',
  'my wife',
  'my darling',
  'the best woman',
];

export function RotatingAffectionText() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Animate out (fade and move up)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -5,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2. Change word
        setIndex((prev) => (prev + 1) % AFFECTION_WORDS.length);
        translateYAnim.setValue(5);

        // 3. Animate in (fade and spring to position)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(translateYAnim, {
            toValue: 0,
            friction: 6,
            tension: 90,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.wordText,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {AFFECTION_WORDS[index]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wordText: {
    color: '#EF826A',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
  },
});
