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
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { Badge } from '../../../src/components/ui/Badge';
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
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { triggerHaptic } from '../../../src/utils/haptics';
import { ConnectedCoupleHeart } from '../../../src/components/ui/ConnectedCoupleHeart';

const ANDREA_PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
];

const ANGEL_PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
];

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
    entries
  } = useDev();

  // Settings local state
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [secretSurpriseMode, setSecretSurpriseMode] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [romanticReminders, setRomanticReminders] = useState(true);

  // Profile edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string>(users.user2.id);
  const [editName, setEditName] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  // Anniversary & milestones calculation
  const ANNIVERSARY_DATE = new Date('2025-02-15');
  const FIRST_MET_DATE = new Date('2024-11-23');
  const now = new Date();
  const diffDays = Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceMet = Math.max(1, Math.floor((now.getTime() - FIRST_MET_DATE.getTime()) / (1000 * 60 * 60 * 24)));

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
    const finalName = editName.trim() || (isUser1 ? 'Ángel' : 'Andrea');
    await updateUserProfile(editingUserId, {
      name: finalName,
      avatarPhoto: editPhotoUrl.trim() || undefined,
      avatar: finalName[0].toUpperCase(),
    });
    setIsEditModalVisible(false);
    Alert.alert('✨ Perfil Actualizado', `La foto y los datos de ${finalName} se han guardado con éxito.`);
  };

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
      'Vuestro historial de recuerdos, deseos y calendario ha sido respaldado de forma segura y cifrada.'
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
            user1Name={users.user2.name}
            user1Avatar={users.user2.avatar}
            user1PhotoUrl={users.user2.avatarPhoto}
            onEditAvatar1={() => handleOpenEditProfile(users.user2.id)}
            user2Name={users.user1.name}
            user2Avatar={users.user1.avatar}
            user2PhotoUrl={users.user1.avatarPhoto}
            onEditAvatar2={() => handleOpenEditProfile(users.user1.id)}
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
              <Text style={styles.milestoneLocation}>Ent. Rico, 6, Quatre Carreres · Valencia</Text>
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
            <Text style={styles.statLabel}>Citas en Calendario</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>Recuerdos Vivos</Text>
          </View>
        </View>

        {/* PROFILES & PHOTOS EDITING SECTION */}
        <SectionHeader
          title="Perfiles & Fotografías"
          subtitle="Personaliza las fotos y nombres de Andrea & Ángel"
        />
        <View style={styles.settingsGroupCard}>
          {/* ANDREA PROFILE ROW */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => handleOpenEditProfile(users.user2.id)}
          >
            <View style={styles.userAvatarThumbWrapper}>
              {users.user2.avatarPhoto ? (
                <Image source={{ uri: users.user2.avatarPhoto }} style={styles.userAvatarThumb} />
              ) : (
                <View style={[styles.userAvatarThumb, { backgroundColor: Colors.light.primary }]}>
                  <Text style={styles.userAvatarThumbText}>{users.user2.avatar}</Text>
                </View>
              )}
              <View style={styles.thumbCameraBadge}>
                <IconCamera size={9} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Foto & Perfil de {users.user2.name}</Text>
              <Text style={styles.settingDesc}>Toca para cambiar foto, elegir retrato o editar nombre</Text>
            </View>
            <Text style={styles.settingActionText}>Editar</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* ANGEL PROFILE ROW */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => handleOpenEditProfile(users.user1.id)}
          >
            <View style={styles.userAvatarThumbWrapper}>
              {users.user1.avatarPhoto ? (
                <Image source={{ uri: users.user1.avatarPhoto }} style={styles.userAvatarThumb} />
              ) : (
                <View style={[styles.userAvatarThumb, { backgroundColor: Colors.light.secondary }]}>
                  <Text style={styles.userAvatarThumbText}>{users.user1.avatar}</Text>
                </View>
              )}
              <View style={[styles.thumbCameraBadge, { backgroundColor: Colors.light.secondary }]}>
                <IconCamera size={9} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Foto & Perfil de {users.user1.name}</Text>
              <Text style={styles.settingDesc}>Toca para cambiar foto, elegir retrato o editar nombre</Text>
            </View>
            <Text style={styles.settingActionText}>Editar</Text>
          </TouchableOpacity>
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

      {/* ── EDIT PROFILE MODAL ── */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* MODAL HEADER */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalEyebrow}>PERSONALIZAR PERFIL</Text>
                <Text style={styles.modalTitle}>
                  {editingUserId === users.user1.id ? 'Perfil de Ángel' : 'Perfil de Andrea'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {/* LIVE AVATAR PREVIEW */}
              <View style={styles.previewAvatarContainer}>
                <View style={styles.previewAvatarWrapper}>
                  {editPhotoUrl ? (
                    <Image source={{ uri: editPhotoUrl }} style={styles.previewAvatarImage} />
                  ) : (
                    <View
                      style={[
                        styles.previewAvatarImage,
                        styles.previewAvatarFallback,
                        {
                          backgroundColor:
                            editingUserId === users.user1.id
                              ? Colors.light.secondary
                              : Colors.light.primary,
                        },
                      ]}
                    >
                      <Text style={styles.previewAvatarFallbackText}>
                        {(editName.trim() || (editingUserId === users.user1.id ? 'Á' : 'A'))[0]}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.previewAvatarHint}>Vista previa en vivo de tu foto</Text>
              </View>

              {/* NAME INPUT */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre o Apodo</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Ej. Andrea, Ángel..."
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>

              {/* PHOTO PRESETS SELECTION */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Retratos y Estilos Sugeridos</Text>
                <Text style={styles.inputSublabel}>Selecciona en 1 toque una fotografía estética:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
                  {(editingUserId === users.user1.id ? ANGEL_PRESET_PHOTOS : ANDREA_PRESET_PHOTOS).map(
                    (url, idx) => {
                      const isSelected = editPhotoUrl === url;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.presetItem, isSelected && styles.presetItemSelected]}
                          activeOpacity={0.8}
                          onPress={() => {
                            triggerHaptic('selection');
                            setEditPhotoUrl(url);
                          }}
                        >
                          <Image source={{ uri: url }} style={styles.presetImage} />
                          {isSelected && (
                            <View style={styles.presetCheckmark}>
                              <IconCheck size={12} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }
                  )}
                </ScrollView>
              </View>

              {/* DEVICE UPLOAD VIA CAMERA / GALLERY */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subir Foto desde tu Dispositivo</Text>
                <PhotoUploadField
                  imageUri={editPhotoUrl}
                  onImageChange={(uri) => setEditPhotoUrl(uri || '')}
                  label=""
                  placeholderText="Toca para elegir foto de tu carrete o cámara"
                  aspect={[1, 1]}
                />
              </View>

              {/* DIRECT IMAGE URL INPUT */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>O pegar enlace directo de imagen (URL)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editPhotoUrl}
                  onChangeText={setEditPhotoUrl}
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor={Colors.light.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </ScrollView>

            {/* MODAL ACTION BUTTONS */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveBtnText}>Guardar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  userAvatarThumbWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  userAvatarThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 19, 18, 0.08)',
  },
  userAvatarThumbText: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  thumbCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] + 10 : Spacing.xl,
    maxHeight: '90%',
    ...Shadows.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.06)',
    paddingBottom: Spacing.sm,
  },
  modalEyebrow: {
    ...Typography.captionBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  modalTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.light.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  modalScrollView: {
    maxHeight: 460,
  },
  previewAvatarContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  previewAvatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    ...Shadows.md,
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  previewAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarFallbackText: {
    ...Typography.h1,
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  previewAvatarHint: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.captionBold,
    fontSize: 12.5,
    color: Colors.light.text,
    marginBottom: 4,
  },
  inputSublabel: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.1)',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 14,
    color: Colors.light.text,
  },
  presetsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
  },
  presetItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetItemSelected: {
    borderColor: Colors.light.primary,
    ...Shadows.sm,
  },
  presetImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  presetCheckmark: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 19, 18, 0.06)',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: '#F2EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    ...Typography.captionBold,
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  modalSaveBtnText: {
    ...Typography.captionBold,
    fontSize: 13.5,
    color: '#FFFFFF',
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
