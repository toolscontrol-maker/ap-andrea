import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Layout, Typography, Radii, Shadows } from '../../src/theme/tokens';
import { Text, Platform, View } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.light.surfaceElevated,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
          height: Layout.tabBarHeight,
          paddingBottom: Platform.OS === 'web' ? 12 : 14,
          paddingTop: 8,
          ...Shadows.md,
        },
        tabBarLabelStyle: {
          ...Typography.captionBold,
          fontSize: 10,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="surprises"
        options={{
          title: 'Sorpresas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎁" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="aya"
        options={{
          title: 'AYA Space',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
