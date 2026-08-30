import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDev } from '../../context/DevContext';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { triggerHaptic } from '../../utils/haptics';

interface CloudSyncStatusBadgeProps {
  onPress?: () => void;
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({ onPress }) => {
  const { isCloudConnected, cloudSyncStatus } = useDev();

  const handlePress = () => {
    triggerHaptic('light');
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      style={styles.pillContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.statusDot, { backgroundColor: isCloudConnected ? '#34C759' : '#FF9500' }]} />
      <Text style={styles.statusLabel} numberOfLines={1}>
        {cloudSyncStatus}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontFamily: Typography.family.medium,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
});
