import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconLogOut } from '../ui/Icons';
import { Button } from '../ui/Button';

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export function LogoutConfirmModal({
  visible,
  onClose,
  onConfirm,
  userName,
}: LogoutConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <IconLogOut size={24} color="#D95D5D" strokeWidth={2} />
          </View>

          <Text style={styles.title}>¿Cerrar sesión en este dispositivo?</Text>
          <Text style={styles.desc}>
            Hasta pronto, {userName}. Tus recuerdos, deseos y datos compartidos permanecen a salvo y sincronizados en la nube.
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic('medium');
                onConfirm();
              }}
            >
              <Text style={styles.confirmBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 25, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(217, 93, 93, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    fontSize: 17,
    color: '#1E252B',
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    ...Typography.body,
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#766B72',
  },
  confirmBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: '#D95D5D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
