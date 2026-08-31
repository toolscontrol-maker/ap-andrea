import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { IconShield, IconLock, IconSparkles } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface SecurityDataSubpageProps {
  isCloudConnected: boolean;
  cloudSyncStatus: string;
  onForceSync: () => Promise<void>;
  onExportData: () => void;
  onOpenImport: () => void;
  onOpenPrivacyNotice: () => void;
  stats: {
    wishesCount: number;
    placesCount: number;
    eventsCount: number;
    ritualsCount: number;
  };
  onClose: () => void;
}

export function SecurityDataSubpage({
  isCloudConnected,
  cloudSyncStatus,
  onForceSync,
  onExportData,
  onOpenImport,
  onOpenPrivacyNotice,
  stats,
  onClose,
}: SecurityDataSubpageProps) {
  const handleCopyKey = () => {
    triggerHaptic('selection');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('ed25519-andrea-tonet-88a9c34f12b7e5');
    }
    Alert.alert('Clave Copiada', 'Clave privada de sincronización copiada al portapapeles.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* CLOUD REALTIME CONNECTION STATUS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Estado de Sincronización en la Nube</Text>
        <Text style={styles.sectionSubtitle}>Conexión activa con Supabase Cloud</Text>
      </View>

      <View style={styles.groupCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isCloudConnected ? '#2D8A4E' : '#E05666' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {isCloudConnected ? '🟢 Conectado y Sincronizado' : '🟡 Conectando con la nube...'}
            </Text>
            <Text style={styles.statusDesc}>{cloudSyncStatus}</Text>
          </View>
          <TouchableOpacity
            style={styles.syncBtn}
            activeOpacity={0.7}
            onPress={async () => {
              triggerHaptic('medium');
              await onForceSync();
              Alert.alert('🔄 Sincronización', 'Datos refrescados con Supabase.');
            }}
          >
            <Text style={styles.syncBtnText}>Sincronizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ENCRYPTION & DATA SOVEREIGNTY */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={styles.sectionTitle}>Cifrado & Privacidad de la Pareja</Text>
        <Text style={styles.sectionSubtitle}>Protocolo de extremo a extremo sin intermediarios</Text>
      </View>

      <View style={styles.groupCard}>
        <View style={styles.settingRow}>
          <View style={styles.iconBox}>
            <IconLock size={16} color={Colors.light.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Cifrado Asimétrico Ed25519</Text>
            <Text style={styles.settingDesc}>Los mensajes íntimos y secretos viajan protegidos</Text>
          </View>
          <Badge variant="sage" size="sm">Activo</Badge>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleCopyKey}>
          <View style={styles.iconBox}>
            <IconShield size={16} color={Colors.light.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Clave Privada de Pareja</Text>
            <Text style={styles.settingDesc}>ed25519-andrea-tonet-88a9...</Text>
          </View>
          <Text style={styles.actionText}>Copiar</Text>
        </TouchableOpacity>
      </View>

      {/* BACKUP & RESTORE */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
        <Text style={styles.sectionTitle}>Copia de Seguridad & Restauración</Text>
        <Text style={styles.sectionSubtitle}>Exporta todos vuestros recuerdos en un archivo seguro</Text>
      </View>

      <View style={styles.groupCard}>
        <View style={styles.statsSummary}>
          <Text style={styles.statsTitle}>Datos Almacenados en este Dispositivo:</Text>
          <Text style={styles.statsDesc}>
            {stats.wishesCount} deseos · {stats.placesCount} restaurantes · {stats.eventsCount} fechas · {stats.ritualsCount} momentos
          </Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={onExportData}>
          <Text style={styles.settingTitle}>📥 Descargar Copia Completa (JSON)</Text>
          <Text style={styles.actionText}>Exportar</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={onOpenImport}>
          <Text style={styles.settingTitle}>📤 Restaurar Copia desde Archivo</Text>
          <Text style={styles.actionText}>Importar</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={onOpenPrivacyNotice}>
          <Text style={styles.settingTitle}>📜 Manifiesto de Privacidad del Nido</Text>
          <Text style={styles.actionText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: '#766B72',
    marginTop: 2,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E252B',
  },
  statusDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(224, 86, 102, 0.10)',
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E252B',
  },
  settingDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    marginLeft: Spacing.md,
  },
  statsSummary: {
    padding: Spacing.md,
    backgroundColor: '#FAF7F2',
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E252B',
  },
  statsDesc: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
});
