import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Layout, Typography, Shadows } from '../../src/theme/tokens';
import { Platform } from 'react-native';
import {
  IconHome,
  IconHeart,
  IconCalendar,
  IconMapPin,
  IconSparkles
} from '../../src/components/ui/Icons';

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
          fontSize: 10.5,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Nido',
          tabBarIcon: ({ color, focused }) => (
            <IconHome
              size={20}
              color={color}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishes"
        options={{
          title: 'Deseos',
          tabBarIcon: ({ color, focused }) => (
            <IconHeart
              size={20}
              color={color}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <IconCalendar
              size={20}
              color={color}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <IconMapPin
              size={20}
              color={color}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="aya"
        options={{
          title: 'Andrea',
          tabBarIcon: ({ color, focused }) => (
            <IconSparkles
              size={20}
              color={color}
              strokeWidth={focused ? 2.2 : 1.75}
            />
          ),
        }}
      />
      {/* Retain surprises route internally without displaying separate tab */}
      <Tabs.Screen
        name="surprises"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
