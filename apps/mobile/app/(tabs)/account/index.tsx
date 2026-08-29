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
import { ConnectedCoupleHeart } from '../../../src/components/ui/ConnectedCoupleHeart';

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

  // Anniversary & milestones calculation
  const ANNIVERSARY_DATE = new Date('2025-02-15');
  const FIRST_MET_DATE = new Date('2024-11-23');
  const now = new Date();
  const diffDays = Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceMet = Math.max(1, Math.floor((now.getTime() - FIRST_MET_DATE.getTime()) / (1000 * 60 * 60 * 24)));

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

        {/* COUPLE PROFILE HERO CARD WITH CONNECTED HEART ANIMATION */}
        <TiltedCard style={styles.coupleHeroCard} variant="elevated">
          <ConnectedCoupleHeart
            user1Name="Andrea"
            user1Avatar="A"
            user1PhotoUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
            user2Name="Ángel"
            user2Avatar="Á"
            user2PhotoUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
            currentUserName={currentDevUser.name}
            daysTogether={diffDays}
            startDateFormatted="15 de Febrero de 2025"
          />

          <View style={styles.coupleInfoSection}>
            <Text style={styles.coupleNames}>Andrea & Ángel</Text>
            <Text style={styles.coupleSubtitle}>Juntos desde el 15 de Febrero de 2025 · Valencia</Text>
            <View style={styles.vaultSecurityBadge}>
              <IconShield size={13} color={Colors.light.primary} />
              <Text style={styles.vaultSecurityText}>Bóveda Cifrada Punto a Punto (Zero-Knowledge)</Text>
            </View>
          </View>
        </TiltedCard>

        {/* NUESTROS HITOS INOLVIDABLES */}
        <SectionHeader
          title="Nuestra Historia & Hitos"
          subtitle="Los momentos fundacionales de Andrea & Ángel"
        />
        <View style={styles.milestonesCard}>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneIconBadge, { backgroundColor: 'rgba(212, 175, 55, 0.12)' }]}>
              <Text style={{ fontSize: 16 }}>🪩</Text>
            </View>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneHeaderRow}>
                <Text style={styles.milestoneTitle}>Nos Conocimos</Text>
                <Text style={styles.milestoneDate}>23 Nov 2024</Text>
              </View>
              <Text style={styles.milestoneLocation}>Discoteca Room Valencia</Text>
              <Text style={styles.milestoneDesc}>
                La noche donde cruzamos miradas por primera vez y empezó nuestra historia ({daysSinceMet} días).
              </Text>
            </View>
          </View>

          <View style={styles.milestoneDivider} />

          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneIconBadge, { backgroundColor: 'rgba(74, 124, 155, 0.12)' }]}>
              <Text style={{ fontSize: 16 }}>🍽️</Text>
            </View>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneHeaderRow}>
                <Text style={styles.milestoneTitle}>Nuestra Primera Cita</Text>
                <Text style={styles.milestoneDate}>Dic 2024</Text>
              </View>
              <Text style={styles.milestoneLocation}>Restaurante El Pou · Valencia</Text>
              <Text style={styles.milestoneDesc}>
                Cerca de la Ciudad de las Artes y las Ciencias. Risas, confidencias y un flechazo mutuo.
              </Text>
            </View>
          </View>

          <View style={styles.milestoneDivider} />

          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneIconBadge, { backgroundColor: 'rgba(224, 86, 102, 0.12)' }]}>
              <Text style={{ fontSize: 16 }}>💍</Text>
            </View>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneHeaderRow}>
                <Text style={styles.milestoneTitle}>Empezamos a Salir</Text>
                <Text style={styles.milestoneDate}>15 Feb 2025</Text>
              </View>
              <Text style={styles.milestoneLocation}>Nuestro Aniversario Oficial · Valencia</Text>
              <Text style={styles.milestoneDesc}>
                El día que decidimos caminar juntos como pareja. {diffDays} días construyendo nuestro nido.
              </Text>
            </View>
          </View>
        </View>

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
  milestonesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.06)',
    ...Shadows.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  milestoneIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  milestoneTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.light.text,
  },
  milestoneDate: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.primary,
  },
  milestoneLocation: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.light.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  milestoneDesc: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  milestoneDivider: {
    height: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.05)',
    marginVertical: Spacing.sm,
    marginLeft: 48,
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
