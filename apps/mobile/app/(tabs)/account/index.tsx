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
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { StorageEngine, STORAGE_KEYS } from '../../../src/services/storage';
import { PrivacyBetaNotice } from '../../../src/components/privacy/PrivacyBetaNotice';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { TiltedCard } from '../../../src/components/ui/TiltedCard';
import { PhotoUploadField } from '../../../src/components/ui/PhotoUploadField';
import {
  IconUser,
  IconShield,
  IconBell,
  IconSliders,
  IconHeart,
  IconLock,
  IconCheck,
  IconSparkles,
  IconCamera,
  IconLogOut
} from '../../../src/components/ui/Icons';
import { Colors, THEME_PALETTES, ThemePalette } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { triggerHaptic } from '../../../src/utils/haptics';
import { ConnectedCoupleHeart } from '../../../src/components/ui/ConnectedCoupleHeart';
import { RotatingAffectionText } from '../../../src/components/ui/RotatingAffectionText';
import { CloudSyncStatusBadge } from '../../../src/components/ui/CloudSyncStatusBadge';
import { INTRO_PHOTOS } from '../../../src/constants/introImages';
import { pushNotificationService, NotificationPreferences } from '../../../src/services/notifications/PushNotificationService';

// Subpages & Modals
import { AppearanceSettingsSubpage } from '../../../src/components/account/AppearanceSettingsSubpage';
import { NotificationSettingsSubpage } from '../../../src/components/account/NotificationSettingsSubpage';
import { FeedbackRecommendationsSubpage } from '../../../src/components/account/FeedbackRecommendationsSubpage';
import { SecurityDataSubpage } from '../../../src/components/account/SecurityDataSubpage';
import { CoupleMilestonesModal } from '../../../src/components/account/CoupleMilestonesModal';
import { LogoutConfirmModal } from '../../../src/components/account/LogoutConfirmModal';
import { SettingsSubpageContainer } from '../../../src/components/account/SettingsSubpageContainer';

