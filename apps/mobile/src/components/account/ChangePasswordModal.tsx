import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconLock, IconCheck, IconShield } from '../ui/Icons';
import { Button } from '../ui/Button';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onChangePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export function ChangePasswordModal({
  visible,
  onClose,
  onChangePassword,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Falta la contraseña actual', 'Por favor introduce la contraseña actual (ej. 611171571).');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Falta la nueva contraseña', 'Por favor introduce la nueva clave de acceso.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'La nueva contraseña y la confirmación deben ser iguales.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const res = await onChangePassword(currentPassword.trim(), newPassword.trim());
      if (res.success) {
        setIsSuccess(true);
        triggerHaptic('success');
        setTimeout(() => {
          setIsSuccess(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          onClose();
        }, 1600);
      } else {
        Alert.alert('Error al cambiar contraseña', res.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <IconLock size={22} color={Colors.light.primary} strokeWidth={2} />
          </View>

          <Text style={styles.title}>Cambiar Contraseña de Pareja</Text>
          <Text style={styles.desc}>
            Actualiza la clave privada compartida. Se sincronizará inmediatamente para Tonet y Andrea.
          </Text>

          <View style={styles.inputsGroup}>
            <Text style={styles.label}>CONTRASEÑA ACTUAL</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce la clave actual"
              placeholderTextColor="#9E8E98"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />

            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="Nueva clave de acceso"
              placeholderTextColor="#9E8E98"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.label}>CONFIRMAR NUEVA CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="Repite la nueva clave"
              placeholderTextColor="#9E8E98"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {isSuccess ? (
            <View style={styles.successBox}>
              <IconCheck size={18} color="#2D8A4E" strokeWidth={2.5} />
              <Text style={styles.successText}>¡Contraseña actualizada en la nube! 🔐</Text>
            </View>
          ) : (
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
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmBtnText}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Clave ✨'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(224, 86, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    fontSize: 17,
    color: '#1E252B',
    textAlign: 'center',
    marginBottom: 4,
  },
  desc: {
    ...Typography.body,
    fontSize: 12.5,
    color: '#766B72',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: Spacing.lg,
  },
  inputsGroup: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
    fontSize: 14,
    color: '#1E252B',
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
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(45, 138, 78, 0.12)',
    borderRadius: Radii.lg,
    width: '100%',
    gap: 8,
  },
  successText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D8A4E',
  },
});
