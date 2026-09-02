import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle, ScrollView, Platform } from 'react-native';
import { Colors, Space, Layout } from '../../theme';
import { useDev } from '../../context/DevContext';
import { THEME_PALETTES } from '../../theme/colors';

export interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  fullBleed?: boolean;
  compact?: boolean;
  withTopInset?: boolean;
  backgroundColor?: string;
  scrollable?: boolean;
  bottomSpacing?: boolean;
}

export function ScreenWrapper({
  children,
  style,
  contentStyle,
  fullBleed = false,
  compact = false,
  withTopInset = false,
  backgroundColor,
  scrollable = true,
  bottomSpacing = true,
}: ScreenWrapperProps) {
  const { themePalette } = useDev();
  const currentTheme = THEME_PALETTES[themePalette] || THEME_PALETTES.atelier;
  const resolvedBg = backgroundColor || currentTheme.background;
  const horizontalPadding = fullBleed
    ? 0
    : compact
    ? Layout.screenPaddingCompact
    : Layout.screenPadding;

  const resolvedBottomPadding = bottomSpacing ? 120 : Space[4];

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: resolvedBg }, style]}>
        <View style={[styles.rootContainer, { backgroundColor: resolvedBg }]}>
          <View
            style={[
              styles.contentContainer,
              {
                paddingHorizontal: horizontalPadding,
                paddingTop: withTopInset ? Space[4] : 0,
                paddingBottom: resolvedBottomPadding,
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: resolvedBg }, style]}>
      <View style={[styles.rootContainer, { backgroundColor: resolvedBg }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContentContainer,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: withTopInset ? Space[4] : Space[2],
              paddingBottom: resolvedBottomPadding,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerMaxWidthWrapper}>
            {children}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    width: '100%',
    alignItems: 'center',
    flexGrow: 1,
  },
  innerMaxWidthWrapper: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
});
