import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconCheck } from '../ui/Icons';

interface ChangeEmailModalProps {
  visible: boolean;
  onClose: () => void;
  currentEmail: string;
  onChangeEmail: (newEmail: string) => Promise<{ success: boolean; message: string }>;
  userName: string;
}

export function ChangeEmailModal({
  visible,
  onClose,
  currentEmail,
  onChangeEmail,
  userName,
}: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      Alert.alert('Correo inválido', 'Por favor introduce un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const res = await onChangeEmail(clean);
      if (res.success) {
        setIsSuccess(true);
        triggerHaptic('success');
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1600);
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar el correo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 22 }}>✉️</Text>
          </View>

          <Text style={styles.title}>Cambiar Correo de Acceso</Text>
          <Text style={styles.desc}>
            Actualiza el correo con el que inicias sesión en el perfil de {userName}.
          </Text>

          <View style={styles.inputsGroup}>
            <Text style={styles.label}>NUEVO CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9E8E98"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isSuccess ? (
            <View style={styles.successBox}>
              <IconCheck size={18} color="#2D8A4E" strokeWidth={2.5} />
              <Text style={styles.successText}>¡Correo actualizado con éxito! ✉️</Text>
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
                  {isSubmitting ? 'Guardando...' : 'Guardar Correo ✨'}
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
    backgroundColor: 'rgba(239, 130, 106, 0.12)',
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
