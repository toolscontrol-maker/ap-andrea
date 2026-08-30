import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { StorageEngine, STORAGE_KEYS } from '../../services/storage';
import { Colors } from '../../theme/colors';
import { Radii, Shadows, Spacing } from '../../theme/tokens';
import { Button } from '../ui';
import { IconShield, IconLock, IconSparkles } from '../ui/Icons';
import { triggerHaptic } from '../../utils/haptics';

interface PrivacyBetaNoticeProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function PrivacyBetaNotice({ forceOpen = false, onClose }: PrivacyBetaNoticeProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    async function checkAccepted() {
      const accepted = await StorageEngine.getItem<boolean>(
        STORAGE_KEYS.BETA_NOTICE_ACCEPTED,
        false
      );
      if (!accepted) {
        setIsOpen(true);
      }
    }

    checkAccepted();
  }, [forceOpen]);

  const handleAccept = async () => {
    triggerHaptic('success');
    await StorageEngine.setItem(STORAGE_KEYS.BETA_NOTICE_ACCEPTED, true);
    setIsOpen(false);
    onClose && onClose();
  };

  const handleExportBackup = async () => {
    triggerHaptic('selection');
    try {
      const json = await StorageEngine.exportAllLocalData();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `andrea_app_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Copia generada', 'Copia de seguridad guardada localmente.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo exportar la copia.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <IconShield size={22} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Transparencia & Privacidad Beta</Text>
              <Text style={styles.subtitle}>Andrea App · Modo Local Independiente</Text>
            </View>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Almacenamiento en este Dispositivo</Text>
                <Text style={styles.infoDesc}>
                  Todos los recuerdos, fotos, deseos y fechas se guardan exclusivamente en la memoria de este navegador o teléfono.
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📲</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Sin sincronización en la nube todavía</Text>
                <Text style={styles.infoDesc}>
                  En esta fase beta no existe sincronización automática entre dos teléfonos distintos. La nube con cifrado E2EE se integrará en la versión final.
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🗑️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Borrado de Caché o Navegador</Text>
                <Text style={styles.infoDesc}>
                  Si limpias el historial o datos del navegador, se pueden borrar los datos locales. Puedes exportar una copia de seguridad en cualquier momento.
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Modo Anti-Spoilers Visual</Text>
                <Text style={styles.infoDesc}>
                  Las sorpresas se ocultan en la interfaz para no desvelarlas si tu pareja mira la pantalla, pero no son secretos criptográficamente aislados en un dispositivo compartido.
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ <Text style={{ fontWeight: '700' }}>Recomendación:</Text> No guardes contraseñas, datos bancarios ni información confidencial en esta versión beta local.
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleExportBackup}
            >
              <Text style={styles.btnSecondaryText}>📦 Exportar copia</Text>
            </TouchableOpacity>

            <Button
              variant="primary"
              onPress={handleAccept}
            >
              Entendido y Aceptar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 9, 8, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(224, 86, 102, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  body: {
    marginVertical: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  infoDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  warningBox: {
    backgroundColor: '#FFF8E6',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  warningText: {
    fontSize: 11.5,
    color: '#7A5E0B',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  btnSecondary: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
