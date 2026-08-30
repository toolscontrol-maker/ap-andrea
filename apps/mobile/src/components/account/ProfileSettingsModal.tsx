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
} from 'react-native';
import { useDev } from '../../context/DevContext';
import { Colors } from '../../theme/colors';
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
} from '../ui/Icons';

import { INTRO_PHOTOS } from '../../constants/introImages';

interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ visible, onClose }: ProfileSettingsModalProps) {
  const {
    activeRole,
    switchRole,
    currentDevUser,
    partnerDevUser,
    updateUserProfile,
    isPremium,
    togglePremium,
  } = useDev();

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [secretSurpriseMode, setSecretSurpriseMode] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [romanticReminders, setRomanticReminders] = useState(true);

  // Edit photo sub-modal
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentDevUser.name);
  const [editPhotoUrl, setEditPhotoUrl] = useState(currentDevUser.avatarPhoto || '');

  const handleOpenPhotoEditor = () => {
    triggerHaptic('selection');
    setEditName(currentDevUser.name);
    setEditPhotoUrl(currentDevUser.avatarPhoto || '');
    setIsPhotoModalVisible(true);
  };

  const handleSavePhotoProfile = async () => {
    triggerHaptic('success');
    const finalName = editName.trim() || currentDevUser.name;
    await updateUserProfile(currentDevUser.id, {
      name: finalName,
      avatarPhoto: editPhotoUrl.trim() || undefined,
      avatar: finalName[0].toUpperCase(),
    });
    setIsPhotoModalVisible(false);
    Alert.alert('✨ Perfil Actualizado', 'Tu foto y datos se han guardado con éxito.');
  };

  const handleSwitchUser = () => {
    triggerHaptic('medium');
    const newRole = activeRole === 'user1' ? 'user2' : 'user1';
    switchRole(newRole);
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
            {/* 1. User Hero Profile Card */}
            <View style={styles.userHeroCard}>
              <View style={styles.avatarWrapper}>
                {currentDevUser.avatarPhoto ? (
                  <Image source={{ uri: currentDevUser.avatarPhoto }} style={styles.avatarHeroImg} />
                ) : (
                  <View style={[styles.avatarHeroFallback, { backgroundColor: Colors.light.primary }]}>
                    <Text style={styles.avatarHeroText}>{currentDevUser.avatar}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.avatarEditBadge}
                  onPress={handleOpenPhotoEditor}
                  activeOpacity={0.8}
                >
                  <IconCamera size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.userNameTitle}>{currentDevUser.name}</Text>
              <Text style={styles.userRoleSubtitle}>
                {activeRole === 'user2' ? 'Perfil Principal · Andrea' : 'Perfil Principal · Tonet'}
              </Text>

              {/* Perspective Switcher Button */}
              <TouchableOpacity
                style={styles.switchPerspectiveBtn}
                onPress={handleSwitchUser}
                activeOpacity={0.8}
              >
                <Text style={styles.switchPerspectiveText}>
                  ⇄ Cambiar a {partnerDevUser.name}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Group: Mi Perfil y Foto */}
            <View style={styles.groupCard}>
              <Text style={styles.groupHeaderTitle}>MI PERFIL</Text>
              <TouchableOpacity
                style={styles.groupRow}
                onPress={handleOpenPhotoEditor}
                activeOpacity={0.7}
              >
                <View style={styles.rowIconCircle}>
                  <IconUser size={16} color={Colors.light.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Editar Foto y Nombre</Text>
                  <Text style={styles.rowSubtitle}>Cambia tu retrato, estilo o apodo</Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Group: Privacidad y Bóveda */}
            <View style={styles.groupCard}>
              <Text style={styles.groupHeaderTitle}>PRIVACIDAD Y SEGURIDAD</Text>

              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <IconShield size={16} color={Colors.light.secondary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Protección Face ID / Biometría</Text>
                  <Text style={styles.rowSubtitle}>Bloquear la app al salir</Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={(val) => {
                    triggerHaptic('selection');
                    setBiometricsEnabled(val);
                  }}
                  trackColor={{ false: 'rgba(20, 19, 18, 0.1)', true: Colors.light.primary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <IconLock size={16} color={Colors.light.butter} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Modo Sorpresa Blindado</Text>
                  <Text style={styles.rowSubtitle}>Ocultar pistas en notificaciones</Text>
                </View>
                <Switch
                  value={secretSurpriseMode}
                  onValueChange={(val) => {
                    triggerHaptic('selection');
                    setSecretSurpriseMode(val);
                  }}
                  trackColor={{ false: 'rgba(20, 19, 18, 0.1)', true: Colors.light.primary }}
                />
              </View>
            </View>

            {/* 4. Group: Preferencias */}
            <View style={styles.groupCard}>
              <Text style={styles.groupHeaderTitle}>PREFERENCIAS</Text>

              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <IconBell size={16} color={Colors.light.sage} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Recordatorios Románticos</Text>
                  <Text style={styles.rowSubtitle}>Avisos suaves de fechas y planes</Text>
                </View>
                <Switch
                  value={romanticReminders}
                  onValueChange={(val) => {
                    triggerHaptic('selection');
                    setRomanticReminders(val);
                  }}
                  trackColor={{ false: 'rgba(20, 19, 18, 0.1)', true: Colors.light.primary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.groupRow}>
                <View style={styles.rowIconCircle}>
                  <IconSliders size={16} color={Colors.light.mistBlue} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Respuesta Háptica y Tacto</Text>
                  <Text style={styles.rowSubtitle}>Vibración táctil estilo Apple</Text>
                </View>
                <Switch
                  value={hapticFeedback}
                  onValueChange={(val) => {
                    triggerHaptic('selection');
                    setHapticFeedback(val);
                  }}
                  trackColor={{ false: 'rgba(20, 19, 18, 0.1)', true: Colors.light.primary }}
                />
              </View>
            </View>

            {/* Bottom App Info */}
            <View style={styles.footerInfo}>
              <Text style={styles.footerAppText}>Andrea App · Edición de Pareja</Text>
              <Text style={styles.footerVersionText}>v2.4.0 · Almacenamiento Local Privado</Text>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Sub-Modal for Editing Photo & Name */}
      <Modal visible={isPhotoModalVisible} animationType="fade" transparent onRequestClose={() => setIsPhotoModalVisible(false)}>
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalCard}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>Editar Foto de Perfil</Text>
              <TouchableOpacity onPress={() => setIsPhotoModalVisible(false)}>
                <Text style={styles.photoModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Live Preview */}
              <View style={styles.previewCenter}>
                {editPhotoUrl ? (
                  <Image source={{ uri: editPhotoUrl }} style={styles.previewAvatarImg} />
                ) : (
                  <View style={[styles.previewAvatarFallback, { backgroundColor: Colors.light.primary }]}>
                    <Text style={styles.previewAvatarFallbackText}>{editName ? editName[0] : 'A'}</Text>
                  </View>
                )}
              </View>

              {/* Name Input */}
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Tu Nombre</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nombre o apodo"
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>

              {/* Presets from Authentic Gallery */}
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Fotografías Reales de Vuestro Álbum</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
                  {INTRO_PHOTOS.map((photo, idx) => (
                    <TouchableOpacity
                      key={photo.id || idx}
                      style={[styles.presetThumb, editPhotoUrl === (photo.source.uri || photo.source) && styles.presetThumbActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        // Use the photo source object or asset uri
                        if (typeof photo.source === 'string') {
                          setEditPhotoUrl(photo.source);
                        } else if (photo.source && photo.source.uri) {
                          setEditPhotoUrl(photo.source.uri);
                        } else {
                          // Asset number or direct require
                          setEditPhotoUrl(photo.source);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={photo.source} style={styles.presetImg} resizeMode="cover" />
                      {editPhotoUrl === (photo.source.uri || photo.source) && (
                        <View style={styles.presetCheckmark}>
                          <IconCheck size={11} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Upload via Gallery / Camera */}
              <View style={styles.inputBlock}>
                <PhotoUploadField
                  imageUri={editPhotoUrl}
                  onImageChange={(uri) => setEditPhotoUrl(uri || '')}
                  label="Elegir foto de tu carrete o dispositivo"
                  placeholderText="Toca para permitir acceso a tu galería y elegir tu foto"
                  aspect={[1, 1]}
                />
              </View>
            </ScrollView>

            <View style={styles.photoModalFooter}>
              <TouchableOpacity
                style={styles.saveProfileBtn}
                onPress={handleSavePhotoProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.saveProfileBtnText}>Guardar Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 16, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '90%',
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    ...Shadows.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.light.text,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    ...Shadows.subtle,
  },
  closeIcon: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing['3xl'],
  },
  userHeroCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatarHeroImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHeroFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHeroText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  userNameTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 2,
  },
  userRoleSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: Spacing.md,
  },
  switchPerspectiveBtn: {
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.25)',
  },
  switchPerspectiveText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.primary,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  groupHeaderTitle: {
    ...Typography.overline,
    fontSize: 10.5,
    color: Colors.light.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  rowContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  rowTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.light.text,
  },
  rowSubtitle: {
    ...Typography.caption,
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  rowChevron: {
    fontSize: 18,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.04)',
    marginLeft: 42,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  footerAppText: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: Colors.light.textMuted,
  },
  footerVersionText: {
    ...Typography.caption,
    fontSize: 10.5,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 16, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  photoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  photoModalTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  photoModalClose: {
    fontSize: 16,
    color: Colors.light.textMuted,
    padding: 4,
  },
  previewCenter: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewAvatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  previewAvatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarFallbackText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputBlock: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.light.text,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.08)',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.light.text,
  },
  presetsScroll: {
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  presetThumb: {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetThumbActive: {
    borderColor: Colors.light.primary,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  presetCheckmark: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: Colors.light.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoModalFooter: {
    marginTop: Spacing.md,
  },
  saveProfileBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: Radii.full,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  saveProfileBtnText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
