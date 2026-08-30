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

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
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
        <View style={styles.modalCard}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[5],
    backgroundColor: Colors.light.scrim,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: Radius.xl, // 24
    padding: Space[5], // 20
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.floating,
  },
  header: {
    marginBottom: Space[4],
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
