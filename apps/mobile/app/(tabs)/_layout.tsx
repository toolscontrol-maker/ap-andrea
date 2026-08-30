import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Layout, Typography, Shadows } from '../../src/theme/tokens';
import { Platform, View } from 'react-native';
import {
  IconHome,
  IconHeart,
  IconCalendar,
  IconMapPin,
  IconUser
} from '../../src/components/ui/Icons';
import { GlobalProfileAvatar } from '../../src/components/GlobalProfileAvatar';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Permanent Fixed Top-Right Circular Profile Avatar */}
      <GlobalProfileAvatar />

      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' ? 'rgba(253, 252, 250, 0.85)' : Colors.light.surfaceElevated,
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(25px) saturate(180%)',
                WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              } as any)
            : {}),
          borderTopColor: 'rgba(20, 19, 18, 0.08)',
          borderTopWidth: 1,
          borderRadius: 0,
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
          title: 'Calendario',
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
      {/* Hide Account from bottom bar, accessed via top-right profile avatar */}
      <Tabs.Screen
        name="account"
        options={{
          href: null,
        }}
      />
      {/* Retain aya & surprises routes internally without displaying separate tabs */}
      <Tabs.Screen
        name="aya"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="surprises"
        options={{
          href: null,
        }}
      />
    </Tabs>
  </View>
  );
}
