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
          activeOpacity={0.85}
          accessibilityLabel={`Perfil de ${currentDevUser.name}`}
        >
          {currentDevUser.avatarPhoto ? (
            <Image source={{ uri: currentDevUser.avatarPhoto }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: Colors.light.primary }]}>
              <Text style={styles.avatarFallbackText}>{currentDevUser.avatar}</Text>
            </View>
          )}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 248, 242, 0.75)',
    backgroundColor: '#071124',
    ...Shadows.md,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
