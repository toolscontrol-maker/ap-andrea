import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

interface SettingsSubpageContainerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SettingsSubpageContainer({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: SettingsSubpageContainerProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
          >
            <Text style={styles.backBtnText}>‹ Ajustes</Text>
          </TouchableOpacity>

          <View style={styles.titleCol}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              onClose();
            }}
          >
            <Text style={styles.doneBtnText}>Listo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.08)',
    backgroundColor: '#FFFFFF',
    minHeight: 52,
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radii.md,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  titleCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E252B',
    fontFamily: 'Inter, sans-serif',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#766B72',
    marginTop: 1,
  },
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  body: {
    flex: 1,
  },
});
