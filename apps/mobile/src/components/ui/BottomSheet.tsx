import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Radius, Space, Typography, Shadows, Layout } from '../../theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.light.scrim,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: Colors.light.surfaceElevated,
    borderTopLeftRadius: Radius.sheet, // 28
    borderTopRightRadius: Radius.sheet, // 28
    paddingHorizontal: Space[5], // 20
    paddingBottom: Space[7], // 32
    paddingTop: Space[3], // 12
    ...Shadows.floating,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderStrong,
    alignSelf: 'center',
    marginBottom: Space[3],
  },
  header: {
    marginBottom: Space[4],
    alignItems: 'center',
  },
  titleText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.h2.fontSize,
    color: Colors.light.text,
  },
  content: {
    width: '100%',
  },
});
