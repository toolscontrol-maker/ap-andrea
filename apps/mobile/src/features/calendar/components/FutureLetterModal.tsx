import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useDev } from '../../../context/DevContext';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Button } from '../../../components/ui';

interface FutureLetterModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveLetter: (letter: { unlockDate: string; title: string; message: string }) => void;
}

export function FutureLetterModal({
  visible,
  onClose,
  onSaveLetter,
}: FutureLetterModalProps) {
  const { partnerDevUser } = useDev();

  const [title, setTitle] = useState('');
  const [unlockDate, setUnlockDate] = useState('2027-02-14');
  const [message, setMessage] = useState('');

  if (!visible) return null;

  const handleSave = () => {
    triggerHaptic('success');
    onSaveLetter({
      unlockDate,
      title: title.trim() || `Carta para el futuro para ${partnerDevUser.name}`,
      message: message.trim() || 'Unas palabras escritas con mucho cariño para este día especial.',
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>💌 Carta para el Futuro</Text>
              <Text style={styles.subtitle}>Un mensaje que permanecerá sellado hasta la fecha elegida</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, color: '#66737C', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>TÍTULO O MOTIVO</Text>
            <TextInput
              style={styles.input}
              placeholder={`Ej. Para abrir en nuestro 3er aniversario`}
              placeholderTextColor="#9B8E98"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>FECHA DE DESBLOQUEO (AAAA-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2027-02-14"
              placeholderTextColor="#9B8E98"
              value={unlockDate}
              onChangeText={setUnlockDate}
            />

            <Text style={styles.fieldLabel}>TU MENSAJE (SIN PRISAS)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={`Escribe lo que sientes hoy, un recuerdo que nunca quieres olvidar o un deseo para vuestro futuro juntos...`}
              placeholderTextColor="#9B8E98"
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <View style={styles.sealNote}>
              <Text style={styles.sealEmoji}>🔒</Text>
              <Text style={styles.sealText}>
                Esta carta se guardará en vuestro calendario y {partnerDevUser.name} solo podrá abrirla cuando llegue la fecha programada.
              </Text>
            </View>

            <Button
              variant="primary"
              size="lg"
              onPress={handleSave}
              style={{ marginTop: Spacing.lg, marginBottom: Spacing['3xl'] }}
            >
              Sellar y guardar carta 💌
            </Button>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '90%',
    paddingTop: Spacing.md,
    ...Shadows.lg,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    color: '#1E252B',
  },
  subtitle: {
    ...Typography.caption,
    color: '#66737C',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 33, 41, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
  },
  fieldLabel: {
    ...Typography.overline,
    fontSize: 10,
    letterSpacing: 1,
    color: '#66737C',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#FAF6F0',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Typography.body,
    fontSize: 14,
    color: '#1E252B',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sealNote: {
    flexDirection: 'row',
    backgroundColor: '#FAF7FD',
    padding: Spacing.md,
    borderRadius: Radii.xl,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(138, 123, 181, 0.2)',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  sealEmoji: {
    fontSize: 20,
  },
  sealText: {
    flex: 1,
    ...Typography.caption,
    color: '#66737C',
    fontSize: 11.5,
    lineHeight: 16,
  },
});
