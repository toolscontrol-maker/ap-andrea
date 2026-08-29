import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface BlurTextProps {
  text: string;
  delay?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  animateBy?: 'words' | 'letters';
}

export function BlurText({
  text,
  delay = 40,
  style,
  containerStyle,
  animateBy = 'words'
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const animatedValues = useRef(elements.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Stagger animation
    const animations = animatedValues.map((anim, i) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: i * delay,
        useNativeDriver: true
      });
    });

    Animated.stagger(delay, animations).start();
  }, [text]);

  return (
    <View style={[styles.container, containerStyle]}>
      {elements.map((el, i) => {
        const opacity = animatedValues[i] || new Animated.Value(1);
        const translateY = opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0]
        });

        return (
          <Animated.Text
            key={i}
            style={[
              styles.defaultText,
              style,
              {
                opacity,
                transform: [{ translateY }]
              }
            ]}
          >
            {el}{animateBy === 'words' ? ' ' : ''}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  defaultText: {
    color: Colors.light.text,
    fontSize: 15,
    lineHeight: 22
  }
});
