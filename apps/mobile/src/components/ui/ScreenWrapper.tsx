import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Layout, Spacing } from '../../theme/tokens';

interface ScreenWrapperProps {
  children: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  headerComponent?: ReactNode;
  bottomComponent?: ReactNode;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  contentContainerStyle,
  style,
  headerComponent,
  bottomComponent,
}: ScreenWrapperProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {/* Outer Center Container for Web / Desktop / Tablet */}
      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          {headerComponent}

          {scrollable ? (
            <ScrollView
              contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.fixedContent, contentContainerStyle]}>{children}</View>
          )}

          {bottomComponent}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.md,
    paddingBottom: Spacing['5xl'],
  },
  fixedContent: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
});
