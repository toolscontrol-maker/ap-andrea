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
          <View style={styles.headerTopMeta}>
            <Text style={styles.vintageHeaderTag}>[ ACCOUNT // ARCHIVE ]</Text>
            <Text style={styles.vintageHeaderDate}>PERFIL PRIVADO</Text>
          </View>

          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>Tu Cuenta</Text>
              <Text style={styles.headerSubtitle}>Configuración y bóveda de pareja</Text>
            </View>
            <TouchableOpacity
              style={styles.btnPerspectiveSwitch}
              activeOpacity={0.8}
              onPress={handleSwitchUser}
            >
              <IconSparkles size={13} color="#111111" />
              <Text style={styles.btnPerspectiveSwitchText}>
                Ver como {partnerDevUser.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* COUPLE PROFILE HERO CARD */}
        <TiltedCard style={styles.coupleHeroCard} variant="elevated">
          <View style={styles.cardTechnicalHeader}>
            <Text style={styles.cardTechnicalIndex}>[ ARCHIVE // 01 ]</Text>
            <Text style={styles.cardTechnicalRef}>ED25519 ENCRYPTED</Text>
          </View>

          <View style={styles.avatarsRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: currentDevUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop' }}
                style={styles.avatarImg}
              />
              <View style={styles.avatarPill}>
                <Text style={styles.avatarPillText}>TÚ ({currentDevUser.name.toUpperCase()})</Text>
              </View>
            </View>

            <View style={styles.heartConnector}>
              <View style={styles.heartCircle}>
                <IconHeart size={14} color="#C25E5E" />
              </View>
              <Text style={styles.daysTogetherCount}>1.284 DÍAS</Text>
            </View>

            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: partnerDevUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop' }}
                style={styles.avatarImg}
              />
              <View style={styles.avatarPill}>
                <Text style={styles.avatarPillText}>{partnerDevUser.name.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.coupleInfoSection}>
            <Text style={styles.coupleNames}>Andrea & Ángel</Text>
            <Text style={styles.coupleSubtitle}>Juntos desde el 14 de Febrero de 2023 · Valencia</Text>
            <View style={styles.vaultSecurityBadge}>
              <IconShield size={12} color="#111111" />
              <Text style={styles.vaultSecurityText}>BÓVEDA CIFRADA (ZERO-KNOWLEDGE)</Text>
            </View>
          </View>
        </TiltedCard>

        {/* STATS OVERVIEW */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{wishes.length}</Text>
            <Text style={styles.statLabel}>DESEOS E ILUSIONES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedPlaces.length}</Text>
            <Text style={styles.statLabel}>RESTAURANTES Y SITIOS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{coupleEvents.length}</Text>
            <Text style={styles.statLabel}>CITAS EN AGENDA</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>RECUERDOS VIVOS</Text>
          </View>
        </View>

        {/* PRIVACY & SECURITY SETTINGS */}
        <SectionHeader
          tag="[ 01 ] // SEGURIDAD"
          title="Seguridad & Privacidad"
          subtitle="Control absoluto sobre vuestros momentos y secretos"
        />
        <View style={styles.settingsGroupCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconLock size={15} color="#111111" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Bloqueo con Face ID / Huella</Text>
              <Text style={styles.settingDesc}>Solicitar biometría al abrir la aplicación</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#EAE8E3', true: '#111111' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconSparkles size={15} color="#111111" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Modo Sorpresas Blindadas</Text>
              <Text style={styles.settingDesc}>Ocultar notificaciones y nombres en la pantalla de bloqueo</Text>
            </View>
            <Switch
              value={secretSurpriseMode}
              onValueChange={handleToggleSurpriseMode}
              trackColor={{ false: '#EAE8E3', true: '#111111' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleCopyKey}>
            <View style={styles.settingIconContainer}>
              <IconShield size={15} color="#111111" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Clave de Sincronización Privada</Text>
              <Text style={styles.settingDesc}>ed25519-andrea-angel-88a9...</Text>
            </View>
            <Text style={styles.settingActionText}>COPIAR</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES & NOTIFICATIONS */}
        <SectionHeader
          tag="[ 02 ] // PREFERENCIAS"
          title="Preferencias de Pareja"
          subtitle="Comodidad, háptica y avisos románticos"
        />
        <View style={styles.settingsGroupCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconBell size={15} color="#111111" />
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
              trackColor={{ false: '#EAE8E3', true: '#111111' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconSliders size={15} color="#111111" />
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
              trackColor={{ false: '#EAE8E3', true: '#111111' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleExportData}>
            <View style={styles.settingIconContainer}>
              <IconCheck size={15} color="#111111" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Exportar Copia de Seguridad</Text>
              <Text style={styles.settingDesc}>Descargar todos los recuerdos y deseos</Text>
            </View>
            <Text style={styles.settingActionText}>EXPORTAR</Text>
          </TouchableOpacity>
        </View>

        {/* APP INFO & VERSION FOOTER */}
        <View style={styles.footerInfoCard}>
          <Text style={styles.footerBrandName}>ANDREA APP</Text>
          <Text style={styles.footerVersion}>VERSION 1.0.0 // PRIVATE ATELIER</Text>
          <Text style={styles.footerDedication}>
            Creado con amor y cuidado para Andrea & Ángel.
          </Text>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  headerBlock: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  headerTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 17, 17, 0.06)',
  },
  vintageHeaderTag: {
    ...Typography.vintageTag,
    color: '#111111',
  },
  vintageHeaderDate: {
    ...Typography.vintageTag,
    color: '#8E8C88',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  headerTitle: {
    ...Typography.display,
    color: '#111111',
    fontSize: 26,
  },
  headerSubtitle: {
    ...Typography.body,
    color: '#706E6B',
    fontSize: 13,
    marginTop: 2,
  },
  btnPerspectiveSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.12)',
    ...Shadows.sm,
  },
  btnPerspectiveSwitchText: {
    ...Typography.vintageTag,
    color: '#111111',
    fontSize: 9.5,
  },
  coupleHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.07)',
    ...Shadows.md,
  },
  cardTechnicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 17, 17, 0.06)',
  },
  cardTechnicalIndex: {
    ...Typography.vintageTag,
    color: '#111111',
    fontSize: 9.5,
  },
  cardTechnicalRef: {
    ...Typography.vintageTag,
    color: '#8E8C88',
    fontSize: 9,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  avatarPill: {
    backgroundColor: '#F3F2EE',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)',
  },
  avatarPillText: {
    ...Typography.vintageTag,
    fontSize: 9,
    color: '#111111',
  },
  heartConnector: {
    alignItems: 'center',
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9ECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  daysTogetherCount: {
    ...Typography.vintageTag,
    fontSize: 9.5,
    color: '#8E8C88',
  },
  coupleInfoSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(17, 17, 17, 0.05)',
    paddingTop: Spacing.md,
  },
  coupleNames: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  coupleSubtitle: {
    ...Typography.body,
    color: '#706E6B',
    fontSize: 12.5,
    marginBottom: Spacing.sm,
  },
  vaultSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F2EE',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.07)',
  },
  vaultSecurityText: {
    ...Typography.vintageTag,
    fontSize: 9,
    color: '#111111',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)',
    ...Shadows.sm,
  },
  statNumber: {
    ...Typography.display,
    fontSize: 22,
    color: '#111111',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.vintageTag,
    fontSize: 9,
    color: '#8E8C88',
    textAlign: 'center',
  },
  settingsGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)',
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
    backgroundColor: '#F3F2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.05)',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  settingTitle: {
    ...Typography.bodyMedium,
    color: '#111111',
    fontSize: 14,
    marginBottom: 2,
  },
  settingDesc: {
    ...Typography.caption,
    color: '#8E8C88',
    fontSize: 12,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.05)',
    marginLeft: 48,
  },
  settingActionText: {
    ...Typography.vintageTag,
    color: '#111111',
    fontSize: 11,
  },
  footerInfoCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  footerBrandName: {
    ...Typography.vintageTag,
    letterSpacing: 3,
    fontSize: 11,
    color: '#111111',
    marginBottom: 2,
  },
  footerVersion: {
    ...Typography.vintageTag,
    fontSize: 9.5,
    color: '#8E8C88',
    marginBottom: 4,
  },
  footerDedication: {
    ...Typography.caption,
    fontSize: 11.5,
    color: '#8E8C88',
    fontStyle: 'italic',
  },
});
