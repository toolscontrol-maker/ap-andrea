import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { Badge } from '../../../src/components/ui/Badge';
import { TiltedCard } from '../../../src/components/ui/TiltedCard';
import {
  IconUser,
  IconShield,
  IconBell,
  IconSliders,
  IconHeart,
  IconLock,
  IconCheck,
  IconSparkles,
  IconLogOut
} from '../../../src/components/ui/Icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function AccountScreen() {
  const router = useRouter();
  const {
    activeRole,
    switchRole,
    currentDevUser,
    partnerDevUser,
    wishes,
    savedPlaces,
    coupleEvents,
    entries
  } = useDev();

  // Settings local state
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [secretSurpriseMode, setSecretSurpriseMode] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [romanticReminders, setRomanticReminders] = useState(true);

  const handleToggleBiometrics = (val: boolean) => {
    triggerHaptic('selection');
    setBiometricsEnabled(val);
    if (val) {
      Alert.alert('Protección Activada', 'Tu bóveda privada está protegida mediante Face ID / Touch ID.');
    }
  };

  const handleToggleSurpriseMode = (val: boolean) => {
    triggerHaptic('selection');
    setSecretSurpriseMode(val);
    if (val) {
      Alert.alert('Modo Sorpresa Blindado', 'Las notificaciones no revelarán detalles de regalos o planes secretos a tu pareja.');
    }
  };

  const handleSwitchUser = () => {
    triggerHaptic('medium');
    const newRole = activeRole === 'user1' ? 'user2' : 'user1';
    switchRole(newRole);
    Alert.alert(
      'Perspectiva Cambiada',
      `Ahora estás viendo Andrea App como ${newRole === 'user1' ? 'Ángel' : 'Andrea'}.`
    );
  };

  const handleExportData = () => {
    triggerHaptic('success');
    Alert.alert(
      '📦 Copia de Seguridad Generada',
      'Vuestro historial de recuerdos, deseos y agenda ha sido respaldado de forma segura y cifrada.'
    );
  };

  const handleCopyKey = () => {
    triggerHaptic('selection');
    Alert.alert('🔑 Clave Criptográfica Copiada', 'Clave de sincronización privada de vuestra pareja guardada en el portapapeles.');
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP HEADER */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerSubtitle}>ESPACIO EXCLUSIVO</Text>
              <Text style={styles.headerTitle}>Tu Cuenta</Text>
            </View>
            <TouchableOpacity
              style={styles.btnPerspectiveSwitch}
              activeOpacity={0.8}
              onPress={handleSwitchUser}
            >
              <IconSparkles size={14} color={Colors.light.primary} />
              <Text style={styles.btnPerspectiveSwitchText}>
                Ver como {partnerDevUser.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* COUPLE PROFILE HERO CARD */}
        <TiltedCard style={styles.coupleHeroCard} variant="elevated">
          <View style={styles.avatarsRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: currentDevUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop' }}
                style={styles.avatarImg}
              />
              <View style={styles.avatarPill}>
                <Text style={styles.avatarPillText}>Tú ({currentDevUser.name})</Text>
              </View>
            </View>

            <View style={styles.heartConnector}>
              <View style={styles.heartCircle}>
                <IconHeart size={16} color="#E05666" />
              </View>
              <Text style={styles.daysTogetherCount}>1.284 días</Text>
            </View>

            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: partnerDevUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop' }}
                style={styles.avatarImg}
              />
              <View style={styles.avatarPill}>
                <Text style={styles.avatarPillText}>{partnerDevUser.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.coupleInfoSection}>
            <Text style={styles.coupleNames}>Andrea & Ángel</Text>
            <Text style={styles.coupleSubtitle}>Juntos desde el 14 de Febrero de 2023 · Valencia</Text>
            <View style={styles.vaultSecurityBadge}>
              <IconShield size={13} color={Colors.light.primary} />
              <Text style={styles.vaultSecurityText}>Bóveda Cifrada Punto a Punto (Zero-Knowledge)</Text>
            </View>
          </View>
        </TiltedCard>

        {/* STATS OVERVIEW */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{wishes.length}</Text>
            <Text style={styles.statLabel}>Deseos e Ilusiones</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedPlaces.length}</Text>
            <Text style={styles.statLabel}>Restaurantes & Sitios</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{coupleEvents.length}</Text>
            <Text style={styles.statLabel}>Citas en Agenda</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>Recuerdos Vivos</Text>
          </View>
        </View>

        {/* PRIVACY & SECURITY SETTINGS */}
        <SectionHeader
          title="Seguridad & Privacidad"
          subtitle="Control absoluto sobre vuestros momentos y secretos"
        />
        <View style={styles.settingsGroupCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconLock size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Bloqueo con Face ID / Huella</Text>
              <Text style={styles.settingDesc}>Solicitar biometría al abrir la aplicación</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconSparkles size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Modo Sorpresas Blindadas</Text>
              <Text style={styles.settingDesc}>Ocultar notificaciones y nombres en la pantalla de bloqueo</Text>
            </View>
            <Switch
              value={secretSurpriseMode}
              onValueChange={handleToggleSurpriseMode}
              trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleCopyKey}>
            <View style={styles.settingIconContainer}>
              <IconShield size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Clave de Sincronización Privada</Text>
              <Text style={styles.settingDesc}>ed25519-andrea-angel-88a9...</Text>
            </View>
            <Text style={styles.settingActionText}>Copiar</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES & NOTIFICATIONS */}
        <SectionHeader
          title="Preferencias de la Pareja"
          subtitle="Comodidad, háptica y avisos románticos"
        />
        <View style={styles.settingsGroupCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconBell size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Avisos de Citas y Aniversarios</Text>
              <Text style={styles.settingDesc}>Recordatorios sutiles de fechas clave y cenas</Text>
            </View>
            <Switch
              value={romanticReminders}
              onValueChange={(val) => {
                triggerHaptic('selection');
                setRomanticReminders(val);
              }}
              trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconSliders size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Vibración Háptica Táctil</Text>
              <Text style={styles.settingDesc}>Micro-respuestas táctiles en botones y gestos</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={(val) => {
                triggerHaptic('selection');
                setHapticFeedback(val);
              }}
              trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleExportData}>
            <View style={styles.settingIconContainer}>
              <IconCheck size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Exportar Copia de Seguridad</Text>
              <Text style={styles.settingDesc}>Descargar todos los recuerdos y deseos</Text>
            </View>
            <Text style={styles.settingActionText}>Exportar</Text>
          </TouchableOpacity>
        </View>

        {/* APP INFO & VERSION FOOTER */}
        <View style={styles.footerInfoCard}>
          <Text style={styles.footerBrandName}>ANDREA APP</Text>
          <Text style={styles.footerVersion}>Versión 1.0.0 (Edición Privada)</Text>
          <Text style={styles.footerDedication}>
            Creado con amor y cuidado para Andrea & Ángel.
          </Text>
        </View>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
  },
  headerBlock: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSubtitle: {
    ...Typography.captionBold,
    color: Colors.light.primary,
    letterSpacing: 1.5,
    fontSize: 10.5,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.light.text,
    fontSize: 26,
    fontWeight: '700',
  },
  btnPerspectiveSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  btnPerspectiveSwitchText: {
    ...Typography.captionBold,
    color: Colors.light.primary,
    fontSize: 12,
  },
  coupleHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.md,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: Colors.light.backgroundWarm,
    marginBottom: Spacing.xs,
  },
  avatarPill: {
    backgroundColor: Colors.light.backgroundWarm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  avatarPillText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.text,
  },
  heartConnector: {
    alignItems: 'center',
  },
  heartCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(235, 87, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  daysTogetherCount: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  coupleInfoSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 19, 18, 0.05)',
    paddingTop: Spacing.md,
  },
  coupleNames: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  coupleSubtitle: {
    ...Typography.body,
    color: Colors.light.textMuted,
    fontSize: 12.5,
    marginBottom: Spacing.sm,
  },
  vaultSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
  vaultSecurityText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.sm,
  },
  statNumber: {
    ...Typography.h1,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  settingsGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  settingTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 2,
  },
  settingDesc: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    fontSize: 12,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.05)',
    marginLeft: 48,
  },
  settingActionText: {
    ...Typography.captionBold,
    color: Colors.light.primary,
    fontSize: 13,
  },
  footerInfoCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  footerBrandName: {
    ...Typography.captionBold,
    letterSpacing: 2.5,
    fontSize: 11,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  footerVersion: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  footerDedication: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    fontStyle: 'italic',
  },
});