export default function AccountScreen() {
  const router = useRouter();
  const {
    activeRole,
    switchRole,
    currentDevUser,
    partnerDevUser,
    users,
    updateUserProfile,
    wishes,
    savedPlaces,
    coupleEvents,
    ritualSeeds,
    entries,
    surprises,
    isCloudConnected,
    cloudSyncStatus,
    forceCloudSync,
    logout,
    currentEmail,
    themePalette,
    setThemePalette,
    isDemoModeEnabled,
    resetAllDataToDefaults,
    clearAllUserData,
    exportAllUserData,
    importAllUserData,
  } = useDev();

  // Subpage navigation state
  const [activeSubpage, setActiveSubpage] = useState<'appearance' | 'notifications' | 'milestones' | 'feedback' | 'security' | null>(null);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Settings local state
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [secretSurpriseMode, setSecretSurpriseMode] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [romanticReminders, setRomanticReminders] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(pushNotificationService.getPreferences());
  const [pushPermission, setPushPermission] = useState<string>(pushNotificationService.getPermissionStatus());

  // Profile edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string>(users.user2.id);
  const [editName, setEditName] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  // Privacy and Import modals
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Anniversary & milestones calculation
  const ANNIVERSARY_DATE = new Date('2025-02-15');
  const FIRST_MET_DATE = new Date('2024-11-23');
  const FIRST_KISS_DATE = new Date('2024-12-08');
  const now = new Date();
  const diffDays = Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceMet = Math.max(1, Math.floor((now.getTime() - FIRST_MET_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceKiss = Math.max(1, Math.floor((now.getTime() - FIRST_KISS_DATE.getTime()) / (1000 * 60 * 60 * 24)));

  const handleOpenEditProfile = (userId: string) => {
    triggerHaptic('selection');
    const targetUser = userId === users.user1.id ? users.user1 : users.user2;
    setEditingUserId(userId);
    setEditName(targetUser.name);
    setEditPhotoUrl(targetUser.avatarPhoto || '');
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    triggerHaptic('success');
    const isUser1 = editingUserId === users.user1.id;
    const finalName = editName.trim() || (isUser1 ? 'Tonet' : 'Andrea');
    await updateUserProfile(editingUserId, {
      name: finalName,
      avatar: finalName[0].toUpperCase(),
      avatarPhoto: editPhotoUrl || undefined,
    });
    setIsEditModalVisible(false);
    Alert.alert('✨ Perfil Actualizado', `El perfil de ${finalName} se ha guardado y sincronizado.`);
  };

  const handleToggleSurpriseMode = (value: boolean) => {
    triggerHaptic('selection');
    setSecretSurpriseMode(value);
    Alert.alert(
      value ? '🔒 Modo Sorpresas Blindadas Activado' : '🔓 Modo Sorpresas Estándar',
      value
        ? 'Las notificaciones no mostrarán detalles ni títulos de compras o reservas.'
        : 'Las notificaciones mostrarán información estándar.'
    );
  };

  const handleToggleBiometrics = (value: boolean) => {
    triggerHaptic('selection');
    setBiometricsEnabled(value);
  };

  const handleCopyKey = () => {
    triggerHaptic('selection');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('ed25519-andrea-tonet-88a9c34f12b7e5');
    }
    Alert.alert('Clave Copiada', 'Clave privada copiada al portapapeles.');
  };

  const themeNameMap: Record<ThemePalette, string> = {
    atelier: 'Atelier Calme',
    velvet: 'Rosa Terciopelo',
    lavender: 'Lavanda Silvestre',
    olive: 'Salvia & Olivo',
    sunset: 'Atardecer en Canet',
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP STATUS BAR & HEADER */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <Text style={styles.eyebrow}>ESPACIO PRIVADO</Text>
            <CloudSyncStatusBadge isConnected={isCloudConnected} statusText={cloudSyncStatus} />
          </View>
          <Text style={styles.screenTitle}>Ajustes & Personalización</Text>
          <Text style={styles.screenSubtitle}>
            Configura el look, las notificaciones y los detalles íntimos de {users.user2.name} & {users.user1.name}
          </Text>
        </View>

        {/* ── 1. HERO COUPLE PROFILES & SWITCHER ── */}
        <View style={styles.coupleHeroRow}>
          {/* Andrea Card */}
          <TouchableOpacity
            style={[styles.partnerMiniCard, activeRole === 'user2' && styles.partnerMiniCardActive]}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('selection');
              switchRole('user2');
            }}
          >
            <View style={styles.miniCardAvatarWrapper}>
              {users.user2.avatarPhoto ? (
                <Image source={{ uri: users.user2.avatarPhoto }} style={styles.miniCardAvatar} />
              ) : (
                <View style={[styles.miniCardAvatar, { backgroundColor: Colors.light.primary }]}>
                  <Text style={styles.miniCardAvatarText}>{users.user2.avatar}</Text>
                </View>
              )}
              {activeRole === 'user2' && (
                <View style={styles.activePillBadge}>
                  <Text style={styles.activePillText}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={styles.miniCardName}>{users.user2.name}</Text>
            <Text style={styles.miniCardRole}>Novia & Creadora</Text>
            <TouchableOpacity
              style={styles.editPhotoLink}
              onPress={(e) => {
                e.stopPropagation();
                handleOpenEditProfile(users.user2.id);
              }}
            >
              <Text style={styles.editPhotoLinkText}>Editar foto ›</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Tonet Card */}
          <TouchableOpacity
            style={[styles.partnerMiniCard, activeRole === 'user1' && styles.partnerMiniCardActive]}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('selection');
              switchRole('user1');
            }}
          >
            <View style={styles.miniCardAvatarWrapper}>
              {users.user1.avatarPhoto ? (
                <Image source={{ uri: users.user1.avatarPhoto }} style={styles.miniCardAvatar} />
              ) : (
                <View style={[styles.miniCardAvatar, { backgroundColor: '#EF826A' }]}>
                  <Text style={styles.miniCardAvatarText}>{users.user1.avatar}</Text>
                </View>
              )}
              {activeRole === 'user1' && (
                <View style={[styles.activePillBadge, { backgroundColor: '#EF826A' }]}>
                  <Text style={styles.activePillText}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={styles.miniCardName}>{users.user1.name}</Text>
            <Text style={styles.miniCardRole}>Novio & Compañero</Text>
            <TouchableOpacity
              style={styles.editPhotoLink}
              onPress={(e) => {
                e.stopPropagation();
                handleOpenEditProfile(users.user1.id);
              }}
            >
              <Text style={styles.editPhotoLinkText}>Editar foto ›</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* ── 2. MAIN SETTINGS INSET GROUP: EXPERIENCIA & PERSONALIZACIÓN ── */}
        <SectionHeader
          title="Personalización & Experiencia"
          subtitle="Ajusta cada rincón a vuestro estilo de pareja"
        />
        <View style={styles.settingsGroupCard}>
          {/* 1. Look & Appearance */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              setActiveSubpage('appearance');
            }}
          >
            <View style={[styles.navIconBox, { backgroundColor: 'rgba(239, 130, 106, 0.12)' }]}>
              <Text style={{ fontSize: 16 }}>🎨</Text>
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Apariencia & Look de la App</Text>
              <Text style={styles.navSubtitle}>Tema: {themeNameMap[themePalette] || 'Atelier'} · Glassmorphism & Squircles</Text>
            </View>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* 2. Notifications Center */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              setActiveSubpage('notifications');
            }}
          >
            <View style={[styles.navIconBox, { backgroundColor: 'rgba(224, 86, 102, 0.12)' }]}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Centro de Notificaciones en iPhone</Text>
              <Text style={styles.navSubtitle}>
                {pushPermission === 'granted' ? '🟢 Activadas' : '🔔 Configurar'} · Latidos, deseos, sorpresas y check-in
              </Text>
            </View>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* 3. Milestones & Dates */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              setActiveSubpage('milestones');
            }}
          >
            <View style={[styles.navIconBox, { backgroundColor: 'rgba(244, 201, 93, 0.15)' }]}>
              <Text style={{ fontSize: 16 }}>✨</Text>
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Hitos de Nuestra Historia & Fechas</Text>
              <Text style={styles.navSubtitle}>Aniversario (15 Feb), Conocerse (23 Nov), Cumpleaños</Text>
            </View>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* 4. Feedback & Recommendations */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              setActiveSubpage('feedback');
            }}
          >
            <View style={[styles.navIconBox, { backgroundColor: 'rgba(158, 138, 205, 0.15)' }]}>
              <Text style={{ fontSize: 16 }}>💌</Text>
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Enviar Recomendaciones & Sugerencias</Text>
              <Text style={styles.navSubtitle}>Buzón de ideas, nuevos restaurantes y notas secretas</Text>
            </View>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── 3. SEGURIDAD & DATOS EN LA NUBE ── */}
        <SectionHeader
          title="Seguridad, Nube & Privacidad"
          subtitle="Sincronización segura con Supabase Cloud"
        />
        <View style={styles.settingsGroupCard}>
          {/* Security & Backup Subpage */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              setActiveSubpage('security');
            }}
          >
            <View style={[styles.navIconBox, { backgroundColor: 'rgba(94, 148, 112, 0.15)' }]}>
              <Text style={{ fontSize: 16 }}>🔒</Text>
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Estado de Nube & Copias de Seguridad</Text>
              <Text style={styles.navSubtitle}>
                {isCloudConnected ? '🟢 Supabase Conectado' : '🟡 Conectando'} · Exportar/Importar JSON
              </Text>
            </View>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* Face ID / Biometrics */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconLock size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Bloqueo con Face ID / Huella</Text>
              <Text style={styles.settingDesc}>Solicitar autenticación al abrir la app</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          {/* Blinded Surprises Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconSparkles size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Modo Sorpresas Blindadas</Text>
              <Text style={styles.settingDesc}>Ocultar nombres y detalles en las alertas</Text>
            </View>
            <Switch
              value={secretSurpriseMode}
              onValueChange={handleToggleSurpriseMode}
              trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          {/* Haptics */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <IconSliders size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Vibración Háptica Táctil</Text>
              <Text style={styles.settingDesc}>Micro-respuestas táctiles en botones y toques</Text>
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
        </View>

        {/* ── 4. CERRAR SESIÓN & CUENTA ── */}
        <SectionHeader
          title="Gestión de Cuenta"
          subtitle="Sesión activa y salida segura"
        />
        <View style={styles.settingsGroupCard}>
          <TouchableOpacity
            style={[styles.settingRow, { paddingVertical: 14 }]}
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('selection');
              setIsLogoutModalVisible(true);
            }}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(217, 93, 93, 0.10)' }]}>
              <IconLogOut size={16} color="#D95D5D" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: '#D95D5D', fontWeight: '700' }]}>
                Cerrar Sesión
              </Text>
              <Text style={styles.settingDesc}>
                Sesión actual: {currentDevUser.name} ({currentEmail || 'andrea-tonet@love.app'})
              </Text>
            </View>
            <Text style={[styles.settingActionText, { color: '#D95D5D' }]}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>Andrea & Tonet · Nido de Amor</Text>
          <Text style={styles.footerNoteSub}>Versión 1.2 · Creado con amor</Text>
        </View>
      </ScrollView>

      {/* ── SUBPAGE MODALS ── */}

      {/* 1. Appearance Subpage */}
      <SettingsSubpageContainer
        visible={activeSubpage === 'appearance'}
        onClose={() => setActiveSubpage(null)}
        title="Apariencia & Look"
        subtitle="Temas visuales y estética"
      >
        <AppearanceSettingsSubpage
          currentPalette={themePalette}
          onSelectPalette={(p) => {
            setThemePalette(p);
            setActiveSubpage(null);
          }}
          onClose={() => setActiveSubpage(null)}
        />
      </SettingsSubpageContainer>

      {/* 2. Notifications Subpage */}
      <SettingsSubpageContainer
        visible={activeSubpage === 'notifications'}
        onClose={() => setActiveSubpage(null)}
        title="Notificaciones en iPhone"
        subtitle="Avisos, latidos y horarios"
      >
        <NotificationSettingsSubpage onClose={() => setActiveSubpage(null)} />
      </SettingsSubpageContainer>

      {/* 3. Milestones Subpage */}
      <SettingsSubpageContainer
        visible={activeSubpage === 'milestones'}
        onClose={() => setActiveSubpage(null)}
        title="Hitos de Nuestra Historia"
        subtitle="Aniversarios y fechas clave"
      >
        <CoupleMilestonesModal onClose={() => setActiveSubpage(null)} />
      </SettingsSubpageContainer>

      {/* 4. Feedback Subpage */}
      <SettingsSubpageContainer
        visible={activeSubpage === 'feedback'}
        onClose={() => setActiveSubpage(null)}
        title="Buzón de Ideas"
        subtitle="Sugerencias y notas secretas"
      >
        <FeedbackRecommendationsSubpage
          currentUserName={currentDevUser.name}
          partnerName={partnerDevUser.name}
          onClose={() => setActiveSubpage(null)}
        />
      </SettingsSubpageContainer>

      {/* 5. Security Subpage */}
      <SettingsSubpageContainer
        visible={activeSubpage === 'security'}
        onClose={() => setActiveSubpage(null)}
        title="Seguridad & Nube"
        subtitle="Copias de seguridad y cifrado"
      >
        <SecurityDataSubpage
          isCloudConnected={isCloudConnected}
          cloudSyncStatus={cloudSyncStatus}
          onForceSync={forceCloudSync}
          onExportData={exportAllUserData}
          onOpenImport={() => setIsImportModalOpen(true)}
          onOpenPrivacyNotice={() => setIsPrivacyNoticeOpen(true)}
          stats={{
            wishesCount: wishes.length,
            placesCount: savedPlaces.length,
            eventsCount: coupleEvents.length,
            ritualsCount: ritualSeeds.length,
          }}
          onClose={() => setActiveSubpage(null)}
        />
      </SettingsSubpageContainer>

      {/* 6. Logout Confirmation Modal */}
      <LogoutConfirmModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          logout();
        }}
        userName={currentDevUser.name}
      />

      {/* 7. Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalInputLabel}>Nombre o apodo</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nombre"
                placeholderTextColor="#9E8E98"
              />

              <PhotoUploadField
                label="Fotografía del perfil"
                placeholderText="Toca para subir una foto real"
                photoUrl={editPhotoUrl || null}
                imageUri={editPhotoUrl || null}
                onPhotoUploaded={(url) => setEditPhotoUrl(url || '')}
                onImageChange={(url) => setEditPhotoUrl(url || '')}
                onPhotoSelected={(url) => setEditPhotoUrl(url || '')}
                onPhotoRemoved={() => setEditPhotoUrl('')}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile}>
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. Privacy Notice Modal */}
      <PrivacyBetaNotice
        visible={isPrivacyNoticeOpen}
        onClose={() => setIsPrivacyNoticeOpen(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  headerBlock: {
    marginBottom: Spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF826A',
    letterSpacing: 1,
    fontFamily: 'Inter, sans-serif',
  },
  screenTitle: {
    ...Typography.h1,
    fontSize: 26,
    color: '#1E252B',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#766B72',
    marginTop: 2,
    lineHeight: 18,
  },
  coupleHeroRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  partnerMiniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  partnerMiniCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(224, 86, 102, 0.03)',
  },
  miniCardAvatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  miniCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  miniCardAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activePillBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  miniCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E252B',
  },
  miniCardRole: {
    fontSize: 11,
    color: '#766B72',
    marginTop: 1,
  },
  editPhotoLink: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(58, 47, 56, 0.05)',
  },
  editPhotoLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  settingsGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  navTextCol: {
    flex: 1,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E252B',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#766B72',
    marginTop: 2,
  },
  chevronText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#A79EA4',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
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
  settingActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
    marginLeft: 8,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    marginLeft: 54,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerNoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#766B72',
  },
  footerNoteSub: {
    fontSize: 11,
    color: '#A79EA4',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 25, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: '#1E252B',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#766B72',
    fontWeight: '700',
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
    fontSize: 14,
    color: '#1E252B',
    marginBottom: Spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#766B72',
  },
  modalSaveBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
