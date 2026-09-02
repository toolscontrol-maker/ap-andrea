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
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../context/DevContext';
import { Colors, ThemePalette } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';
import {
  IconUser,
  IconShield,
  IconBell,
  IconLock,
  IconCheck,
  IconSparkles,
  IconCamera,
  IconSliders,
  IconHeart,
  IconLogOut
} from '../ui/Icons';
import { pushNotificationService, NotificationPreferences } from '../../services/notifications/PushNotificationService';

// Subpages & Modals
import { AppearanceSettingsSubpage } from './AppearanceSettingsSubpage';
import { NotificationSettingsSubpage } from './NotificationSettingsSubpage';
import { FeedbackRecommendationsSubpage } from './FeedbackRecommendationsSubpage';
import { SecurityDataSubpage } from './SecurityDataSubpage';
import { CoupleMilestonesModal } from './CoupleMilestonesModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ChangeEmailModal } from './ChangeEmailModal';
import { SettingsSubpageContainer } from './SettingsSubpageContainer';
import { AndreaOnboardingModal } from '../onboarding/AndreaOnboardingModal';

interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ visible, onClose }: ProfileSettingsModalProps) {
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
    isCloudConnected,
    cloudSyncStatus,
    forceCloudSync,
    logout,
    currentEmail,
    changeAppPassword,
    user1Email,
    user2Email,
    changeUserEmail,
    themePalette,
    setThemePalette,
    exportAllUserData,
  } = useDev();

  // Subpage navigation state
  const [activeSubpage, setActiveSubpage] = useState<'appearance' | 'notifications' | 'milestones' | 'feedback' | 'security' | null>(null);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isChangeEmailVisible, setIsChangeEmailVisible] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Settings local state
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(pushNotificationService.getPreferences());
  const [pushPermission, setPushPermission] = useState<string>(pushNotificationService.getPermissionStatus());

  // Edit photo sub-modal
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentDevUser.name);
  const [editPhotoUrl, setEditPhotoUrl] = useState(currentDevUser.avatarPhoto || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const isTonet = activeRole === 'user1';
  const roleLabel = isTonet ? 'Novio & Creador' : 'Novia & Amor de mi vida';

  const handleOpenPhotoEditor = () => {
    triggerHaptic('selection');
    setEditName(currentDevUser.name);
    setEditPhotoUrl(currentDevUser.avatarPhoto || '');
    setIsPhotoModalVisible(true);
  };

  const handleSavePhotoProfile = async () => {
    triggerHaptic('selection');
    setIsSavingProfile(true);
    try {
      const finalName = editName.trim() || currentDevUser.name;
      await updateUserProfile(currentDevUser.id, {
        name: finalName,
        avatarPhoto: editPhotoUrl || undefined,
        avatar: finalName[0].toUpperCase(),
      });
      triggerHaptic('success');
      setIsPhotoModalVisible(false);
      Alert.alert('✨ Perfil Actualizado', `Tu perfil de ${finalName} se ha guardado con éxito.`);
    } catch (err) {
      Alert.alert('⚠️ Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSwitchUser = () => {
    triggerHaptic('medium');
    const newRole = activeRole === 'user1' ? 'user2' : 'user1';
    switchRole(newRole);
    Alert.alert('🔄 Perfil Cambiado', `Ahora estás en la cuenta de ${newRole === 'user1' ? users.user1.name : users.user2.name}.`);
  };

  // Notification handlers
  const handleTogglePushMaster = async () => {
    triggerHaptic('selection');
    if (pushPermission !== 'granted') {
      const granted = await pushNotificationService.requestPermission();
      setPushPermission(pushNotificationService.getPermissionStatus());
      if (granted) {
        const updated = await pushNotificationService.savePreferences({ enabled: true });
        setNotificationPrefs(updated);
        Alert.alert('🔔 ¡Notificaciones Activadas!', 'Tu iPhone está listo para recibir avisos de amor en tiempo real.');
      } else {
        Alert.alert(
          'Permiso de Notificación',
          'Para recibir notificaciones en iPhone: Abre la web en Safari, pulsa Compartir (⬆️) y "Añadir a pantalla de inicio". Luego ábrela y pulsa Permitir.'
        );
      }
    } else {
      const updated = await pushNotificationService.savePreferences({ enabled: !notificationPrefs.enabled });
      setNotificationPrefs(updated);
    }
  };

  const handleToggleCategory = async (key: keyof Omit<NotificationPreferences, 'enabled'>) => {
    triggerHaptic('selection');
    const updated = await pushNotificationService.savePreferences({ [key]: !notificationPrefs[key] });
    setNotificationPrefs(updated);
  };

  const handleTestNotification = async () => {
    triggerHaptic('medium');
    await pushNotificationService.triggerTestNotification();
    Alert.alert('💓 Notificación de Prueba', 'Se ha enviado un aviso de prueba a tu iPhone.');
  };

  const themeNameMap: Record<ThemePalette, string> = {
    atelier: 'Atelier Calme',
    velvet: 'Rosa Terciopelo',
    lavender: 'Lavanda Silvestre',
    olive: 'Salvia & Olivo',
    sunset: 'Atardecer en Canet',
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetCard}>
          {/* Top Bar Header */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.topBarTitle}>Cuenta y Perfil</Text>
            </View>
            <TouchableOpacity
              style={styles.closeCircle}
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. SINGLE ACTIVE USER PROFILE CARD */}
            <View style={styles.userHeroCard}>
              <TouchableOpacity style={styles.avatarWrapper} onPress={handleOpenPhotoEditor} activeOpacity={0.85}>
                {currentDevUser.avatarPhoto ? (
                  <Image source={{ uri: currentDevUser.avatarPhoto }} style={styles.avatarHeroImg} />
                ) : (
                  <View style={[styles.avatarHeroFallback, { backgroundColor: isTonet ? '#EF826A' : Colors.light.primary }]}>
                    <Text style={styles.avatarHeroText}>{currentDevUser.avatar}</Text>
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <IconCamera size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <Text style={styles.userNameTitle}>{currentDevUser.name}</Text>
              <Text style={styles.userRoleSubtitle}>{roleLabel}</Text>
              <Text style={styles.userEmailSubtitle}>{currentEmail || (isTonet ? 'hwrtseo@gmail.com' : 'andrea@amor.com')}</Text>

              <TouchableOpacity
                style={styles.editPhotoLinkBtn}
                onPress={handleOpenPhotoEditor}
                activeOpacity={0.8}
              >
                <Text style={styles.editPhotoLinkText}>Editar mi foto y nombre ›</Text>
              </TouchableOpacity>
            </View>

            {/* 2. SECCIÓN DIRECTA: CONFIGURACIÓN DE NOTIFICACIONES EN IPHONE */}
            <View style={styles.groupCard}>
              <Text style={styles.groupHeaderTitle}>NOTIFICACIONES & AVISOS EN IPHONE</Text>

              {/* Master Push Switch */}
              <View style={styles.groupRow}>
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(224, 86, 102, 0.12)' }]}>
                  <IconBell size={16} color={Colors.light.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Notificaciones Push en iPhone</Text>
                  <Text style={styles.rowSubtitle}>
                    {pushPermission === 'granted'
                      ? (notificationPrefs.enabled ? '🟢 Activadas en este dispositivo' : '⏸️ En pausa')
                      : '🔔 Toca para autorizar avisos'}
                  </Text>
                </View>
                <Switch
                  value={notificationPrefs.enabled && pushPermission === 'granted'}
                  onValueChange={handleTogglePushMaster}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              {/* Test Action */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={handleTestNotification}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(239, 130, 106, 0.12)' }]}>
                  <IconHeart size={16} color="#EF826A" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowTitle, { color: Colors.light.primary }]}>Probar Notificación en iPhone</Text>
                  <Text style={styles.rowSubtitle}>Envía un aviso de prueba con sonido y banner</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.light.primary }}>Probar 💓</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Category: Hearts */}
              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <Text style={{ fontSize: 14 }}>💓</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Latidos y Toques de Amor</Text>
                  <Text style={styles.rowSubtitle}>Avisos cuando tu pareja pulse el corazón</Text>
                </View>
                <Switch
                  value={notificationPrefs.hearts}
                  onValueChange={() => handleToggleCategory('hearts')}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              {/* Category: Wishes */}
              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <Text style={{ fontSize: 14 }}>🎁</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Nuevos Deseos e Ilusiones</Text>
                  <Text style={styles.rowSubtitle}>Avisos de regalos y planes añadidos</Text>
                </View>
                <Switch
                  value={notificationPrefs.wishes}
                  onValueChange={() => handleToggleCategory('wishes')}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              {/* Category: Surprises */}
              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <Text style={{ fontSize: 14 }}>🤫</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Sorpresas y Planes Secretos</Text>
                  <Text style={styles.rowSubtitle}>Aviso misterioso sin spoilers</Text>
                </View>
                <Switch
                  value={notificationPrefs.surprises}
                  onValueChange={() => handleToggleCategory('surprises')}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              {/* Category: Daily Check-in */}
              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <Text style={{ fontSize: 14 }}>🖤</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Check-in Diario de Encuentro</Text>
                  <Text style={styles.rowSubtitle}>Avisos al responder la pregunta diaria</Text>
                </View>
                <Switch
                  value={notificationPrefs.daily_checkin}
                  onValueChange={() => handleToggleCategory('daily_checkin')}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              {/* Category: Weekly Album */}
              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <Text style={{ fontSize: 14 }}>📸</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Álbum Semanal de Fotos</Text>
                  <Text style={styles.rowSubtitle}>Avisos al subir fotos de la semana</Text>
                </View>
                <Switch
                  value={notificationPrefs.weekly_album}
                  onValueChange={() => handleToggleCategory('weekly_album')}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.divider} />

              {/* Category: Calendar */}
              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <Text style={{ fontSize: 14 }}>🗓️</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Citas y Fechas Especiales</Text>
                  <Text style={styles.rowSubtitle}>Recordatorios de cenas y aniversarios</Text>
                </View>
                <Switch
                  value={notificationPrefs.calendar}
                  onValueChange={() => handleToggleCategory('calendar')}
                  trackColor={{ false: '#E6DFD5', true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* iPhone Guide Banner */}
            <View
              style={{
                backgroundColor: 'rgba(224, 86, 102, 0.05)',
                borderRadius: Radii.xl,
                padding: Spacing.md,
                marginBottom: Spacing.lg,
                borderWidth: 1,
                borderColor: 'rgba(224, 86, 102, 0.15)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 15, marginRight: 6 }}>📱</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.light.text, fontFamily: 'Inter, sans-serif' }}>
                  Cómo recibir Notificaciones en tu iPhone
                </Text>
              </View>
              <View style={{ gap: 4, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16, fontFamily: 'Inter, sans-serif' }}>
                  1. Abre <Text style={{ fontWeight: '700' }}>ap-andrea.vercel.app</Text> en Safari de tu iPhone.
                </Text>
                <Text style={{ fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16, fontFamily: 'Inter, sans-serif' }}>
                  2. Pulsa el botón <Text style={{ fontWeight: '700' }}>Compartir (⬆️)</Text> y elige <Text style={{ fontWeight: '700' }}>"Añadir a pantalla de inicio"</Text>.
                </Text>
                <Text style={{ fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16, fontFamily: 'Inter, sans-serif' }}>
                  3. Abre la app desde tu pantalla de inicio y pulsa <Text style={{ fontWeight: '700' }}>"Permitir"</Text>.
                </Text>
              </View>
            </View>

            {/* 3. PERSONALIZACIÓN & SUBPÁGINAS */}
            <View style={styles.groupCard}>
              <Text style={styles.groupHeaderTitle}>PERSONALIZACIÓN & EXPERIENCIA</Text>

              {/* Look & Appearance */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveSubpage('appearance');
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(239, 130, 106, 0.12)' }]}>
                  <Text style={{ fontSize: 15 }}>🎨</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Apariencia & Look de la App</Text>
                  <Text style={styles.rowSubtitle}>Tema: {themeNameMap[themePalette] || 'Atelier'}</Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Guía & Bienvenida */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setIsOnboardingModalOpen(true);
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(224, 86, 102, 0.15)' }]}>
                  <Text style={{ fontSize: 15 }}>🌸</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Guía de Bienvenida & Tutorial</Text>
                  <Text style={styles.rowSubtitle}>Descubre cada rincón y detalle que Tonet ha creado para ti</Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Milestones & Dates */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveSubpage('milestones');
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(244, 201, 93, 0.15)' }]}>
                  <Text style={{ fontSize: 15 }}>✨</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Hitos de Nuestra Historia & Fechas</Text>
                  <Text style={styles.rowSubtitle}>Aniversario (15 Feb), Conocerse, Cumpleaños</Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Feedback & Recommendations */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveSubpage('feedback');
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(158, 138, 205, 0.15)' }]}>
                  <Text style={{ fontSize: 15 }}>💌</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Enviar Recomendaciones & Ideas</Text>
                  <Text style={styles.rowSubtitle}>Buzón de planes, restaurantes y notas secretas</Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Security & Backup Subpage */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveSubpage('security');
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(94, 148, 112, 0.15)' }]}>
                  <Text style={{ fontSize: 15 }}>🔒</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Estado de Nube & Copias de Seguridad</Text>
                  <Text style={styles.rowSubtitle}>
                    {isCloudConnected ? '🟢 Supabase Conectado' : '🟡 Conectando'} · Copia JSON
                  </Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 4. ABAJO DEL TODO: CUENTA, ACCESO & SEGURIDAD */}
            <View style={styles.groupCard}>
              <Text style={styles.groupHeaderTitle}>CUENTA, ACCESO & SEGURIDAD</Text>

              {/* Switch Account -> Redirect to Login Page */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={async () => {
                  triggerHaptic('medium');
                  onClose();
                  await logout();
                  try {
                    router.replace('/(auth)/login');
                  } catch {
                    if (Platform.OS === 'web' && typeof window !== 'undefined') {
                      window.location.href = '/(auth)/login';
                    }
                  }
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(239, 130, 106, 0.12)' }]}>
                  <IconUser size={16} color="#EF826A" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Cambiar de Cuenta</Text>
                  <Text style={styles.rowSubtitle}>
                    Cerrar sesión actual e iniciar con la cuenta de {partnerDevUser.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.light.primary }}>Acceder ›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

                            {/* Change Email Action */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setIsChangeEmailVisible(true);
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(239, 130, 106, 0.12)' }]}>
                  <Text style={{ fontSize: 15 }}>✉️</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Cambiar Mi Correo de Acceso</Text>
                  <Text style={styles.rowSubtitle}>
                    {currentEmail || (activeRole === 'user1' ? user1Email : user2Email)}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF826A' }}>Editar ✉️</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Change Password Action */}
              <TouchableOpacity
                style={styles.groupRow}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setIsChangePasswordVisible(true);
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(94, 148, 112, 0.12)' }]}>
                  <IconLock size={16} color="#5E9470" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Cambiar Mi Contraseña de Perfil</Text>
                  <Text style={styles.rowSubtitle}>Actualizar mi clave personal para {currentDevUser.name}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#5E9470' }}>Editar 🔑</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Logout Action */}
              <TouchableOpacity
                style={[styles.groupRow, { paddingVertical: 14 }]}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic('selection');
                  setIsLogoutModalVisible(true);
                }}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(217, 93, 93, 0.10)' }]}>
                  <IconLogOut size={16} color="#D95D5D" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowTitle, { color: '#D95D5D', fontWeight: '700' }]}>
                    Cerrar Sesión
                  </Text>
                  <Text style={styles.rowSubtitle}>
                    Salir de {currentDevUser.name} ({currentEmail || (isTonet ? 'hwrtseo@gmail.com' : 'andrea@amor.com')})
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#D95D5D' }}>Salir</Text>
              </TouchableOpacity>
            </View>

            {/* Footer version */}
            <View style={styles.footerBrand}>
              <Text style={styles.footerBrandTitle}>Andrea & Tonet · Espacio Privado</Text>
              <Text style={styles.footerBrandDesc}>Cifrado y sincronizado en tiempo real</Text>
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
              onOpenImport={() => {}}
              onOpenPrivacyNotice={() => {}}
              stats={{
                wishesCount: wishes.length,
                placesCount: savedPlaces.length,
                eventsCount: coupleEvents.length,
                ritualsCount: ritualSeeds.length,
              }}
              onClose={() => setActiveSubpage(null)}
            />
          </SettingsSubpageContainer>

                    {/* Change Email Modal */}
          <ChangeEmailModal
            visible={isChangeEmailVisible}
            onClose={() => setIsChangeEmailVisible(false)}
            currentEmail={currentEmail || (activeRole === 'user1' ? user1Email : user2Email)}
            onChangeEmail={(newEmail) => changeUserEmail(activeRole, newEmail)}
            userName={currentDevUser.name}
          />

          {/* 6. Change Password Modal */}
          <ChangePasswordModal
            visible={isChangePasswordVisible}
            onClose={() => setIsChangePasswordVisible(false)}
            onChangePassword={changeAppPassword}
          />

          {/* 7. Logout Confirmation Modal */}
          <LogoutConfirmModal
            visible={isLogoutModalVisible}
            onClose={() => setIsLogoutModalVisible(false)}
            onConfirm={() => {
              setIsLogoutModalVisible(false);
              onClose();
              logout();
            }}
            userName={currentDevUser.name}
          />

          {/* Andrea Onboarding & Welcome Guide */}
          <AndreaOnboardingModal
            visible={isOnboardingModalOpen}
            onClose={() => setIsOnboardingModalOpen(false)}
            onComplete={() => setIsOnboardingModalOpen(false)}
          />

          {/* 8. Photo Editor Sub-Modal */}
          <Modal visible={isPhotoModalVisible} animationType="slide" transparent onRequestClose={() => setIsPhotoModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.sheetCard, { maxHeight: '85%' }]}>
                <View style={styles.topBar}>
                  <Text style={styles.topBarTitle}>Editar Mi Foto y Nombre</Text>
                  <TouchableOpacity style={styles.closeCircle} onPress={() => setIsPhotoModalVisible(false)}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.photoModalBody}>
                  <Text style={styles.inputLabel}>Tu Nombre o Apodo</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Ej. Andrea / Tonet"
                    placeholderTextColor="rgba(20, 19, 18, 0.4)"
                  />

                  <PhotoUploadField
                    label="Mi Fotografía de perfil"
                    placeholderText="Toca para subir una foto real"
                    photoUrl={editPhotoUrl || null}
                    imageUri={editPhotoUrl || null}
                    onPhotoUploaded={(url) => setEditPhotoUrl(url || '')}
                    onImageChange={(url) => setEditPhotoUrl(url || '')}
                    onPhotoSelected={(url) => setEditPhotoUrl(url || '')}
                    onPhotoRemoved={() => setEditPhotoUrl('')}
                  />

                  <TouchableOpacity
                    style={[styles.saveBtn, isSavingProfile && { opacity: 0.65 }]}
                    onPress={handleSavePhotoProfile}
                    disabled={isSavingProfile}
                    activeOpacity={0.85}
                  >
                    {isSavingProfile ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.saveBtnText}>Guardando y subiendo...</Text>
                      </View>
                    ) : (
                      <Text style={styles.saveBtnText}>Guardar Mi Perfil ✨</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
    ...Shadows.elevated,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.06)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarTitle: {
    ...Typography.h2,
    color: '#2B2129',
    fontSize: 20,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#2B2129',
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  userHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatarHeroImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarHeroFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarHeroText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userNameTitle: {
    ...Typography.h2,
    fontSize: 19,
    color: '#1E252B',
  },
  userRoleSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF826A',
    marginTop: 2,
  },
  userEmailSubtitle: {
    fontSize: 11.5,
    color: '#766B72',
    marginTop: 1,
  },
  editPhotoLinkBtn: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(58, 47, 56, 0.05)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  editPhotoLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  groupHeaderTitle: {
    ...Typography.caption,
    fontWeight: '800',
    color: '#766B72',
    fontSize: 11,
    letterSpacing: 0.8,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: '#2B2129',
    fontSize: 14,
  },
  rowSubtitle: {
    ...Typography.caption,
    color: '#766B72',
    fontSize: 12,
    marginTop: 1,
  },
  rowChevron: {
    fontSize: 18,
    color: '#A79EA4',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.05)',
    marginLeft: 44,
  },
  footerBrand: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  footerBrandTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#766B72',
    fontSize: 12,
  },
  footerBrandDesc: {
    ...Typography.caption,
    color: '#A79EA4',
    fontSize: 10.5,
    marginTop: 2,
  },
  photoModalBody: {
    padding: Spacing.lg,
  },
  inputLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 14,
    color: '#2B2129',
    marginBottom: Spacing.lg,
  },
  saveBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.subtle,
  },
  saveBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 15,
  },
});
