import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Typography, Layout, Space, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface TabItem {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                onTabPress(tab.id);
              }}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {tab.icon(isActive)}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? Colors.light.primary : Colors.light.textSecondary,
                    fontFamily: isActive ? Typography.family.bold : Typography.family.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Space[4],
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Space[4],
  },
  tabBar: {
    flexDirection: 'row',
    height: Layout.bottomTabBarHeight,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: Radius.pill,
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.floating,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    gap: 2,
  },
  tabButtonActive: {
    backgroundColor: Colors.light.primarySoft,
  },
  tabLabel: {
    fontSize: Typography.caption.fontSize,
    letterSpacing: Typography.caption.letterSpacing,
  },
});
