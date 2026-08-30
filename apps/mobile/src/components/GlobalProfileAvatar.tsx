import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDev } from '../context/DevContext';
import { Colors } from '../theme/colors';
import { Radii, Shadows, Typography } from '../theme/tokens';
import { triggerHaptic } from '../utils/haptics';
import { ProfileSettingsModal } from './account/ProfileSettingsModal';

export function GlobalProfileAvatar() {
  const insets = useSafeAreaInsets();
  const { currentDevUser } = useDev();
  const [modalVisible, setModalVisible] = useState(false);

  const topOffset = Math.max(insets.top + 8, Platform.OS === 'web' ? 12 : 12);

  return (
    <>
      <View style={[styles.floatingContainer, { top: topOffset }]} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => {
            triggerHaptic('light');
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          {currentDevUser.avatarPhoto ? (
            <Image source={{ uri: currentDevUser.avatarPhoto }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: Colors.light.primary }]}>
              <Text style={styles.avatarFallbackText}>{currentDevUser.avatar}</Text>
            </View>
          )}

          {/* Micro Status / Settings Halo Badge */}
          <View style={styles.badgeHalo}>
            <Text style={styles.badgeIcon}>⚙</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Global Profile & Settings Modal Sheet */}
      <ProfileSettingsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
    backgroundColor: '#FFFFFF',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeHalo: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  badgeIcon: {
    fontSize: 9,
    color: Colors.light.textSecondary,
  },
});
