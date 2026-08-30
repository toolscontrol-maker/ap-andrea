import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle } from 'react-native';
import { Colors, Space, Layout } from '../../theme';

export interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  fullBleed?: boolean;
  compact?: boolean;
  withTopInset?: boolean;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  style,
  contentStyle,
  fullBleed = false,
  compact = false,
  withTopInset = false,
  backgroundColor = Colors.light.background,
}: ScreenWrapperProps) {
  const horizontalPadding = fullBleed
    ? 0
    : compact
    ? Layout.screenPaddingCompact
    : Layout.screenPadding;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
      <View style={[styles.rootContainer, { backgroundColor }]}>
        <View
          style={[
            styles.contentContainer,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: withTopInset ? Space[4] : 0,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
});
