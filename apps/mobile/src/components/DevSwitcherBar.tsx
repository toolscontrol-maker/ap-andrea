import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useDev } from '../context/DevContext';
import { Colors } from '../theme/colors';
import { Layout, Radii, Shadows, Spacing, Typography } from '../theme/tokens';
import { ModalWrapper, Button } from './ui';

export function DevSwitcherBar() {
  const {
    activeRole,
    currentDevUser,
    partnerDevUser,
    isPremium,
    user1Consent,
    user2Consent,
    switchRole,
    togglePremium,
    toggleUser1Consent,
    toggleUser2Consent,
  } = useDev();

  const [modalVisible, setModalVisible] = useState(false);

  const toggleUser = () => {
    switchRole(activeRole === 'user1' ? 'user2' : 'user1');
  };

  return (
    <>
      {/* Discreet Floating Glass Pill */}
      <View style={styles.floatingContainer} pointerEvents="box-none">
        <View style={styles.bar}>
          <TouchableOpacity style={styles.roleButton} onPress={toggleUser} activeOpacity={0.7}>
            <Text style={styles.roleText}>
              Ver como: <Text style={styles.roleName}>{currentDevUser.name}</Text>
            </Text>
            <Text style={styles.switchIcon}> ⇄ </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuButton} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
            <Text style={styles.menuButtonText}>Demo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Modal Wrapper */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Panel de Simulación"
        subtitle="Alterna roles y configuraciones en tiempo real:"
      >
        {/* Role Selector */}
        <Text style={styles.sectionTitle}>1. Persona Activa en la App:</Text>
        <View style={styles.rolesRow}>
          <TouchableOpacity
            style={[styles.roleCard, activeRole === 'user1' && styles.roleCardActive]}
            onPress={() => switchRole('user1')}
            activeOpacity={0.7}
          >
            <Text style={styles.roleAvatar}>Á</Text>
            <Text style={styles.roleCardName}>Ángel</Text>
            <Text style={styles.roleCardSub}>Usuario 1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, activeRole === 'user2' && styles.roleCardActive]}
            onPress={() => switchRole('user2')}
            activeOpacity={0.7}
          >
            <Text style={styles.roleAvatar}>A</Text>
            <Text style={styles.roleCardName}>Andrea</Text>
            <Text style={styles.roleCardSub}>Usuario 2</Text>
          </TouchableOpacity>
        </View>

        {/* Live Dynamic Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✨ Rol vivo actual de {currentDevUser.name}:</Text>
          <Text style={styles.infoDesc}>{currentDevUser.roleDescription}</Text>
        </View>

        {/* Premium Toggle */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>👑 Andrea Premium ("1 paga, 2 usan")</Text>
            <Text style={styles.switchDesc}>Habilita AYA ilimitado y recuerdos HD</Text>
          </View>
          <Switch
            value={isPremium}
            onValueChange={togglePremium}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          />
        </View>

        {/* AYA Consents */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>🔒 Consentimiento AYA de Ángel</Text>
            <Text style={styles.switchDesc}>Autoriza análisis de diario compartido</Text>
          </View>
          <Switch
            value={user1Consent}
            onValueChange={toggleUser1Consent}
            trackColor={{ false: Colors.light.border, true: Colors.light.secondary }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>🔒 Consentimiento AYA de Andrea</Text>
            <Text style={styles.switchDesc}>Autoriza análisis de diario compartido</Text>
          </View>
          <Switch
            value={user2Consent}
            onValueChange={toggleUser2Consent}
            trackColor={{ false: Colors.light.border, true: Colors.light.secondary }}
          />
        </View>

        <Button
          variant="primary"
          size="md"
          onPress={() => setModalVisible(false)}
          style={{ marginTop: Spacing.xl }}
        >
          Continuar explorando
        </Button>
      </ModalWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 33, 41, 0.92)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  roleText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#EAE5E8',
  },
  roleName: {
    color: '#FFB8A8',
    fontWeight: '800',
  },
  switchIcon: {
    color: '#FFB8A8',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 3,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: Spacing.sm,
  },
  menuButton: {
    paddingVertical: 1,
  },
  menuButtonText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.light.butter,
  },
  sectionTitle: {
    ...Typography.captionBold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  roleAvatar: {
    ...Typography.h2,
    color: Colors.light.primaryDark,
    marginBottom: 2,
  },
  roleCardName: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  roleCardSub: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: Colors.light.butterLight,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
  },
  infoTitle: {
    ...Typography.captionBold,
    color: '#8A6812',
    marginBottom: 2,
  },
  infoDesc: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  switchTitle: {
    ...Typography.captionBold,
    color: Colors.light.text,
  },
  switchDesc: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
});
